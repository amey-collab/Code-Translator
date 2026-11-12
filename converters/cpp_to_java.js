// C++ to Java Converter

function convert(code) {
    let result = 'import java.util.*;\n\npublic class ConvertedCode {\n';
    const lines = code.split('\n');
    let indentLevel = 1;

    for (let line of lines) {
        const trimmed = line.trim();
        if (trimmed === '') { result += '\n'; continue; }

        if (trimmed.startsWith('#include')) {
            result += '    '.repeat(indentLevel) + '// ' + trimmed + '\n'; continue;
        }
        if (trimmed.startsWith('using namespace')) continue;

        if (trimmed.startsWith('//')) {
            result += '    '.repeat(indentLevel) + trimmed + '\n'; continue;
        }

        // cout with chained <<
        if (trimmed.includes('cout')) {
            const coutLine = trimmed.replace(/^\s*cout\s*/, '').replace(/\s*<<\s*endl\s*;?\s*$/, '').replace(/;\s*$/, '');
            const parts = coutLine.split(/\s*<<\s*/).map(p => p.trim()).filter(Boolean);
            if (parts.length === 1) {
                result += '    '.repeat(indentLevel) + `System.out.println(${parts[0]});\n`;
            } else {
                const expr = parts.map(p => {
                    if ((p.startsWith('"') && p.endsWith('"')) || (p.startsWith("'") && p.endsWith("'"))) return p;
                    return `String.valueOf(${p})`;
                }).join(' + ');
                result += '    '.repeat(indentLevel) + `System.out.println(${expr});\n`;
            }
            continue;
        }

        // printf
        if (trimmed.includes('printf')) {
            const m = trimmed.match(/printf\s*\(\s*"([^"]*)"\s*((?:,\s*[^,)]+)*)\s*\)\s*;/);
            if (m) {
                let fmt = m[1].replace(/\\n/g, '');
                const args = m[2] ? m[2].split(',').map(a => a.trim()).filter(Boolean) : [];
                if (args.length) {
                    result += '    '.repeat(indentLevel) + `System.out.printf("${fmt}\\n", ${args.join(', ')});\n`;
                } else {
                    result += '    '.repeat(indentLevel) + `System.out.println("${fmt}");\n`;
                }
                continue;
            }
        }

        // Function definitions
        const funcMatch = trimmed.match(/^(?:void|int|float|double|string|bool|char|auto|long)\s+(\w+)\s*\((.*)\)\s*\{?\s*$/);
        if (funcMatch) {
            const funcName = funcMatch[1];
            let returnType = convertType(trimmed.split(/\s+/)[0]);
            const params = convertParams(funcMatch[2]);
            if (funcName === 'main') {
                result += '    '.repeat(indentLevel) + 'public static void main(String[] args) {\n';
            } else {
                result += '    '.repeat(indentLevel) + `public static ${returnType} ${funcName}(${params}) {\n`;
            }
            indentLevel++;
            continue;
        }

        // Class definitions
        const classMatch = trimmed.match(/^class\s+(\w+)\s*(?::\s*public\s+(\w+))?\s*\{?\s*$/);
        if (classMatch) {
            result = result.replace('public class ConvertedCode', `public class ${classMatch[1]}`);
            if (classMatch[2]) result = result.replace(`public class ${classMatch[1]}`, `public class ${classMatch[1]} extends ${classMatch[2]}`);
            continue;
        }

        const ifMatch = trimmed.match(/^if\s*\((.*)\)\s*\{?\s*$/);
        if (ifMatch) { result += '    '.repeat(indentLevel) + `if (${ifMatch[1]}) {\n`; indentLevel++; continue; }

        const elseIfMatch = trimmed.match(/^}\s*else\s+if\s*\((.*)\)\s*\{?\s*$/);
        if (elseIfMatch) { indentLevel--; result += '    '.repeat(indentLevel) + `} else if (${elseIfMatch[1]}) {\n`; indentLevel++; continue; }

        if (trimmed === '} else {' || trimmed === 'else {') { indentLevel--; result += '    '.repeat(indentLevel) + '} else {\n'; indentLevel++; continue; }

        const forMatch = trimmed.match(/^for\s*\((.*)\)\s*\{?\s*$/);
        if (forMatch) {
            let fc = forMatch[1].replace(/\bauto\b/g, 'var');
            result += '    '.repeat(indentLevel) + `for (${fc}) {\n`; indentLevel++; continue;
        }

        const whileMatch = trimmed.match(/^while\s*\((.*)\)\s*\{?\s*$/);
        if (whileMatch) { result += '    '.repeat(indentLevel) + `while (${whileMatch[1]}) {\n`; indentLevel++; continue; }

        const returnMatch = trimmed.match(/^return\s+(.*);$/);
        if (returnMatch) { result += '    '.repeat(indentLevel) + `return ${returnMatch[1]};\n`; continue; }

        if (trimmed === '}' || trimmed === '};') {
            if (indentLevel > 1) { indentLevel--; result += '    '.repeat(indentLevel) + '}\n'; }
            continue;
        }
        if (trimmed === '{') continue;

        const varMatch = trimmed.match(/^(int|float|double|string|bool|auto|char\*?|long)\s+(\w+)\s*=\s*(.*);$/);
        if (varMatch) {
            result += '    '.repeat(indentLevel) + `${convertType(varMatch[1])} ${varMatch[2]} = ${varMatch[3]};\n`; continue;
        }

        if (trimmed !== '{') {
            if (trimmed.endsWith(';')) result += '    '.repeat(indentLevel) + trimmed + '\n';
            else result += '    '.repeat(indentLevel) + '// ' + trimmed + '\n';
        }
    }

    result += '}\n';
    return result;
}

function convertParams(params) {
    if (!params || params.trim() === '') return '';
    return params.split(',').map(p => p.trim()).filter(Boolean).map(p => {
        const parts = p.split(/\s+/);
        if (parts.length >= 2) {
            return `${convertType(parts[0])} ${parts[parts.length - 1].replace(/[&*]/g, '')}`;
        }
        return p;
    }).join(', ');
}

function convertType(t) {
    const map = { 'int': 'int', 'float': 'float', 'double': 'double', 'string': 'String', 'bool': 'boolean', 'auto': 'var', 'char*': 'String', 'void': 'void', 'long': 'long' };
    return map[t] || t;
}

module.exports = { convert };
