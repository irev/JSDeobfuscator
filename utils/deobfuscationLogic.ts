
export const stabilizeCode = (code: string): string => {
  // Simple beautifier implementation for the first pass
  let result = code
    .replace(/{/g, ' {\n')
    .replace(/}/g, '\n}\n')
    .replace(/;/g, ';\n')
    .replace(/,/g, ', ')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n');

  let indent = 0;
  const lines = result.split('\n');
  result = lines.map(line => {
    if (line.includes('}')) indent = Math.max(0, indent - 1);
    const indented = '  '.repeat(indent) + line;
    if (line.includes('{')) indent++;
    return indented;
  }).join('\n');

  return result;
};

export const decodeHexEscapes = (code: string): string => {
  return code.replace(/\\x([0-9a-fA-F]{2})/g, (match, hex) => {
    return String.fromCharCode(parseInt(hex, 16));
  });
};

export const extractStringPool = (code: string): { arrayName: string; strings: string[] } | null => {
  const arrayRegex = /const\s+(_0x[a-f0-9]+)\s*=\s*(\[[^\]]+\]);/i;
  const match = code.match(arrayRegex);
  if (match) {
    try {
      // Evaluate string array carefully - only for known patterns
      const arr = JSON.parse(match[2].replace(/'/g, '"'));
      return { arrayName: match[1], strings: arr };
    } catch (e) {
      console.warn("Failed to parse string pool", e);
    }
  }
  return null;
};
