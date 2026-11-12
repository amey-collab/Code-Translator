// C++ to JavaScript Converter

function convert(code) {
    let result = '';
    const lines = code.split('\n');
    let indentLevel = 0;

    for (let line of lines) {
        const trimmed = line.trim();
        if (trimmed === '') { result += '\n'; continue; }

        if (trimmed.startsWith('#include')) { result += '// ' + trimmed + '\n'; continue; }
        if (trimmed.startsWith('using namespace')) continue;

        if (trimmed.startsWith('//')) { result += '    '.repeat(indentLevel) + trimmed + '\n'; continue; }

        // cout with chained <<
        if (trimmed.includes('cout')) {
            const coutLine = trimmed.replace(/^\s*cout\s*/, '').replace(/\s*<<\s*endl\s*;?\s*$/, '').replace(/;\s*$/, '');
            const parts = coutLine.split(/\s*<<\s*/).map(p => p.trim()).filter(Boolean);
            if (parts.length === 1) {
                result += '    '.repeat(indentLevel) + `console.log(${parts[0]});\n`;
            } else {
                const expr = parts.join(' + ');
                result += '    '.repeat(indentLevel) + `console.log(${expr});\n`;
            }
            continue;
        }

        // printf
        if (trimmed.includes('printf')) {
            const m = trimmed.match(/printf\s*\(\s*"([^"]*)"\s*((?:,\s*[^,)]+)*)\s*\)\s*;/);
            if (m) {
                let fmt = m[1].replace(/\\n/g, '');
                const args = m[2] ? m[2].split(',').map(a => a.trim()).filter(Boolean) : [];
                args.forEach(a => { fmt = fmt.replace(/%[difs]/, '${' + a + '}'); });
                result += '    '.repeat(indentLevel) + `console.log(\`${fmt}\`);\n`;
                continue;
            }
        }

        // Function definitions
        const funcMatch = trimmed.match(/^(?:void|int|float|double|string|bool|char|auto|long)\s+(\w+)\s*\((.*)\)\s*\{?\s*$/);
        if (funcMatch) {
            const params = convertParams(funcMatch[2]);
            result += `function ${funcMatch[1]}(${params}) {\n`;
            indentLevel++;
            continue;
        }

        // Class definitions
        const classMatch = trimmed.match(/^class\s+(\w+)\s*(?::\s*public\s+(\w+))?\s*\{?\s*$/);
        if (classMatch) {
            result += classMatch[2] ? `class ${classMatch[1]} extends ${classMatch[2]} {\n` : `class ${classMatch[1]} {\n`;
            indentLevel++;
            continue;
        }

        const ifMatch = trimmed.match(/^if\s*\((.*)\)\s*\{?\s*$/);
        if (ifMatch) { result += '    '.repeat(indentLevel) + `if (${ifMatch[1]}) {\n`; indentLevel++; continue; }

        const elseIfMatch = trimmed.match(/^}\s*else\s+if\s*\((.*)\)\s*\{?\s*$/);
        if (elseIfMatch) { indentLevel--; result += '    '.repeat(indentLevel) + `} else if (${elseIfMatch[1]}) {\n`; indentLevel++; continue; }

        if (trimmed === '} else {' || trimmed === 'else {') { indentLevel--; result += '    '.repeat(indentLevel) + '} else {\n'; indentLevel++; continue; }

        const forMatch = trimmed.match(/^for\s*\(\s*(?:int|auto)?\s*(\w+)\s*=\s*(\w+)\s*;\s*\w+\s*<\s*(\w+)\s*;\s*\w+\+\+\s*\)\s*\{?\s*$/);
        if (forMatch) {
            result += '    '.repeat(indentLevel) + `for (let ${forMatch[1]} = ${forMatch[2]}; ${forMatch[1]} < ${forMatch[3]}; ${forMatch[1]}++) {\n`;
            indentLevel++; continue;
        }

        const whileMatch = trimmed.match(/^while\s*\((.*)\)\s*\{?\s*$/);
        if (whileMatch) { result += '    '.repeat(indentLevel) + `while (${whileMatch[1]}) {\n`; indentLevel++; continue; }

        const returnMatch = trimmed.match(/^return\s+(.*);$/);
        if (returnMatch) {
            result += '    '.repeat(indentLevel) + `return ${returnMatch[1].replace(/nullptr/g, 'null').replace(/NULL/g, 'null')};\n`; continue;
        }

        if (trimmed === '}' || trimmed === '};') {
            if (indentLevel > 0) { indentLevel--; result += '    '.repeat(indentLevel) + '}\n'; }
            continue;
        }
        if (trimmed === '{') continue;

        const varMatch = trimmed.match(/^(?:int|float|double|string|bool|auto|char\*?|long)\s+(\w+)\s*=\s*(.*);$/);
        if (varMatch) {
            result += '    '.repeat(indentLevel) + `let ${varMatch[1]} = ${varMatch[2].replace(/nullptr/g, 'null').replace(/NULL/g, 'null')};\n`; continue;
        }

        if (trimmed !== '{') {
            if (trimmed.endsWith(';')) result += '    '.repeat(indentLevel) + trimmed.replace(/nullptr/g, 'null').replace(/NULL/g, 'null') + '\n';
            else result += '    '.repeat(indentLevel) + '// ' + trimmed + '\n';
        }
    }

    return result;
}

function convertParams(params) {
    if (!params || params.trim() === '') return '';
    return params.split(',').map(p => p.trim()).filter(Boolean).map(p => {
        const parts = p.split(/\s+/);
        return parts[parts.length - 1].replace(/[&*]/g, '');
    }).join(', ');
}

module.exports = { convert };
