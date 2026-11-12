// Java to C Converter

function convert(code) {
    let result = '#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n#include <stdbool.h>\n\n';
    const lines = code.split('\n');
    let indentLevel = 0;

    for (let line of lines) {
        const trimmed = line.trim();
        if (trimmed === '') { result += '\n'; continue; }

        if (trimmed.startsWith('import ') || trimmed.startsWith('package ')) continue;
        if (trimmed.startsWith('//')) { result += '    '.repeat(indentLevel) + trimmed + '\n'; continue; }

        // System.out.println
        if (trimmed.includes('System.out.print')) {
            const m = trimmed.match(/System\.out\.println?\s*\(\s*([\s\S]+?)\s*\)\s*;/);
            if (m) {
                let content = m[1];
                // Simple string literal
                const strLit = content.match(/^"([^"]*)"$/);
                if (strLit) { result += '    '.repeat(indentLevel) + `printf("${strLit[1]}\\n");\n`; continue; }
                // Variable only
                const varOnly = content.match(/^(\w+)$/);
                if (varOnly) { result += '    '.repeat(indentLevel) + `printf("%d\\n", ${varOnly[1]}); // TODO: Adjust format\n`; continue; }
                result += '    '.repeat(indentLevel) + `printf("%s\\n", ${content}); // TODO: Adjust format\n`;
                continue;
            }
        }

        // Skip class definitions
        const classMatch = trimmed.match(/^(?:public\s+)?class\s+(\w+)/);
        if (classMatch) { result += `// Class ${classMatch[1]} converted to C functions\n\n`; continue; }

        // Method definition
        const methodMatch = trimmed.match(/^(?:public|private|protected)?\s*(?:static\s+)?(void|int|float|double|String|boolean|long)\s+(\w+)\s*\((.*)\)\s*\{?$/);
        if (methodMatch) {
            const returnType = convertType(methodMatch[1]);
            const methodName = methodMatch[2];
            const params = convertParams(methodMatch[3]);
            if (methodName === 'main') result += 'int main(int argc, char *argv[]) {\n';
            else result += `${returnType} ${methodName}(${params || 'void'}) {\n`;
            indentLevel++;
            continue;
        }

        const ifMatch = trimmed.match(/^if\s*\((.*)\)\s*\{?$/);
        if (ifMatch) { result += '    '.repeat(indentLevel) + `if (${ifMatch[1]}) {\n`; indentLevel++; continue; }

        const elseIfMatch = trimmed.match(/^}\s*else\s+if\s*\((.*)\)\s*\{?$/);
        if (elseIfMatch) { indentLevel--; result += '    '.repeat(indentLevel) + `} else if (${elseIfMatch[1]}) {\n`; indentLevel++; continue; }

        if (trimmed === '} else {' || trimmed === 'else {') { indentLevel--; result += '    '.repeat(indentLevel) + '} else {\n'; indentLevel++; continue; }

        const forMatch = trimmed.match(/^for\s*\((.*)\)\s*\{?$/);
        if (forMatch) {
            result += '    '.repeat(indentLevel) + `for (${forMatch[1].replace(/\bvar\b/g, 'int')}) {\n`; indentLevel++; continue;
        }

        const whileMatch = trimmed.match(/^while\s*\((.*)\)\s*\{?$/);
        if (whileMatch) { result += '    '.repeat(indentLevel) + `while (${whileMatch[1]}) {\n`; indentLevel++; continue; }

        const returnMatch = trimmed.match(/^return\s+(.*);$/);
        if (returnMatch) { result += '    '.repeat(indentLevel) + `return ${returnMatch[1].replace(/\bnull\b/g, 'NULL')};\n`; continue; }

        if (trimmed === '}' || trimmed === '};') {
            if (indentLevel > 0) { indentLevel--; result += '    '.repeat(indentLevel) + '}\n'; }
            continue;
        }
        if (trimmed === '{') continue;

        const varMatch = trimmed.match(/^(int|float|double|String|boolean|var|long)\s+(\w+)\s*=\s*(.*);$/);
        if (varMatch) {
            result += '    '.repeat(indentLevel) + `${convertType(varMatch[1])} ${varMatch[2]} = ${varMatch[3].replace(/\bnull\b/g, 'NULL')};\n`; continue;
        }

        if (trimmed !== '{') {
            if (trimmed.endsWith(';')) result += '    '.repeat(indentLevel) + trimmed.replace(/\bnull\b/g, 'NULL') + '\n';
            else result += '    '.repeat(indentLevel) + '// ' + trimmed + '\n';
        }
    }

    return result;
}

function convertParams(params) {
    if (!params || params.trim() === '' || params.trim() === 'String[] args') return '';
    return params.split(',').map(p => p.trim()).filter(p => p && p !== 'String[] args').map(p => {
        const parts = p.split(/\s+/);
        if (parts.length >= 2) return `${convertType(parts[0])} ${parts[parts.length - 1]}`;
        return p;
    }).join(', ');
}

function convertType(t) {
    const map = { 'int': 'int', 'float': 'float', 'double': 'double', 'String': 'char*', 'boolean': 'bool', 'var': 'int', 'void': 'void', 'long': 'long' };
    return map[t] || 'int';
}

module.exports = { convert };
