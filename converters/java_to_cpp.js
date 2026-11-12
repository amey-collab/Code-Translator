// Java to C++ Converter

function convert(code) {
    let result = '#include <iostream>\n#include <string>\n#include <vector>\nusing namespace std;\n\n';
    const lines = code.split('\n');
    let indentLevel = 0;
    let className = 'ConvertedCode';

    for (let line of lines) {
        const trimmed = line.trim();
        if (trimmed === '') { result += '\n'; continue; }

        if (trimmed.startsWith('import ')) { result += '// ' + trimmed + '\n'; continue; }
        if (trimmed.startsWith('package ')) continue;
        if (trimmed.startsWith('//')) { result += '    '.repeat(indentLevel) + trimmed + '\n'; continue; }

        // System.out.println
        if (trimmed.includes('System.out.print')) {
            const m = trimmed.match(/System\.out\.println?\s*\(\s*([\s\S]+?)\s*\)\s*;/);
            if (m) {
                result += '    '.repeat(indentLevel) + `cout << ${m[1]} << endl;\n`; continue;
            }
        }

        // Class definition
        const classMatch = trimmed.match(/^(?:public\s+)?class\s+(\w+)(?:\s+extends\s+(\w+))?\s*\{?$/);
        if (classMatch) {
            className = classMatch[1];
            result += classMatch[2]
                ? `class ${className} : public ${classMatch[2]} {\npublic:\n`
                : `class ${className} {\npublic:\n`;
            indentLevel++;
            continue;
        }

        // Method definition
        const methodMatch = trimmed.match(/^(?:public|private|protected)?\s*(?:static\s+)?(void|int|float|double|String|boolean|Object|long)\s+(\w+)\s*\((.*)\)\s*\{?$/);
        if (methodMatch) {
            const returnType = convertType(methodMatch[1]);
            const methodName = methodMatch[2];
            const params = convertParams(methodMatch[3]);
            if (methodName === 'main') result += '    '.repeat(indentLevel) + 'int main(int argc, char* argv[]) {\n';
            else result += '    '.repeat(indentLevel) + `${returnType} ${methodName}(${params}) {\n`;
            indentLevel++;
            continue;
        }

        // Constructor
        const constructorMatch = trimmed.match(/^(?:public\s+)?(\w+)\s*\((.*)\)\s*\{?$/);
        if (constructorMatch && constructorMatch[1] === className) {
            const params = convertParams(constructorMatch[2]);
            result += '    '.repeat(indentLevel) + `${className}(${params}) {\n`;
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
            result += '    '.repeat(indentLevel) + `for (${forMatch[1].replace(/\bvar\b/g, 'auto')}) {\n`; indentLevel++; continue;
        }

        const whileMatch = trimmed.match(/^while\s*\((.*)\)\s*\{?$/);
        if (whileMatch) { result += '    '.repeat(indentLevel) + `while (${whileMatch[1]}) {\n`; indentLevel++; continue; }

        const returnMatch = trimmed.match(/^return\s+(.*);$/);
        if (returnMatch) { result += '    '.repeat(indentLevel) + `return ${returnMatch[1].replace(/\bnull\b/g, 'nullptr')};\n`; continue; }

        if (trimmed === '}' || trimmed === '};') {
            if (indentLevel > 0) { indentLevel--; result += '    '.repeat(indentLevel) + '}\n'; }
            continue;
        }
        if (trimmed === '{') continue;

        const varMatch = trimmed.match(/^(int|float|double|String|boolean|var|Object|long)\s+(\w+)\s*=\s*(.*);$/);
        if (varMatch) {
            result += '    '.repeat(indentLevel) + `${convertType(varMatch[1])} ${varMatch[2]} = ${varMatch[3].replace(/\bnull\b/g, 'nullptr')};\n`; continue;
        }

        if (trimmed !== '{') {
            if (trimmed.endsWith(';')) result += '    '.repeat(indentLevel) + trimmed.replace(/\bnull\b/g, 'nullptr') + '\n';
            else result += '    '.repeat(indentLevel) + '// ' + trimmed + '\n';
        }
    }

    if (result.includes('class ' + className)) result += '};\n';
    return result;
}

function convertParams(params) {
    if (!params || params.trim() === '') return '';
    return params.split(',').map(p => p.trim()).filter(Boolean).map(p => {
        const parts = p.split(/\s+/);
        if (parts.length >= 2) return `${convertType(parts[0])} ${parts[parts.length - 1]}`;
        return p;
    }).join(', ');
}

function convertType(t) {
    const map = { 'int': 'int', 'float': 'float', 'double': 'double', 'String': 'string', 'boolean': 'bool', 'var': 'auto', 'Object': 'auto', 'void': 'void', 'long': 'long' };
    return map[t] || t;
}

module.exports = { convert };
