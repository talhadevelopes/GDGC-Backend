import Problem from '../models/Problem.js';

const GRAPHQL_URL = 'https://leetcode.com/graphql';
const QUERY = `query getQuestionDetail($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    title
    titleSlug
    difficulty
    content
    exampleTestcases
    sampleTestCase
    topicTags { name }
  }
}`;

function extractSlug(input) {
  const trimmed = input.trim().replace(/\/+$/, '');
  const match = trimmed.match(/leetcode\.com\/problems\/([a-z0-9-]+)/);
  if (match) return match[1];
  if (/^[a-z0-9-]+$/.test(trimmed)) return trimmed;
  return null;
}

function stripHtml(html) {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?p>/gi, '\n')
    .replace(/<\/?li>/gi, '')
    .replace(/<\/?ul>/gi, '\n')
    .replace(/<\/?ol>/gi, '\n')
    .replace(/<code>/gi, '`')
    .replace(/<\/code>/gi, '`')
    .replace(/<sup>/gi, '^')
    .replace(/<\/sup>/gi, '')
    .replace(/<strong>/gi, '**')
    .replace(/<\/strong>/gi, '**')
    .replace(/<em>/gi, '*')
    .replace(/<\/em>/gi, '*')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function parseContent(html) {
  const paragraphs = [];
  const examples = [];
  const constraints = [];

  const constraintMatch = html.match(/<p><strong>Constraints:<\/strong><\/p>\s*<ul>([\s\S]*?)<\/ul>/i);
  if (constraintMatch) {
    const items = constraintMatch[1].match(/<li>([\s\S]*?)<\/li>/gi) || [];
    items.forEach((li) => {
      const text = stripHtml(li).trim();
      if (text) constraints.push(text);
    });
  }

  const exampleBlocks = html.split(/<p><strong class="example">Example\s*\d+:<\/strong><\/p>/i);
  const descriptionHtml = exampleBlocks[0];

  const descText = stripHtml(descriptionHtml).trim();
  descText.split(/\n\n+/).forEach((p) => {
    const trimmed = p.trim();
    if (trimmed && !trimmed.startsWith('Constraints:')) paragraphs.push(trimmed);
  });

  for (let i = 1; i < exampleBlocks.length; i++) {
    const block = exampleBlocks[i];
    const inputMatch = block.match(/<strong>Input:<\/strong>\s*([\s\S]*?)(?=<strong>|<\/pre>)/i);
    const outputMatch = block.match(/<strong>Output:<\/strong>\s*([\s\S]*?)(?=<strong>|<\/pre>)/i);
    const explanationMatch = block.match(/<strong>Explanation:<\/strong>\s*([\s\S]*?)(?=<\/pre>|$)/i);

    examples.push({
      input: inputMatch ? stripHtml(inputMatch[1]).trim() : '',
      output: outputMatch ? stripHtml(outputMatch[1]).trim() : '',
      explanation: explanationMatch ? stripHtml(explanationMatch[1]).trim() : '',
    });
  }

  return { paragraphs, examples, constraints };
}

export const LeetcodeImporter = {
  import: async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) return res.status(400).json({ success: false, message: 'url is required' });

      const slug = extractSlug(url);
      if (!slug) return res.status(400).json({ success: false, message: 'Could not parse LeetCode problem slug from input' });

      console.log(`[LeetCode:import] Fetching slug: ${slug}`);

      const response = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Referer: 'https://leetcode.com',
        },
        body: JSON.stringify({ query: QUERY, variables: { titleSlug: slug } }),
      });

      const json = await response.json();
      const q = json?.data?.question;
      if (!q) {
        console.log(`[LeetCode:import] Problem not found for slug: ${slug}`);
        return res.status(404).json({ success: false, message: `LeetCode problem "${slug}" not found` });
      }

      console.log(`[LeetCode:import] Got: "${q.title}" (${q.difficulty})`);

      const { paragraphs, examples, constraints } = parseContent(q.content || '');

      const tags = (q.topicTags || []).map((t) => t.name);

      const problem = await Problem.create({
        title: q.title,
        difficulty: q.difficulty.toLowerCase(),
        tags,
        statement: { paragraphs, examples, constraints },
        allowedLanguages: ['javascript', 'python', 'cpp', 'java'],
        defaultLanguage: 'javascript',
      });

      console.log(`[LeetCode:import] Created problem: ${problem._id} — "${problem.title}"`);
      res.status(201).json({ success: true, problem });
    } catch (error) {
      console.error(`[LeetCode:import] Error:`, error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  },
};
