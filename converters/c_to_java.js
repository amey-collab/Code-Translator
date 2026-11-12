// C to Java Converter

function convert(code) {
    let result = 'import java.util.*;\n\npublic class ConvertedCode {\n';
    const lines = code.split('\n');
    let indentLevel = 1;

    for (let line of lines) {
        const trimmed = line.trim();
        if (trimmed === '') { result += '\n'; continue; }

        if (trimmed.startsWith('#include')) { result += '    '.repeat(indentLevel) + '// ' + trimmed + '\n'; continue; }
        if (trimmed.startsWith('//')) { result += '    '.repeat(indentLevel) + trimmed + '\n'; continue; }

        // printf -> System.out.println/printf
        if (trimmed.includes('printf')) {
            const m = trimmed.match(/printf\s*\(\s*"([^"]*)"\s*((?:,\s*[^,)]+)*)\s*\)\s*;/);
            if (m) {
                let fmt = m[1].replace(/\\n/g, '');
                const args = m[2] ? m[2].split(',').map(a => a.trim()).filter(Boolean) : [];
                if (args.length) result += '    '.repeat(indentLevel) + `System.out.printf("${fmt}\\n", ${args.join(', ')});\n`;
                else result += '    '.repeat(indentLevel) + `System.out.println("${fmt}");\n`;
                continue;
            }
        }

        // scanf -> Scanner
        if (trimmed.includes('scanf')) {
            const m = trimmed.match(/scanf\s*\(\s*"[^"]*"\s*,\s*&(\w+)\s*\)\s*;/);
            if (m) {
                result += '    '.repeat(indentLevel) + `Scanner scanner = new Scanner(System.in);\n`;
                result += '    '.repeat(indentLevel) + `${m[1]} = scanner.nextInt(); // TODO: Adjust type\n`;
                continue;
            }
        }

        // Function definitions
        const funcMatch = trimmed.match(/^(?:void|int|float|double|char\*?|long)\s+(\w+)\s*\((.*)\)\s*\{?\s*$/);
        if (funcMatch) {
            const returnType = convertType(trimmed.split(/\s+/)[0]);
            const methodName = funcMatch[1];
            const params = convertParams(funcMatch[2]);
            if (methodName === 'main') result += '    '.repeat(indentLevel) + 'public static void main(String[] args) {\n';
            else result += '    '.repeat(indentLevel) + `public static ${returnType} ${methodName}(${params}) {\n`;
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
        if (returnMatch) { result += '    '.repeat(indentLevel) + `return ${returnMatch[1].replace(/\bNULL\b/g, 'null')};\n`; continue; }

        if (trimmed === '}' || trimmed === '};') {
            if (indentLevel > 1) { indentLevel--; result += '    '.repeat(indentLevel) + '}\n'; }
            continue;
        }
        if (trimmed === '{') continue;

        const varMatch = trimmed.match(/^(int|float|double|char\*?|bool|long)\s+(\w+)\s*=\s*(.*);$/);
        if (varMatch) {
            result += '    '.repeat(indentLevel) + `${convertType(varMatch[1])} ${varMatch[2]} = ${varMatch[3].replace(/\bNULL\b/g, 'null')};\n`; continue;
        }

        if (trimmed !== '{') {
            if (trimmed.endsWith(';')) result += '    '.repeat(indentLevel) + trimmed.replace(/\bNULL\b/g, 'null') + '\n';
            else result += '    '.repeat(indentLevel) + '// ' + trimmed + '\n';
        }
    }

    result += '}\n';
    return result;
}

function convertParams(params) {
    if (!params || params.trim() === '' || params.trim() === 'void') return '';
    return params.split(',').map(p => p.trim()).filter(p => p && p !== 'void').map(p => {
        const parts = p.split(/\s+/);
        if (parts.length >= 2) return `${convertType(parts[0])} ${parts[parts.length - 1].replace(/[*&]/g, '')}`;
        return p;
    }).join(', ');
}

function convertType(t) {
    const map = { 'int': 'int', 'float': 'float', 'double': 'double', 'char*': 'String', 'char': 'char', 'bool': 'boolean', 'void': 'void', 'long': 'long' };
    return map[t] || t;
}

module.exports = { convert };
