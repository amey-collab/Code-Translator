// Java to JavaScript Converter

function convert(code) {
    let result = '';
    const lines = code.split('\n');
    let indentLevel = 0;
    let inClass = false;
    let className = '';

    for (let line of lines) {
        const trimmed = line.trim();
        if (trimmed === '') { result += '\n'; continue; }

        if (trimmed.startsWith('import ') || trimmed.startsWith('package ')) { result += '// ' + trimmed + '\n'; continue; }
        if (trimmed.startsWith('//')) { result += '    '.repeat(indentLevel) + trimmed + '\n'; continue; }

        // System.out.println
        if (trimmed.includes('System.out.print')) {
            const m = trimmed.match(/System\.out\.println?\s*\(\s*([\s\S]+?)\s*\)\s*;/);
            if (m) { result += '    '.repeat(indentLevel) + `console.log(${m[1]});\n`; continue; }
        }

        // Class definition
        const classMatch = trimmed.match(/^(?:public\s+)?class\s+(\w+)(?:\s+extends\s+(\w+))?\s*\{?$/);
        if (classMatch) {
            className = classMatch[1];
            result += classMatch[2] ? `class ${className} extends ${classMatch[2]} {\n` : `class ${className} {\n`;
            indentLevel++;
            inClass = true;
            continue;
        }

        // Method definition
        const methodMatch = trimmed.match(/^(?:public|private|protected)?\s*(?:static\s+)?(?:void|int|float|double|String|boolean|Object|long)\s+(\w+)\s*\((.*)\)\s*\{?$/);
        if (methodMatch) {
            const methodName = methodMatch[1];
            const params = convertParams(methodMatch[2]);
            if (methodName === 'main') result += '    '.repeat(indentLevel) + `static main() {\n`;
            else result += '    '.repeat(indentLevel) + `${methodName}(${params}) {\n`;
            indentLevel++;
            continue;
        }

        // Constructor
        const constructorMatch = trimmed.match(/^(?:public\s+)?(\w+)\s*\((.*)\)\s*\{?$/);
        if (constructorMatch && constructorMatch[1] === className) {
            const params = convertParams(constructorMatch[2]);
            result += '    '.repeat(indentLevel) + `constructor(${params}) {\n`;
            indentLevel++;
            continue;
        }

        const ifMatch = trimmed.match(/^if\s*\((.*)\)\s*\{?$/);
        if (ifMatch) { result += '    '.repeat(indentLevel) + `if (${ifMatch[1]}) {\n`; indentLevel++; continue; }

        const elseIfMatch = trimmed.match(/^}\s*else\s+if\s*\((.*)\)\s*\{?$/);
        if (elseIfMatch) { indentLevel--; result += '    '.repeat(indentLevel) + `} else if (${elseIfMatch[1]}) {\n`; indentLevel++; continue; }

        if (trimmed === '} else {' || trimmed === 'else {') { indentLevel--; result += '    '.repeat(indentLevel) + '} else {\n'; indentLevel++; continue; }

        const forMatch = trimmed.match(/^for\s*\(\s*(?:int|var)\s+(\w+)\s*=\s*(\w+)\s*;\s*\w+\s*<\s*(\w+)\s*;\s*\w+\+\+\s*\)\s*\{?$/);
        if (forMatch) {
            result += '    '.repeat(indentLevel) + `for (let ${forMatch[1]} = ${forMatch[2]}; ${forMatch[1]} < ${forMatch[3]}; ${forMatch[1]}++) {\n`;
            indentLevel++; continue;
        }
        const enhancedFor = trimmed.match(/^for\s*\(\s*(?:\w+)\s+(\w+)\s*:\s*(\w+)\s*\)\s*\{?$/);
        if (enhancedFor) { result += '    '.repeat(indentLevel) + `for (const ${enhancedFor[1]} of ${enhancedFor[2]}) {\n`; indentLevel++; continue; }

        const whileMatch = trimmed.match(/^while\s*\((.*)\)\s*\{?$/);
        if (whileMatch) { result += '    '.repeat(indentLevel) + `while (${whileMatch[1]}) {\n`; indentLevel++; continue; }

        const returnMatch = trimmed.match(/^return\s+(.*);$/);
        if (returnMatch) { result += '    '.repeat(indentLevel) + `return ${returnMatch[1]};\n`; continue; }

        if (trimmed === '}' || trimmed === '};') {
            if (indentLevel > 0) { indentLevel--; result += '    '.repeat(indentLevel) + '}\n'; }
            continue;
        }
        if (trimmed === '{') continue;

        const varMatch = trimmed.match(/^(?:int|float|double|String|boolean|var|Object|long)\s+(\w+)\s*=\s*(.*);$/);
        if (varMatch) { result += '    '.repeat(indentLevel) + `let ${varMatch[1]} = ${varMatch[2]};\n`; continue; }

        if (trimmed.includes('this.') && trimmed.endsWith(';')) { result += '    '.repeat(indentLevel) + trimmed + '\n'; continue; }

        if (trimmed !== '{') {
            if (trimmed.endsWith(';')) result += '    '.repeat(indentLevel) + trimmed + '\n';
            else result += '    '.repeat(indentLevel) + '// ' + trimmed + '\n';
        }
    }

    if (result.includes('static main()')) result += `\n// Run main\n${className}.main();\n`;
    return result;
}

function convertParams(params) {
    if (!params || params.trim() === '' || params.trim() === 'String[] args') return '';
    return params.split(',').map(p => p.trim()).filter(p => p && p !== 'String[] args').map(p => {
        const parts = p.split(/\s+/);
        return parts[parts.length - 1];
    }).join(', ');
}

module.exports = { convert };
