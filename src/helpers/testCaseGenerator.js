function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min, max, precision = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(precision));
}

function randString(minLen, maxLen, charset = 'abcdefghijklmnopqrstuvwxyz') {
  const len = randInt(minLen, maxLen);
  let s = '';
  for (let i = 0; i < len; i++) s += charset[randInt(0, charset.length - 1)];
  return s;
}

function generateValue(param, context) {
  const { type } = param;

  if (type === 'int') {
    return randInt(param.min ?? 0, param.max ?? 100);
  }

  if (type === 'float') {
    return randFloat(param.min ?? 0, param.max ?? 100, param.precision ?? 2);
  }

  if (type === 'string') {
    return randString(param.minLength ?? 1, param.maxLength ?? 10, param.charset || 'abcdefghijklmnopqrstuvwxyz');
  }

  if (type === 'array') {
    const length = param.lengthParam
      ? context[param.lengthParam]
      : randInt(param.minLength ?? 1, param.maxLength ?? 10);
    const arr = [];
    for (let i = 0; i < length; i++) {
      if (param.elementType === 'int') {
        arr.push(randInt(param.min ?? 0, param.max ?? 100));
      } else if (param.elementType === 'float') {
        arr.push(randFloat(param.min ?? 0, param.max ?? 100, param.precision ?? 2));
      } else if (param.elementType === 'string') {
        arr.push(randString(param.minLength ?? 1, param.maxLength ?? 10, param.charset || 'abcdefghijklmnopqrstuvwxyz'));
      } else {
        arr.push(randInt(0, 100));
      }
    }
    return arr;
  }

  if (type === 'matrix') {
    const rows = param.rowsParam ? context[param.rowsParam] : randInt(param.minRows ?? 1, param.maxRows ?? 5);
    const cols = param.colsParam ? context[param.colsParam] : randInt(param.minCols ?? 1, param.maxCols ?? 5);
    const matrix = [];
    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c < cols; c++) {
        row.push(randInt(param.min ?? 0, param.max ?? 100));
      }
      matrix.push(row);
    }
    return matrix;
  }

  return randInt(0, 100);
}

function formatValue(value) {
  if (Array.isArray(value)) {
    if (value.length > 0 && Array.isArray(value[0])) {
      return value.map((row) => row.join(' ')).join('\n');
    }
    return value.join(' ');
  }
  return String(value);
}

export function generateTestInputs({ parameters, count, format }) {
  const inputs = [];

  for (let i = 0; i < count; i++) {
    const context = {};
    const values = {};

    for (const param of parameters) {
      const val = generateValue(param, context);
      context[param.name] = Array.isArray(val) ? val.length : val;
      values[param.name] = val;
    }

    let input;
    if (format) {
      input = format.replace(/\{(\w+)\}/g, (_, key) => formatValue(values[key] ?? ''));
    } else {
      input = parameters.map((p) => formatValue(values[p.name])).join('\n');
    }

    inputs.push(input);
  }

  return inputs;
}
