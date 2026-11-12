// C++ to Python Converter

function convert(code) {
    let result = '';
    const lines = code.split('\n');
    let indentLevel = 0;

    for (let line of lines) {
        const trimmed = line.trim();

        if (trimmed === '') { result += '\n'; continue; }

        // Skip includes
        if (trimmed.startsWith('#include')) continue;
        // Skip using namespace
        if (trimmed.startsWith('using namespace')) continue;

        // Single-line comments
        if (trimmed.startsWith('//')) {
            result += '    '.repeat(indentLevel) + '#' + trimmed.substring(2) + '\n';
            continue;
        }
        // Multi-line comment markers
        if (trimmed.startsWith('/*')) { result += '    '.repeat(indentLevel) + '"""\n'; continue; }
        if (trimmed.endsWith('*/')) { result += '    '.repeat(indentLevel) + '"""\n'; continue; }

        // cout with chained << (handles string + variable mixing)
        if (trimmed.includes('cout')) {
            const coutLine = trimmed.replace(/^\s*cout\s*/, '').replace(/\s*<<\s*endl\s*;?\s*$/, '').replace(/;\s*$/, '');
            const parts = coutLine.split(/\s*<<\s*/);
            const pyParts = parts.map(p => p.trim()).filter(p => p !== '');
            if (pyParts.length === 1) {
                const p = pyParts[0];
                result += '    '.repeat(indentLevel) + `print(${p})\n`;
            } else {
                // Build f-string or str() concatenation
                const converted = pyParts.map(p => {
                    if ((p.startsWith('"') && p.endsWith('"')) || (p.startsWith("'") && p.endsWith("'"))) {
                        return p.slice(1, -1);
                    }
                    return `{${p}}`;
                }).join('');
                result += '    '.repeat(indentLevel) + `print(f"${converted}")\n`;
            }
            continue;
        }

        // printf
        if (trimmed.includes('printf')) {
            const m = trimmed.match(/printf\s*\(\s*"([^"]*)"\s*((?:,\s*[^,)]+)*)\s*\)\s*;/);
            if (m) {
                let fmt = m[1].replace(/\\n/g, '');
                const args = m[2] ? m[2].split(',').map(a => a.trim()).filter(Boolean) : [];
                args.forEach(a => { fmt = fmt.replace(/%[difs]/, `{${a}}`); });
                result += '    '.repeat(indentLevel) + `print(f"${fmt}")\n`;
                continue;
            }
        }

        // Function definitions - handle all return types including string
        const funcMatch = trimmed.match(/^(?:void|int|float|double|string|bool|char|auto|long|unsigned\s+int|unsigned)\s+(\w+)\s*\((.*)\)\s*\{?\s*$/);
        if (funcMatch) {
            const funcName = funcMatch[1];
            const params = convertParams(funcMatch[2]);
            if (funcName === 'main') {
                result += '\ndef main():\n';
            } else {
                result += `\ndef ${funcName}(${params}):\n`;
            }
            indentLevel++;
            continue;
        }

        // Class definitions
        const classMatch = trimmed.match(/^class\s+(\w+)\s*(?::\s*public\s+(\w+))?\s*\{?\s*$/);
        if (classMatch) {
            const parent = classMatch[2];
            result += parent ? `\nclass ${classMatch[1]}(${parent}):\n` : `\nclass ${classMatch[1]}:\n`;
            indentLevel++;
            continue;
        }

        // if
        const ifMatch = trimmed.match(/^if\s*\((.*)\)\s*\{?\s*$/);
        if (ifMatch) {
            result += '    '.repeat(indentLevel) + `if ${convertCondition(ifMatch[1])}:\n`;
            indentLevel++;
            continue;
        }

        // else if
        const elseIfMatch = trimmed.match(/^}\s*else\s+if\s*\((.*)\)\s*\{?\s*$/);
        if (elseIfMatch) {
            indentLevel--;
            result += '    '.repeat(indentLevel) + `elif ${convertCondition(elseIfMatch[1])}:\n`;
            indentLevel++;
            continue;
        }

        // else
        if (trimmed === '} else {' || trimmed === 'else {' || trimmed === '} else') {
            indentLevel--;
            result += '    '.repeat(indentLevel) + 'else:\n';
            indentLevel++;
            continue;
        }

        // for loop
        const forMatch = trimmed.match(/^for\s*\(\s*(?:int|auto)?\s*(\w+)\s*=\s*(\w+)\s*;\s*\w+\s*<\s*(\w+)\s*;\s*\w+\+\+\s*\)\s*\{?\s*$/);
        if (forMatch) {
            const start = forMatch[2], end = forMatch[3];
            result += '    '.repeat(indentLevel) + (start === '0'
                ? `for ${forMatch[1]} in range(${end}):\n`
                : `for ${forMatch[1]} in range(${start}, ${end}):\n`);
            indentLevel++;
            continue;
        }

        // while
        const whileMatch = trimmed.match(/^while\s*\((.*)\)\s*\{?\s*$/);
        if (whileMatch) {
            result += '    '.repeat(indentLevel) + `while ${convertCondition(whileMatch[1])}:\n`;
            indentLevel++;
            continue;
        }

        // return
        const returnMatch = trimmed.match(/^return\s+(.*);$/);
        if (returnMatch) {
            result += '    '.repeat(indentLevel) + `return ${convertValue(returnMatch[1])}\n`;
            continue;
        }

        // closing brace
        if (trimmed === '}' || trimmed === '};') {
            if (indentLevel > 0) indentLevel--;
            continue;
        }
        if (trimmed === '{') continue;

        // variable declarations
        const varMatch = trimmed.match(/^(?:int|float|double|string|bool|auto|char\*?|long)\s+(\w+)\s*=\s*(.*);$/);
        if (varMatch) {
            result += '    '.repeat(indentLevel) + `${varMatch[1]} = ${convertValue(varMatch[2])}\n`;
            continue;
        }

        // standalone statements ending with ;
        if (trimmed.endsWith(';') && !trimmed.startsWith('//')) {
            const stmt = trimmed.slice(0, -1);
            result += '    '.repeat(indentLevel) + convertValue(stmt) + '\n';
            continue;
        }

        // default
        if (trimmed !== '{') {
            result += '    '.repeat(indentLevel) + '# ' + trimmed + '\n';
        }
    }

    if (result.includes('def main():')) {
        result += '\n\nif __name__ == "__main__":\n    main()\n';
    }

    return result;
}

function convertParams(params) {
    if (!params || params.trim() === '') return '';
    return params.split(',')
        .map(p => p.trim())
        .filter(p => p !== '')
        .map(p => {
            const parts = p.split(/\s+/);
            return parts[parts.length - 1].replace(/[&*]/g, '');
        })
        .join(', ');
}

function convertCondition(c) {
    return c.replace(/&&/g, ' and ').replace(/\|\|/g, ' or ')
        .replace(/\bnot\s+/g, 'not ').replace(/!(?!=)/g, 'not ')
        .replace(/\btrue\b/g, 'True').replace(/\bfalse\b/g, 'False')
        .replace(/\bnullptr\b/g, 'None').replace(/\bNULL\b/g, 'None');
}

function convertValue(v) {
    return v.replace(/\btrue\b/g, 'True').replace(/\bfalse\b/g, 'False')
        .replace(/\bnullptr\b/g, 'None').replace(/\bNULL\b/g, 'None');
}

module.exports = { convert };
