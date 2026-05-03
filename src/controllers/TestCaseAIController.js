import { GoogleGenerativeAI } from '@google/generative-ai';
import Problem from '../models/Problem.js';
import TestCase from '../models/TestCase.js';
import { generateTestInputs } from '../helpers/testCaseGenerator.js';

// Client is instantiated lazily so a missing GEMINI_API_KEY doesn't
// crash the server on startup — the route returns a clean 500 instead.
function getGeminiModel() {
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY).getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: buildSystemPrompt(),
    tools: [GENERATE_TOOL],
  });
}

const GENERATE_TOOL = {
  functionDeclarations: [
    {
      name: 'generate_test_cases',
      description:
        'Generate random test case inputs for a competitive programming problem. ' +
        'Define the parameter structure and constraints so the generator can produce valid random inputs.',
      parameters: {
        type: 'object',
        properties: {
          count: {
            type: 'integer',
            description: 'Number of test cases to generate (5-20)',
          },
          parameters: {
            type: 'array',
            description: 'Ordered list of input parameters, each with type and bounds',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string', description: 'Parameter name (e.g. "n", "nums", "target")' },
                type: {
                  type: 'string',
                  enum: ['int', 'float', 'string', 'array', 'matrix'],
                  description: 'Data type of this parameter',
                },
                min: { type: 'number', description: 'Minimum value (for int/float) or min element value (for array/matrix)' },
                max: { type: 'number', description: 'Maximum value (for int/float) or max element value (for array/matrix)' },
                minLength: { type: 'integer', description: 'Min length (for string or array without lengthParam)' },
                maxLength: { type: 'integer', description: 'Max length (for string or array without lengthParam)' },
                elementType: {
                  type: 'string',
                  enum: ['int', 'float', 'string'],
                  description: 'Element type for array/matrix',
                },
                lengthParam: {
                  type: 'string',
                  description: "Name of another parameter that defines this array's length (e.g. \"n\")",
                },
                charset: { type: 'string', description: 'Character set for string generation (default: lowercase a-z)' },
                minRows: { type: 'integer', description: 'Min rows for matrix' },
                maxRows: { type: 'integer', description: 'Max rows for matrix' },
                minCols: { type: 'integer', description: 'Min cols for matrix' },
                maxCols: { type: 'integer', description: 'Max cols for matrix' },
                rowsParam: { type: 'string', description: 'Parameter name defining matrix row count' },
                colsParam: { type: 'string', description: 'Parameter name defining matrix col count' },
                precision: { type: 'integer', description: 'Decimal precision for float values' },
              },
              required: ['name', 'type'],
            },
          },
          format: {
            type: 'string',
            description:
              'Format template for stdin. Use {paramName} placeholders. ' +
              'Example: "{n}\\n{nums}\\n{target}". If omitted, each param is on its own line.',
          },
        },
        required: ['count', 'parameters'],
      },
    },
  ],
};

function buildSystemPrompt() {
  return `You are an expert competitive programming test case generator.

Your job:
1. Read the problem statement and constraints carefully.
2. Call the generate_test_cases tool with structured parameter definitions that match the problem's input format.
   - Use SMALL constraint bounds for test generation (keep array lengths under 50, values under 10000) so test cases are manageable. The constraints in the problem show maximums, but test cases should use a reasonable subset.
   - Include edge cases: minimum values, boundary values, typical cases.
3. After receiving the generated inputs, compute the CORRECT expected output for EACH input.
   - Think step by step for each test case.
   - The output must match exactly what a correct solution would print to stdout.

IMPORTANT: The problem uses stdin/stdout format. Users read input from stdin and print output to stdout.

When returning final test cases, respond with a JSON array:
[{ "input": "...", "expectedOutput": "..." }, ...]

Return ONLY the JSON array, no other text.`;
}

