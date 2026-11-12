// C to Python Converter

function convert(code) {
    let result = '';
    const lines = code.split('\n');
    let indentLevel = 0;

    for (let line of lines) {
        const trimmed = line.trim();
        if (trimmed === '') { result += '\n'; continue; }

        if (trimmed.startsWith('#include')) continue;
        if (trimmed.startsWith('//')) { result += '    '.repeat(indentLevel) + '#' + trimmed.substring(2) + '\n'; continue; }

        // printf
        if (trimmed.includes('printf')) {
            const m = trimmed.match(/printf\s*\(\s*"([^"]*)"\s*((?:,\s*[^,)]+)*)\s*\)\s*;/);
            if (m) {
                let fmt = m[1].replace(/\\n/g, '');
                const args = m[2] ? m[2].split(',').map(a => a.trim()).filter(Boolean) : [];
                args.forEach(a => { fmt = fmt.replace(/%[difs]/, `{${a}}`); });
                result += '    '.repeat(indentLevel) + (args.length ? `print(f"${fmt}")\n` : `print("${fmt}")\n`);
                continue;
            }
        }

        // scanf
        if (trimmed.includes('scanf')) {
            const m = trimmed.match(/scanf\s*\(\s*"[^"]*"\s*,\s*&(\w+)\s*\)\s*;/);
            if (m) { result += '    '.repeat(indentLevel) + `${m[1]} = int(input())\n`; continue; }
        }

        // Function definitions
        const funcMatch = trimmed.match(/^(?:void|int|float|double|char\*?|long)\s+(\w+)\s*\((.*)\)\s*\{?\s*$/);
        if (funcMatch) {
            const params = convertParams(funcMatch[2]);
            if (funcMatch[1] === 'main') result += '\ndef main():\n';
            else result += `\ndef ${funcMatch[1]}(${params}):\n`;
            indentLevel++;
            continue;
        }

        // if / else if / else
        const ifMatch = trimmed.match(/^if\s*\((.*)\)\s*\{?\s*$/);
        if (ifMatch) { result += '    '.repeat(indentLevel) + `if ${convertCondition(ifMatch[1])}:\n`; indentLevel++; continue; }

        const elseIfMatch = trimmed.match(/^}\s*else\s+if\s*\((.*)\)\s*\{?\s*$/);
        if (elseIfMatch) { indentLevel--; result += '    '.repeat(indentLevel) + `elif ${convertCondition(elseIfMatch[1])}:\n`; indentLevel++; continue; }

        if (trimmed === '} else {' || trimmed === 'else {' || trimmed === '} else') { indentLevel--; result += '    '.repeat(indentLevel) + 'else:\n'; indentLevel++; continue; }

        // for loop
        const forMatch = trimmed.match(/^for\s*\(\s*(?:int\s+)?(\w+)\s*=\s*(\w+)\s*;\s*\w+\s*<\s*(\w+)\s*;\s*\w+\+\+\s*\)\s*\{?\s*$/);
        if (forMatch) {
            const start = forMatch[2], end = forMatch[3];
            result += '    '.repeat(indentLevel) + (start === '0' ? `for ${forMatch[1]} in range(${end}):\n` : `for ${forMatch[1]} in range(${start}, ${end}):\n`);
            indentLevel++;
            continue;
        }

        // while
        const whileMatch = trimmed.match(/^while\s*\((.*)\)\s*\{?\s*$/);
        if (whileMatch) { result += '    '.repeat(indentLevel) + `while ${convertCondition(whileMatch[1])}:\n`; indentLevel++; continue; }

        // return
        const returnMatch = trimmed.match(/^return\s+(.*);$/);
        if (returnMatch) { result += '    '.repeat(indentLevel) + `return ${convertValue(returnMatch[1])}\n`; continue; }

        // closing brace
        if (trimmed === '}' || trimmed === '};') { if (indentLevel > 0) indentLevel--; continue; }
        if (trimmed === '{') continue;

        // variable declarations
        const varMatch = trimmed.match(/^(?:int|float|double|char\*?|bool|long)\s+(\w+)\s*=\s*(.*);$/);
        if (varMatch) { result += '    '.repeat(indentLevel) + `${varMatch[1]} = ${convertValue(varMatch[2])}\n`; continue; }

        // standalone statements
        if (trimmed.endsWith(';')) {
            result += '    '.repeat(indentLevel) + convertValue(trimmed.slice(0, -1)) + '\n'; continue;
        }

        if (trimmed !== '{') result += '    '.repeat(indentLevel) + '# ' + trimmed + '\n';
    }

    if (result.includes('def main():')) result += '\n\nif __name__ == "__main__":\n    main()\n';
    return result;
}

function convertParams(params) {
    if (!params || params.trim() === '' || params.trim() === 'void') return '';
    return params.split(',').map(p => p.trim()).filter(p => p && p !== 'void').map(p => {
        const parts = p.split(/\s+/);
        return parts[parts.length - 1].replace(/[*&]/g, '');
    }).join(', ');
}

function convertCondition(c) {
    return c.replace(/&&/g, ' and ').replace(/\|\|/g, ' or ').replace(/!(?!=)/g, 'not ')
        .replace(/\btrue\b/g, 'True').replace(/\bfalse\b/g, 'False').replace(/\bNULL\b/g, 'None');
}

function convertValue(v) {
    return v.replace(/\btrue\b/g, 'True').replace(/\bfalse\b/g, 'False').replace(/\bNULL\b/g, 'None');
}

module.exports = { convert };
