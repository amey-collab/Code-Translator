// Java to Python Converter

function convert(code) {
    let result = '';
    const lines = code.split('\n');
    let indentLevel = 0;
    let inClass = false;

    for (let line of lines) {
        const trimmed = line.trim();
        if (trimmed === '') { result += '\n'; continue; }

        if (trimmed.startsWith('import ')) { result += '# ' + trimmed + '\n'; continue; }
        if (trimmed.startsWith('package ')) continue;

        if (trimmed.startsWith('//')) { result += '    '.repeat(indentLevel) + '#' + trimmed.substring(2) + '\n'; continue; }

        // System.out.println - handle string + variable concatenation
        if (trimmed.includes('System.out.print')) {
            const m = trimmed.match(/System\.out\.println?\s*\(\s*([\s\S]+?)\s*\)\s*;/);
            if (m) {
                let content = m[1];
                // Convert Java string concatenation with int to Python str()
                content = content.replace(/"([^"]*?)"\s*\+\s*(\w+)/g, (_, s, v) => `"${s}" + str(${v})`);
                content = content.replace(/(\w+)\s*\+\s*"([^"]*?)"/g, (_, v, s) => `str(${v}) + "${s}"`);
                result += '    '.repeat(indentLevel) + `print(${content})\n`;
                continue;
            }
        }

        // Class definition
        const classMatch = trimmed.match(/^(?:public\s+)?class\s+(\w+)(?:\s+extends\s+(\w+))?\s*\{?$/);
        if (classMatch) {
            result += classMatch[2] ? `class ${classMatch[1]}(${classMatch[2]}):\n` : `class ${classMatch[1]}:\n`;
            indentLevel++;
            inClass = true;
            continue;
        }

        // Method definition
        const methodMatch = trimmed.match(/^(?:public|private|protected)?\s*(?:static\s+)?(?:void|int|float|double|String|boolean|Object|long)\s+(\w+)\s*\((.*)\)\s*\{?$/);
        if (methodMatch) {
            const methodName = methodMatch[1];
            const params = convertParams(methodMatch[2]);
            if (methodName === 'main') {
                result += '    '.repeat(indentLevel) + 'def main():\n';
            } else if (inClass) {
                result += '    '.repeat(indentLevel) + `def ${methodName}(self${params ? ', ' + params : ''}):\n`;
            } else {
                result += '    '.repeat(indentLevel) + `def ${methodName}(${params}):\n`;
            }
            indentLevel++;
            continue;
        }

        // Constructor
        const constructorMatch = trimmed.match(/^(?:public\s+)?(\w+)\s*\((.*)\)\s*\{?$/);
        if (constructorMatch && inClass && !trimmed.includes('if') && !trimmed.includes('while') && !trimmed.includes('for')) {
            const params = convertParams(constructorMatch[2]);
            result += '    '.repeat(indentLevel) + `def __init__(self${params ? ', ' + params : ''}):\n`;
            indentLevel++;
            continue;
        }

        // if / else if / else
        const ifMatch = trimmed.match(/^if\s*\((.*)\)\s*\{?$/);
        if (ifMatch) { result += '    '.repeat(indentLevel) + `if ${convertCondition(ifMatch[1])}:\n`; indentLevel++; continue; }

        const elseIfMatch = trimmed.match(/^}\s*else\s+if\s*\((.*)\)\s*\{?$/);
        if (elseIfMatch) { indentLevel--; result += '    '.repeat(indentLevel) + `elif ${convertCondition(elseIfMatch[1])}:\n`; indentLevel++; continue; }

        if (trimmed === '} else {' || trimmed === 'else {') { indentLevel--; result += '    '.repeat(indentLevel) + 'else:\n'; indentLevel++; continue; }

        // for loop
        const forMatch = trimmed.match(/^for\s*\(\s*(?:int|var)\s+(\w+)\s*=\s*(\w+)\s*;\s*\w+\s*<\s*(\w+)\s*;\s*\w+\+\+\s*\)\s*\{?$/);
        if (forMatch) {
            const start = forMatch[2], end = forMatch[3];
            result += '    '.repeat(indentLevel) + (start === '0' ? `for ${forMatch[1]} in range(${end}):\n` : `for ${forMatch[1]} in range(${start}, ${end}):\n`);
            indentLevel++;
            continue;
        }
        const enhancedFor = trimmed.match(/^for\s*\(\s*(?:\w+)\s+(\w+)\s*:\s*(\w+)\s*\)\s*\{?$/);
        if (enhancedFor) { result += '    '.repeat(indentLevel) + `for ${enhancedFor[1]} in ${enhancedFor[2]}:\n`; indentLevel++; continue; }

        // while
        const whileMatch = trimmed.match(/^while\s*\((.*)\)\s*\{?$/);
        if (whileMatch) { result += '    '.repeat(indentLevel) + `while ${convertCondition(whileMatch[1])}:\n`; indentLevel++; continue; }

        // return
        const returnMatch = trimmed.match(/^return\s+(.*);$/);
        if (returnMatch) { result += '    '.repeat(indentLevel) + `return ${convertValue(returnMatch[1])}\n`; continue; }

        // closing brace
        if (trimmed === '}' || trimmed === '};') { if (indentLevel > 0) indentLevel--; continue; }
        if (trimmed === '{') continue;

        // variable declarations
        const varMatch = trimmed.match(/^(?:int|float|double|String|boolean|var|Object|long)\s+(\w+)\s*=\s*(.*);$/);
        if (varMatch) { result += '    '.repeat(indentLevel) + `${varMatch[1]} = ${convertValue(varMatch[2])}\n`; continue; }

        // this.x -> self.x
        let converted = trimmed.replace(/\bthis\./g, 'self.');
        if (converted.endsWith(';')) {
            result += '    '.repeat(indentLevel) + converted.slice(0, -1) + '\n'; continue;
        }

        result += '    '.repeat(indentLevel) + '# ' + trimmed + '\n';
    }

    if (result.includes('def main():')) {
        result += '\n\nif __name__ == "__main__":\n    main()\n';
    }

    return result;
}

function convertParams(params) {
    if (!params || params.trim() === '' || params.trim() === 'String[] args') return '';
    return params.split(',').map(p => p.trim()).filter(p => p && p !== 'String[] args').map(p => {
        const parts = p.split(/\s+/);
        return parts[parts.length - 1];
    }).join(', ');
}

function convertCondition(c) {
    return c.replace(/&&/g, ' and ').replace(/\|\|/g, ' or ').replace(/!(?!=)/g, 'not ')
        .replace(/\btrue\b/g, 'True').replace(/\bfalse\b/g, 'False').replace(/\bnull\b/g, 'None')
        .replace(/\.equals\s*\(\s*"([^"]*)"\s*\)/g, ' == "$1"');
}

function convertValue(v) {
    return v.replace(/\btrue\b/g, 'True').replace(/\bfalse\b/g, 'False').replace(/\bnull\b/g, 'None')
        .replace(/new\s+ArrayList<.*>\s*\(\)/g, '[]').replace(/new\s+HashMap<.*>\s*\(\)/g, '{}');
}

module.exports = { convert };