function buildUserPrompt(problem) {
  const p = problem.statement || {};
  const parts = [
    `Problem: ${problem.title}`,
    `Difficulty: ${problem.difficulty}`,
    '',
    'Description:',
    ...(p.paragraphs || []),
    '',
  ];

  if (p.examples?.length) {
    parts.push('Examples:');
    p.examples.forEach((ex, i) => {
      parts.push(`Example ${i + 1}:`);
      if (ex.input) parts.push(`  Input: ${ex.input}`);
      if (ex.output) parts.push(`  Output: ${ex.output}`);
      if (ex.explanation) parts.push(`  Explanation: ${ex.explanation}`);
    });
    parts.push('');
  }

  if (p.constraints?.length) {
    parts.push('Constraints:');
    p.constraints.forEach((c) => parts.push(`  - ${c}`));
  }

  return parts.join('\n');
}

export const TestCaseAIController = {
  generate: async (req, res) => {
    try {
      const problem = await Problem.findById(req.params.id);
      if (!problem) return res.status(404).json({ success: false, message: 'Problem not found' });

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ success: false, message: 'GEMINI_API_KEY is not configured' });
      }

      const model = getGeminiModel();
      const chat = model.startChat();

      console.log(`[AI:generate] Starting test case generation for "${problem.title}" (${problem._id})`);
      console.log(`[AI:generate] Calling Gemini — step 1: analyze constraints + tool call`);

      // Step 1 — ask Gemini to analyse the problem and call the tool
      let result = await chat.sendMessage(buildUserPrompt(problem));
      let response = result.response;

      const functionCalls = response.functionCalls();

      if (functionCalls?.length) {
        const toolResults = [];

        for (const call of functionCalls) {
          if (call.name === 'generate_test_cases') {
            const args = call.args;
            console.log(`[AI:generate] Tool call — count: ${args.count}, params: ${args.parameters.map((p) => p.name).join(', ')}, format: ${args.format || 'default'}`);
            console.log(`[AI:generate] Parameter specs:`, JSON.stringify(args.parameters, null, 2));

            const inputs = generateTestInputs(args);
            console.log(`[AI:generate] Generated ${inputs.length} random inputs`);
            inputs.forEach((inp, i) => console.log(`[AI:generate]   Input[${i}]: ${JSON.stringify(inp.slice(0, 150))}`));

            toolResults.push({
              functionResponse: {
                name: call.name,
                response: { generatedInputs: inputs },
              },
            });
          }
        }

        // Step 2 — send tool results back, Gemini computes expected outputs
        console.log(`[AI:generate] Calling Gemini — step 2: compute expected outputs`);
        result = await chat.sendMessage(toolResults);
        response = result.response;
      }

      const content = response.text();
      console.log(`[AI:generate] Gemini final response (first 500 chars): ${content.slice(0, 500)}`);

      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        console.error(`[AI:generate] Could not parse JSON from Gemini response`);
        return res.status(500).json({ success: false, message: 'AI did not return valid test cases. Try again.' });
      }

      const testCases = JSON.parse(jsonMatch[0]);

      if (!Array.isArray(testCases) || testCases.length === 0) {
        return res.status(500).json({ success: false, message: 'AI returned empty test cases. Try again.' });
      }

      const docs = testCases
        .filter((tc) => tc.input !== undefined && tc.expectedOutput !== undefined)
        .map((tc) => ({
          problem: problem._id,
          input: String(tc.input),
          expectedOutput: String(tc.expectedOutput),
        }));

      console.log(`[AI:generate] Saving ${docs.length} test case(s) to DB`);
      docs.forEach((d, i) =>
        console.log(`[AI:generate]   [${i}] input=${JSON.stringify(d.input.slice(0, 100))} expected=${JSON.stringify(d.expectedOutput.slice(0, 100))}`)
      );

      const saved = await TestCase.insertMany(docs);
      console.log(`[AI:generate] Saved ${saved.length} test case(s) for "${problem.title}"`);

      res.status(201).json({ success: true, testCases: saved, count: saved.length });
    } catch (error) {
      console.error(`[AI:generate] Error:`, error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  },
};
