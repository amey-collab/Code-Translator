// Python to C Converter

function convert(code) {
    let result = '#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n#include <stdbool.h>\n\n';
    const lines = code.split('\n');
    let indentStack = [0];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();
        if (trimmed === '') { result += '\n'; continue; }

        const currentIndent = line.search(/\S/);
        if (currentIndent === -1) continue;

        const isElif = trimmed.startsWith('elif ') && trimmed.endsWith(':');
        const isElse = trimmed === 'else:';

        if (!isElif && !isElse) {
            while (indentStack.length > 1 && currentIndent < indentStack[indentStack.length - 1]) {
                indentStack.pop();
                result += '    '.repeat(indentStack.length - 1) + '}\n';
            }
        }

        const outIndent = Math.max(0, indentStack.length - 1);

        if (trimmed.startsWith('#')) { result += '    '.repeat(outIndent) + '//' + trimmed.substring(1) + '\n'; continue; }

        // print
        if (trimmed.startsWith('print(')) {
            const inner = trimmed.slice(6, -1).trim();
            const fStr = inner.match(/^f["'](.*)["']$/);
            if (fStr) {
                let fmt = fStr[1], args = [];
                fmt = fmt.replace(/\{(\w+)\}/g, (_, v) => { args.push(v); return '%s'; });
                result += '    '.repeat(outIndent) + (args.length
                    ? `printf("${fmt}\\n", ${args.join(', ')});\n`
                    : `printf("${fmt}\\n");\n`);
                continue;
            }
            const strLit = inner.match(/^["'](.*)["']$/);
            if (strLit) { result += '    '.repeat(outIndent) + `printf("${strLit[1]}\\n");\n`; continue; }
            result += '    '.repeat(outIndent) + `printf("%d\\n", ${inner}); // TODO: Adjust format\n`;
            continue;
        }

        // def
        if (trimmed.startsWith('def ')) {
            const m = trimmed.match(/def\s+(\w+)\s*\((.*)\)\s*:/);
            if (m) {
                const params = convertParams(m[2]);
                if (m[1] === 'main') result += 'int main(void) {\n';
                else result += `void ${m[1]}(${params || 'void'}) {\n`;
                indentStack.push(currentIndent + 4);
                continue;
            }
        }

        // if / elif / else
        if (trimmed.startsWith('if ') && trimmed.endsWith(':')) {
            const cond = convertCondition(trimmed.slice(3, -1).trim());
            result += '    '.repeat(outIndent) + `if (${cond}) {\n`;
            indentStack.push(currentIndent + 4);
            continue;
        }
        if (isElif) {
            result += '    '.repeat(outIndent - 1) + '} ';
            const cond = convertCondition(trimmed.slice(5, -1).trim());
            result += `else if (${cond}) {\n`;
            indentStack[indentStack.length - 1] = currentIndent + 4;
            continue;
        }
        if (isElse) {
            result += '    '.repeat(outIndent - 1) + '} else {\n';
            indentStack[indentStack.length - 1] = currentIndent + 4;
            continue;
        }

        // for range
        const forRange = trimmed.match(/^for\s+(\w+)\s+in\s+range\s*\(\s*(\w+)\s*(?:,\s*(\w+))?\s*\)\s*:/);
        if (forRange) {
            const v = forRange[1], start = forRange[3] ? forRange[2] : '0', end = forRange[3] || forRange[2];
            result += '    '.repeat(outIndent) + `for (int ${v} = ${start}; ${v} < ${end}; ${v}++) {\n`;
            indentStack.push(currentIndent + 4);
            continue;
        }

        // while
        if (trimmed.startsWith('while ') && trimmed.endsWith(':')) {
            const cond = convertCondition(trimmed.slice(6, -1).trim());
            result += '    '.repeat(outIndent) + `while (${cond}) {\n`;
            indentStack.push(currentIndent + 4);
            continue;
        }

        // return
        if (trimmed.startsWith('return ')) {
            result += '    '.repeat(outIndent) + `return ${convertValue(trimmed.slice(7))};\n`; continue;
        }

        // variable assignment
        const assignMatch = trimmed.match(/^(\w+)\s*=\s*(.+)$/);
        if (assignMatch && !trimmed.includes('==') && !trimmed.includes('!=')) {
            const varName = assignMatch[1], val = assignMatch[2];
            const type = detectType(val);
            result += '    '.repeat(outIndent) + `${type} ${varName} = ${convertValue(val)};\n`;
            continue;
        }

        // function calls
        if (trimmed.endsWith(')') || trimmed.endsWith(');')) {
            result += '    '.repeat(outIndent) + trimmed + (trimmed.endsWith(';') ? '' : ';') + '\n'; continue;
        }

        result += '    '.repeat(outIndent) + '// ' + trimmed + '\n';
    }

    while (indentStack.length > 1) {
        indentStack.pop();
        result += '    '.repeat(indentStack.length - 1) + '}\n';
    }

    if (!result.includes('int main(')) {
        result += '\nint main(void) {\n    // TODO: Add main logic\n    return 0;\n}\n';
    }

    return result;
}

function convertParams(params) {
    if (!params || params.trim() === '' || params.trim() === 'self') return '';
    return params.split(',').map(p => p.trim()).filter(p => p && p !== 'self').map(p => {
        if (p.includes(':')) {
            const [name, type] = p.split(':').map(s => s.trim());
            return convertType(type) + ' ' + name;
        }
        return 'int ' + p;
    }).join(', ');
}

function convertType(t) {
    const map = { 'int': 'int', 'str': 'char*', 'float': 'double', 'bool': 'bool' };
    return map[t] || 'int';
}

function detectType(v) {
    if (v.startsWith('"') || v.startsWith("'")) return 'char*';
    if (/^\d+$/.test(v)) return 'int';
    if (/^\d+\.\d+$/.test(v)) return 'double';
    if (v === 'True' || v === 'False') return 'bool';
    return 'int';
}

function convertValue(v) {
    return v.replace(/\bTrue\b/g, 'true').replace(/\bFalse\b/g, 'false')
        .replace(/\bNone\b/g, 'NULL').replace(/'/g, '"');
}

function convertCondition(c) {
    return c.replace(/\band\b/g, '&&').replace(/\bor\b/g, '||').replace(/\bnot\b/g, '!')
        .replace(/\bTrue\b/g, 'true').replace(/\bFalse\b/g, 'false').replace(/\bNone\b/g, 'NULL');
}

module.exports = { convert };
