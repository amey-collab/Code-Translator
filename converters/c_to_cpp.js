// C to C++ Converter

function convert(code) {
    let result = '#include <iostream>\n#include <string>\n#include <vector>\nusing namespace std;\n\n';
    const lines = code.split('\n');
    let indentLevel = 0;

    for (let line of lines) {
        const trimmed = line.trim();
        if (trimmed === '') { result += '\n'; continue; }

        // Replace C headers with C++ equivalents
        if (trimmed.startsWith('#include <stdio.h>')) continue;
        if (trimmed.startsWith('#include <string.h>')) continue;
        if (trimmed.startsWith('#include <stdlib.h>')) { result += '#include <cstdlib>\n'; continue; }
        if (trimmed.startsWith('#include')) { result += trimmed + '\n'; continue; }

        if (trimmed.startsWith('//')) { result += '    '.repeat(indentLevel) + trimmed + '\n'; continue; }

        // printf -> cout
        if (trimmed.includes('printf')) {
            const m = trimmed.match(/printf\s*\(\s*"([^"]*)"\s*((?:,\s*[^,)]+)*)\s*\)\s*;/);
            if (m) {
                let fmt = m[1].replace(/\\n/g, '');
                const args = m[2] ? m[2].split(',').map(a => a.trim()).filter(Boolean) : [];
                if (args.length) {
                    // Build cout chain
                    let parts = [];
                    let remaining = fmt;
                    args.forEach(a => {
                        const idx = remaining.indexOf('%');
                        if (idx >= 0) {
                            if (idx > 0) parts.push(`"${remaining.slice(0, idx)}"`);
                            parts.push(a);
                            remaining = remaining.slice(idx + 2); // skip %d/%s etc
                        }
                    });
                    if (remaining) parts.push(`"${remaining}"`);
                    result += '    '.repeat(indentLevel) + `cout << ${parts.join(' << ')} << endl;\n`;
                } else {
                    result += '    '.repeat(indentLevel) + `cout << "${fmt}" << endl;\n`;
                }
                continue;
            }
        }

        // scanf -> cin
        if (trimmed.includes('scanf')) {
            const m = trimmed.match(/scanf\s*\(\s*"[^"]*"\s*,\s*&(\w+)\s*\)\s*;/);
            if (m) { result += '    '.repeat(indentLevel) + `cin >> ${m[1]};\n`; continue; }
        }

        // Function definitions
        const funcMatch = trimmed.match(/^(?:void|int|float|double|char\*?|long)\s+(\w+)\s*\((.*)\)\s*\{?\s*$/);
        if (funcMatch) {
            let rt = trimmed.split(/\s+/)[0];
            const params = funcMatch[2].replace(/\bchar\s*\*/g, 'string');
            if (funcMatch[1] === 'main') result += 'int main() {\n';
            else result += `${rt} ${funcMatch[1]}(${params}) {\n`;
            indentLevel++;
            continue;
        }

        const ifMatch = trimmed.match(/^if\s*\((.*)\)\s*\{?\s*$/);
        if (ifMatch) { result += '    '.repeat(indentLevel) + `if (${ifMatch[1]}) {\n`; indentLevel++; continue; }

        const elseIfMatch = trimmed.match(/^}\s*else\s+if\s*\((.*)\)\s*\{?\s*$/);
        if (elseIfMatch) { indentLevel--; result += '    '.repeat(indentLevel) + `} else if (${elseIfMatch[1]}) {\n`; indentLevel++; continue; }

        if (trimmed === '} else {' || trimmed === 'else {') { indentLevel--; result += '    '.repeat(indentLevel) + '} else {\n'; indentLevel++; continue; }

        const forMatch = trimmed.match(/^for\s*\((.*)\)\s*\{?\s*$/);
        if (forMatch) { result += '    '.repeat(indentLevel) + `for (${forMatch[1]}) {\n`; indentLevel++; continue; }

        const whileMatch = trimmed.match(/^while\s*\((.*)\)\s*\{?\s*$/);
        if (whileMatch) { result += '    '.repeat(indentLevel) + `while (${whileMatch[1]}) {\n`; indentLevel++; continue; }

        const returnMatch = trimmed.match(/^return\s+(.*);$/);
        if (returnMatch) { result += '    '.repeat(indentLevel) + `return ${returnMatch[1]};\n`; continue; }

        if (trimmed === '}' || trimmed === '};') {
            if (indentLevel > 0) { indentLevel--; result += '    '.repeat(indentLevel) + '}\n'; }
            continue;
        }
        if (trimmed === '{') continue;

        // Convert char* string vars to string
        let converted = trimmed.replace(/char\s*\*\s*(\w+)\s*=\s*"([^"]*)"/g, 'string $1 = "$2"')
            .replace(/\bNULL\b/g, 'nullptr');
        result += '    '.repeat(indentLevel) + converted + '\n';
    }

    return result;
}

module.exports = { convert };
