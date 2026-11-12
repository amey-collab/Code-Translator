// JavaScript to Python Converter

function convert(code) {
    let result = '';
    const lines = code.split('\n');
    let indentLevel = 0;

    for (let line of lines) {
        const trimmed = line.trim();
        if (trimmed === '') { result += '\n'; continue; }

        if (trimmed.startsWith('//')) { result += '    '.repeat(indentLevel) + '#' + trimmed.substring(2) + '\n'; continue; }

        // console.log
        if (trimmed.includes('console.log')) {
            const m = trimmed.match(/console\.log\s*\(\s*([\s\S]+?)\s*\)\s*;?/);
            if (m) {
                let content = m[1];
                // template literal -> f-string
                content = content.replace(/`([^`]*)`/g, (_, s) => {
                    const pyStr = s.replace(/\$\{(\w+)\}/g, '{$1}');
                    return `f"${pyStr}"`;
                });
                result += '    '.repeat(indentLevel) + `print(${content})\n`;
                continue;
            }
        }

        // function definition
        const funcMatch = trimmed.match(/^(?:async\s+)?function\s+(\w+)\s*\((.*)\)\s*\{?$/);
        if (funcMatch) {
            result += '    '.repeat(indentLevel) + `def ${funcMatch[1]}(${funcMatch[2]}):\n`;
            indentLevel++;
            continue;
        }

        // arrow function
        const arrowMatch = trimmed.match(/^(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\((.*)\)\s*=>\s*\{?$/);
        if (arrowMatch) {
            result += '    '.repeat(indentLevel) + `def ${arrowMatch[1]}(${arrowMatch[2]}):\n`;
            indentLevel++;
            continue;
        }

        // class
        const classMatch = trimmed.match(/^class\s+(\w+)(?:\s+extends\s+(\w+))?\s*\{?$/);
        if (classMatch) {
            result += '    '.repeat(indentLevel) + (classMatch[2]
                ? `class ${classMatch[1]}(${classMatch[2]}):\n`
                : `class ${classMatch[1]}:\n`);
            indentLevel++;
            continue;
        }

        // constructor
        const constructorMatch = trimmed.match(/^constructor\s*\((.*)\)\s*\{?$/);
        if (constructorMatch) {
            const params = constructorMatch[1];
            result += '    '.repeat(indentLevel) + `def __init__(self${params ? ', ' + params : ''}):\n`;
            indentLevel++;
            continue;
        }

        // method in class
        const methodMatch = trimmed.match(/^(?:async\s+)?(\w+)\s*\((.*)\)\s*\{$/);
        if (methodMatch && !['if', 'while', 'for', 'switch'].includes(methodMatch[1])) {
            const params = methodMatch[2];
            result += '    '.repeat(indentLevel) + `def ${methodMatch[1]}(self${params ? ', ' + params : ''}):\n`;
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
        const forMatch = trimmed.match(/^for\s*\(\s*(?:let|var|const)\s+(\w+)\s*=\s*(\w+)\s*;\s*\w+\s*<\s*(\w+)\s*;\s*\w+\+\+\s*\)\s*\{?$/);
        if (forMatch) {
            const start = forMatch[2], end = forMatch[3];
            result += '    '.repeat(indentLevel) + (start === '0' ? `for ${forMatch[1]} in range(${end}):\n` : `for ${forMatch[1]} in range(${start}, ${end}):\n`);
            indentLevel++;
            continue;
        }
        const forOfMatch = trimmed.match(/^for\s*\(\s*(?:let|var|const)\s+(\w+)\s+of\s+(\w+)\s*\)\s*\{?$/);
        if (forOfMatch) { result += '    '.repeat(indentLevel) + `for ${forOfMatch[1]} in ${forOfMatch[2]}:\n`; indentLevel++; continue; }

        // while
        const whileMatch = trimmed.match(/^while\s*\((.*)\)\s*\{?$/);
        if (whileMatch) { result += '    '.repeat(indentLevel) + `while ${convertCondition(whileMatch[1])}:\n`; indentLevel++; continue; }

        // return
        const returnMatch = trimmed.match(/^return\s+(.*?);?$/);
        if (returnMatch) {
            let val = convertValue(returnMatch[1]);
            result += '    '.repeat(indentLevel) + `return ${val}\n`; continue;
        }

        // closing brace
        if (trimmed === '}' || trimmed === '};') { if (indentLevel > 0) indentLevel--; continue; }
        if (trimmed === '{') continue;

        // variable declarations
        const varMatch = trimmed.match(/^(?:const|let|var)\s+(\w+)\s*=\s*(.*?);?$/);
        if (varMatch) {
            let val = convertValue(varMatch[2]);
            result += '    '.repeat(indentLevel) + `${varMatch[1]} = ${val}\n`;
            continue;
        }

        // this.x -> self.x
        let converted = trimmed.replace(/\bthis\./g, 'self.');
        if (converted.endsWith(';')) converted = converted.slice(0, -1);
        result += '    '.repeat(indentLevel) + converted + '\n';
    }

    return result;
}

function convertCondition(c) {
    return c.replace(/&&/g, ' and ').replace(/\|\|/g, ' or ').replace(/!(?!=)/g, 'not ')
        .replace(/===/g, '==').replace(/!==/g, '!=')
        .replace(/\btrue\b/g, 'True').replace(/\bfalse\b/g, 'False')
        .replace(/\bnull\b/g, 'None').replace(/\bundefined\b/g, 'None');
}

function convertValue(v) {
    return v.replace(/\btrue\b/g, 'True').replace(/\bfalse\b/g, 'False')
        .replace(/\bnull\b/g, 'None').replace(/\bundefined\b/g, 'None');
}

module.exports = { convert };
