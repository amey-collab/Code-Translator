// C to JavaScript Converter

function convert(code) {
    let result = '';
    const lines = code.split('\n');
    let indentLevel = 0;

    for (let line of lines) {
        const trimmed = line.trim();
        if (trimmed === '') { result += '\n'; continue; }

        if (trimmed.startsWith('#include')) { result += '// ' + trimmed + '\n'; continue; }
        if (trimmed.startsWith('//')) { result += '    '.repeat(indentLevel) + trimmed + '\n'; continue; }

        // printf -> console.log
        if (trimmed.includes('printf')) {
            const m = trimmed.match(/printf\s*\(\s*"([^"]*)"\s*((?:,\s*[^,)]+)*)\s*\)\s*;/);
            if (m) {
                let fmt = m[1].replace(/\\n/g, '');
                const args = m[2] ? m[2].split(',').map(a => a.trim()).filter(Boolean) : [];
                if (args.length) {
                    args.forEach(a => { fmt = fmt.replace(/%[difs]/, '${' + a + '}'); });
                    result += '    '.repeat(indentLevel) + `console.log(\`${fmt}\`);\n`;
                } else {
                    result += '    '.repeat(indentLevel) + `console.log("${fmt}");\n`;
                }
                continue;
            }
        }

        // scanf -> prompt
        if (trimmed.includes('scanf')) {
            const m = trimmed.match(/scanf\s*\(\s*"[^"]*"\s*,\s*&(\w+)\s*\)\s*;/);
            if (m) { result += '    '.repeat(indentLevel) + `let ${m[1]} = parseInt(prompt("Enter value:"));\n`; continue; }
        }

        // Function definitions
        const funcMatch = trimmed.match(/^(?:void|int|float|double|char\*?|long)\s+(\w+)\s*\((.*)\)\s*\{?\s*$/);
        if (funcMatch) {
            const params = convertParams(funcMatch[2]);
            result += `function ${funcMatch[1]}(${params}) {\n`;
            indentLevel++;
            continue;
        }

        const ifMatch = trimmed.match(/^if\s*\((.*)\)\s*\{?\s*$/);
        if (ifMatch) { result += '    '.repeat(indentLevel) + `if (${ifMatch[1]}) {\n`; indentLevel++; continue; }

        const elseIfMatch = trimmed.match(/^}\s*else\s+if\s*\((.*)\)\s*\{?\s*$/);
        if (elseIfMatch) { indentLevel--; result += '    '.repeat(indentLevel) + `} else if (${elseIfMatch[1]}) {\n`; indentLevel++; continue; }

        if (trimmed === '} else {' || trimmed === 'else {') { indentLevel--; result += '    '.repeat(indentLevel) + '} else {\n'; indentLevel++; continue; }

        const forMatch = trimmed.match(/^for\s*\(\s*(?:int\s+)?(\w+)\s*=\s*(\w+)\s*;\s*\w+\s*<\s*(\w+)\s*;\s*\w+\+\+\s*\)\s*\{?\s*$/);
        if (forMatch) {
            result += '    '.repeat(indentLevel) + `for (let ${forMatch[1]} = ${forMatch[2]}; ${forMatch[1]} < ${forMatch[3]}; ${forMatch[1]}++) {\n`;
            indentLevel++; continue;
        }

        const whileMatch = trimmed.match(/^while\s*\((.*)\)\s*\{?\s*$/);
        if (whileMatch) { result += '    '.repeat(indentLevel) + `while (${whileMatch[1]}) {\n`; indentLevel++; continue; }

        const returnMatch = trimmed.match(/^return\s+(.*);$/);
        if (returnMatch) { result += '    '.repeat(indentLevel) + `return ${returnMatch[1].replace(/\bNULL\b/g, 'null')};\n`; continue; }

        if (trimmed === '}' || trimmed === '};') {
            if (indentLevel > 0) { indentLevel--; result += '    '.repeat(indentLevel) + '}\n'; }
            continue;
        }
        if (trimmed === '{') continue;

        const varMatch = trimmed.match(/^(?:int|float|double|char\*?|bool|long)\s+(\w+)\s*=\s*(.*);$/);
        if (varMatch) {
            result += '    '.repeat(indentLevel) + `let ${varMatch[1]} = ${varMatch[2].replace(/\bNULL\b/g, 'null')};\n`; continue;
        }

        if (trimmed !== '{') {
            if (trimmed.endsWith(';')) result += '    '.repeat(indentLevel) + trimmed.replace(/\bNULL\b/g, 'null') + '\n';
            else result += '    '.repeat(indentLevel) + '// ' + trimmed + '\n';
        }
    }

    if (result.includes('function main(')) result += '\n// Run main\nmain();\n';
    return result;
}

function convertParams(params) {
    if (!params || params.trim() === '' || params.trim() === 'void') return '';
    return params.split(',').map(p => p.trim()).filter(p => p && p !== 'void').map(p => {
        const parts = p.split(/\s+/);
        return parts[parts.length - 1].replace(/[*&]/g, '');
    }).join(', ');
}

module.exports = { convert };
