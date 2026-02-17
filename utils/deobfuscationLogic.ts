
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

/**
 * Detects and reverses the common "Array Rotation" obfuscation pattern.
 * Logic: (function(arr, count) { ... while(--count) { arr.push(arr.shift()); } })(pool, offset);
 */
export const resolveArrayRotations = (code: string): string => {
  // 1. Identify the string pool array definition
  // Pattern: const _0x1234 = ['a', 'b', 'c'];
  const poolMatch = code.match(/const\s+([_a-zA-Z0-9$]+)\s*=\s*(\[[^\]]+\]);/);
  if (!poolMatch) return code;

  const arrayName = poolMatch[1];
  let arrayContent: string[] = [];
  try {
    // Basic extraction - convert ['\x61'] style to real strings
    const rawArray = poolMatch[2].replace(/'/g, '"');
    arrayContent = JSON.parse(rawArray);
  } catch (e) {
    return code; // Failed to parse array
  }

  // 2. Identify the rotation function call
  // Pattern: (function(arr, count) { ... push(arr.shift()) ... })(_0x1234, 0xabc);
  const rotationRegex = new RegExp(
    `\\(function\\s*\\([^,]+,\\s*([^\\)]+)\\)\\s*\\{[\\s\\S]+?push\\([^\\.]+\\.shift\\(\\)\\)[\\s\\S]+?\\}\\s*\\)\\s*\\(\\s*${arrayName}\\s*,\\s*(0x[a-fA-F0-9]+|\\d+)\\s*\\)`,
    'm'
  );

  const rotMatch = code.match(rotationRegex);
  if (!rotMatch) return code;

  const rawOffset = rotMatch[2];
  const offset = parseInt(rawOffset);

  if (isNaN(offset)) return code;

  // 3. Perform the inverse rotation on the extracted array
  // The obfuscator loop is: while(--offset) { arr.push(arr.shift()) }
  // To reverse: We do the rotation logic locally
  const rotatedArray = [...arrayContent];
  let count = offset;
  
  // The obfuscator uses `++offset` inside the IIFE usually, 
  // and the loop is `while (--offset)`. 
  // We simulate the exact logic found in the script.
  let internalCount = count + 1;
  while (--internalCount) {
    const item = rotatedArray.shift();
    if (item !== undefined) rotatedArray.push(item);
  }

  // 4. Reconstruct the code
  // Replace the old array with the NEW rotated array
  const newArrayString = `const ${arrayName} = ${JSON.stringify(rotatedArray)};`;
  let newCode = code.replace(poolMatch[0], newArrayString);

  // Remove the rotation block (it's no longer needed and would break the logic if kept)
  newCode = newCode.replace(rotMatch[0], `/* [DFIR] Array rotation of ${rawOffset} reversed & neutralized */`);

  return newCode;
};

/**
 * Automatically extracts Indicators of Compromise (IoCs) using static regex patterns.
 * Scans for: IP addresses, URLs, Domains, and File Hashes (MD5, SHA1, SHA256).
 */
export const staticIocScan = (code: string): { type: string; value: string; context: string }[] => {
  const iocs: { type: string; value: string; context: string }[] = [];
  
  const patterns = [
    { type: 'IP', regex: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g },
    { type: 'URL', regex: /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi },
    { type: 'DOMAIN', regex: /\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:com|net|org|edu|gov|mil|biz|info|mobi|name|aero|asia|jobs|museum|io|xyz|[a-z]{2})\b/gi },
    { type: 'MD5', regex: /\b[a-fA-F0-9]{32}\b/g },
    { type: 'SHA1', regex: /\b[a-fA-F0-9]{40}\b/g },
    { type: 'SHA256', regex: /\b[a-fA-F0-9]{64}\b/g },
  ];

  patterns.forEach(({ type, regex }) => {
    const matches = code.match(regex);
    if (matches) {
      // De-duplicate results for each pattern type
      [...new Set(matches)].forEach(match => {
        // Exclude common false positives for domains (like .length, .push)
        const commonJsKeywords = ['.length', '.push', '.shift', '.slice', '.join', '.sort'];
        if (type === 'DOMAIN' && commonJsKeywords.some(kw => match.toLowerCase().endsWith(kw))) {
          return;
        }
        
        iocs.push({ type, value: match, context: 'Static Signature Match' });
      });
    }
  });

  return iocs;
};

export const extractStringPool = (code: string): { arrayName: string; strings: string[] } | null => {
  const arrayRegex = /const\s+(_0x[a-f0-9]+)\s*=\s*(\[[^\]]+\]);/i;
  const match = code.match(arrayRegex);
  if (match) {
    try {
      const arr = JSON.parse(match[2].replace(/'/g, '"'));
      return { arrayName: match[1], strings: arr };
    } catch (e) {
      console.warn("Failed to parse string pool", e);
    }
  }
  return null;
};
