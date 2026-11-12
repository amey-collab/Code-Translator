// Python to Java Converter

function convert(code) {
    let result = 'public class Converted {\n    public static void main(String[] args) {\n';
    const lines = code.split('\n');
    let indentStack = [4];

    function outIndent(level) {
        return ' '.repeat(level);
    }

    for (let line of lines) {
        const trimmed = line.trim();
        if (trimmed === '') { result += '\n'; continue; }

        const currentIndent = line.search(/\S/);

        if (trimmed.startsWith('#')) {
            result += outIndent(currentIndent) + '// ' + trimmed.substring(1).trim() + '\n';
            continue;
        }

        if (trimmed.startsWith('print(') && trimmed.endsWith(')')) {
            const inner = trimmed.slice(6, -1).trim();
            result += outIndent(currentIndent) + `System.out.println(${convertValue(inner)});\n`;
            continue;
        }

        if (trimmed.startsWith('def ') && trimmed.endsWith(':')) {
            const m = trimmed.match(/def\s+(\w+)\s*\((.*)\)\s*:/);
            if (m) {
                const name = m[1];
                const params = convertParams(m[2]);
                if (name === 'main') {
                    result += outIndent(currentIndent) + 'public static void main(String[] args) {\n';
                } else {
                    result += outIndent(currentIndent) + `public static void ${name}(${params}) {\n`;
                }
                indentStack.push(currentIndent + 4);
                continue;
            }
        }

        if (trimmed.startsWith('if ') && trimmed.endsWith(':')) {
            const cond = convertCondition(trimmed.slice(3, -1).trim());
            result += outIndent(currentIndent) + `if (${cond}) {\n`;
            indentStack.push(currentIndent + 4);
            continue;
        }

        if (trimmed.startsWith('elif ') && trimmed.endsWith(':')) {
            indentStack.pop();
            result += outIndent(currentIndent) + `else if (${convertCondition(trimmed.slice(5, -1).trim())}) {\n`;
            indentStack.push(currentIndent + 4);
            continue;
        }

        if (trimmed === 'else:') {
            indentStack.pop();
            result += outIndent(currentIndent) + 'else {\n';
            indentStack.push(currentIndent + 4);
            continue;
        }

        const forRange = trimmed.match(/^for\s+(\w+)\s+in\s+range\(([^\)]+)\):$/);
        if (forRange) {
            const v = forRange[1];
            const rangeArgs = forRange[2].split(',').map(s => s.trim());
            let start = '0', end = rangeArgs[0], step = '1';
            if (rangeArgs.length === 2) { start = rangeArgs[0]; end = rangeArgs[1]; }
            if (rangeArgs.length === 3) { start = rangeArgs[0]; end = rangeArgs[1]; step = rangeArgs[2]; }
            result += outIndent(currentIndent) + `for (int ${v} = ${start}; ${v} < ${end}; ${v} += ${step}) {\n`;
            indentStack.push(currentIndent + 4);
            continue;
        }

        if (trimmed.startsWith('while ') && trimmed.endsWith(':')) {
            const cond = convertCondition(trimmed.slice(6, -1).trim());
            result += outIndent(currentIndent) + `while (${cond}) {\n`;
            indentStack.push(currentIndent + 4);
            continue;
        }

        if (trimmed.startsWith('return ')) {
            result += outIndent(currentIndent) + `return ${trimmed.slice(7)};\n`;
            continue;
        }

        const assign = trimmed.match(/^(\w+)\s*=\s*(.*)$/);
        if (assign && !trimmed.includes('==') && !trimmed.includes('!=')) {
            const varName = assign[1];
            const value = convertValue(assign[2]);
            result += outIndent(currentIndent) + `var ${varName} = ${value};\n`;
            continue;
        }

        if (trimmed.endsWith('()') || trimmed.endsWith(');') || trimmed.endsWith(')')) {
            const call = trimmed.replace(/;$/, '');
            result += outIndent(currentIndent) + `${call};\n`;
            continue;
        }

        result += outIndent(currentIndent) + '// ' + trimmed + '\n';
    }

    while (indentStack.length > 1) {
        indentStack.pop();
        result += outIndent(indentStack[indentStack.length - 1]) + '}\n';
    }

    result += '    }\n}';

    return result;
}

function convertParams(params) {
    if (!params || params.trim() === '') return '';
    return params.split(',').map(p => p.trim()).map(p => `String ${p}`).join(', ');
}

function convertCondition(cond) {
    return cond.replace(/\band\b/g, '&&').replace(/\bor\b/g, '||').replace(/\bnot\b/g, '!')
        .replace(/\bTrue\b/g, 'true').replace(/\bFalse\b/g, 'false').replace(/\bNone\b/g, 'null');
}

function convertValue(value) {
    return value.replace(/\bTrue\b/g, 'true').replace(/\bFalse\b/g, 'false').replace(/\bNone\b/g, 'null');
}

module.exports = { convert };
