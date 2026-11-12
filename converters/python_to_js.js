// Python to JavaScript Converter

function convert(code) {
    let result = '';
    const lines = code.split('\n');
    let indentStack = [0];
    let varScopes = [new Set()];

    function declareVar(name) {
        if (!name) return;
        if (!varExists(name)) varScopes[varScopes.length - 1].add(name);
    }

    function varExists(name) {
        for (let i = varScopes.length - 1; i >= 0; i--) {
            if (varScopes[i].has(name)) return true;
        }
        return false;
    }

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
                indentStack.pop();                varScopes.pop();                result += '    '.repeat(indentStack.length - 1) + '}\n';
            }
        }

        const outIndent = Math.max(0, indentStack.length - 1);

        if (trimmed.startsWith('#')) { result += '    '.repeat(outIndent) + '//' + trimmed.substring(1) + '\n'; continue; }

        // print
        if (trimmed.startsWith('print(')) {
            const inner = trimmed.slice(6, -1).trim();
            const fStr = inner.match(/^f["'](.*)["']$/);
            if (fStr) {
                const jsTemplate = fStr[1].replace(/\{(\w+)\}/g, '${$1}');
                result += '    '.repeat(outIndent) + `console.log(\`${jsTemplate}\`);\n`; continue;
            }
            result += '    '.repeat(outIndent) + `console.log(${inner});\n`;
            continue;
        }

        // def
        if (trimmed.startsWith('def ')) {
            const m = trimmed.match(/def\s+(\w+)\s*\((.*)\)\s*:/);
            if (m) {
                const params = convertParams(m[2]);
                if (m[1] === '__init__') result += '    '.repeat(outIndent) + `constructor(${params}) {\n`;
                else result += '    '.repeat(outIndent) + `function ${m[1]}(${params}) {\n`;
                indentStack.push(currentIndent + 4);
                varScopes.push(new Set());
                continue;
            }
        }

        // class
        if (trimmed.startsWith('class ')) {
            const m = trimmed.match(/class\s+(\w+)(?:\s*\(\s*(\w+)\s*\))?.*:/);
            if (m) {
                result += m[2] && m[2] !== 'object'
                    ? '    '.repeat(outIndent) + `class ${m[1]} extends ${m[2]} {\n`
                    : '    '.repeat(outIndent) + `class ${m[1]} {\n`;
                indentStack.push(currentIndent + 4);
                varScopes.push(new Set());
                continue;
            }
        }

        // if / elif / else
        if (trimmed.startsWith('if ') && trimmed.endsWith(':')) {
            const cond = convertCondition(trimmed.slice(3, -1).trim());
            result += '    '.repeat(outIndent) + `if (${cond}) {\n`;
            indentStack.push(currentIndent + 4);
            varScopes.push(new Set());
            continue;
        }
        if (isElif) {
            result += '    '.repeat(outIndent - 1) + '} ';
            const cond = convertCondition(trimmed.slice(5, -1).trim());
            result += `else if (${cond}) {\n`;
            indentStack[indentStack.length - 1] = currentIndent + 4;
            varScopes.push(new Set());
            continue;
        }
        if (isElse) {
            result += '    '.repeat(outIndent - 1) + '} else {\n';
            indentStack[indentStack.length - 1] = currentIndent + 4;
            varScopes.push(new Set());
            continue;
        }

        // for range
        const forRange = trimmed.match(/^for\s+(\w+)\s+in\s+range\s*\(\s*([^,]+?)(?:\s*,\s*([^,]+?)(?:\s*,\s*([^,]+?))?)?\s*\)\s*:/);
        if (forRange) {
            const v = forRange[1];
            const hasExplicitStart = !!forRange[3];
            const start = hasExplicitStart ? forRange[2].trim() : '0';
            const end = hasExplicitStart ? forRange[3].trim() : forRange[2].trim();
            const step = (hasExplicitStart && forRange[4]) ? forRange[4].trim() : '1';
            const varDecl = varExists(v) ? v : `let ${v}`;
            if (!varExists(v)) declareVar(v);
            if (step === '1') {
                result += '    '.repeat(outIndent) + `for (${varDecl} = ${start}; ${v} < ${end}; ${v}++) {\n`;
            } else {
                result += '    '.repeat(outIndent) + `for (${varDecl} = ${start}; ${v} < ${end}; ${v} += ${step}) {\n`;
            }
            indentStack.push(currentIndent + 4);
            varScopes.push(new Set());
            continue;
        }
        const forIn = trimmed.match(/^for\s+(\w+)\s+in\s+([\w\.\[\]\'\"]+)\s*:/);
        if (forIn) {
            const loopItem = forIn[1];
            const iterable = forIn[2];
            const itemDecl = varExists(loopItem) ? loopItem : `const ${loopItem}`;
            if (!varExists(loopItem)) declareVar(loopItem);
            result += '    '.repeat(outIndent) + `for (${itemDecl} of ${iterable}) {\n`;
            indentStack.push(currentIndent + 4);
            varScopes.push(new Set());
            continue;
        }

        // while
        if (trimmed.startsWith('while ') && trimmed.endsWith(':')) {
            const cond = convertCondition(trimmed.slice(6, -1).trim());
            result += '    '.repeat(outIndent) + `while (${cond}) {\n`;
            indentStack.push(currentIndent + 4);
            varScopes.push(new Set());
            continue;
        }

        // return
        if (trimmed.startsWith('return ')) {
            result += '    '.repeat(outIndent) + `return ${convertValue(trimmed.slice(7))};\n`; continue;
        }

        // self.x -> this.x
        let converted = trimmed.replace(/\bself\./g, 'this.');

        // variable assignment
        const assignMatch = converted.match(/^(\w+)\s*=\s*(.+)$/);
        if (assignMatch && !converted.includes('==') && !converted.includes('!=')) {
            const varName = assignMatch[1], val = convertValue(assignMatch[2]);
            if (varName.startsWith('this.')) {
                result += '    '.repeat(outIndent) + `${varName} = ${val};\n`;
            } else if (varExists(varName)) {
                result += '    '.repeat(outIndent) + `${varName} = ${val};\n`;
            } else {
                declareVar(varName);
                result += '    '.repeat(outIndent) + `let ${varName} = ${val};\n`;
            }
            continue;
        }

        // function calls
        if (converted.endsWith(')') || converted.endsWith(');')) {
            result += '    '.repeat(outIndent) + converted + (converted.endsWith(';') ? '' : ';') + '\n'; continue;
        }

        result += '    '.repeat(outIndent) + '// ' + trimmed + '\n';
    }

    while (indentStack.length > 1) {
        indentStack.pop();
        varScopes.pop();
        result += '    '.repeat(indentStack.length - 1) + '}\n';
    }

    return result;
}

function convertParams(params) {
    if (!params || params.trim() === '' || params.trim() === 'self') return '';
    return params.split(',').map(p => p.trim()).filter(p => p && p !== 'self').map(p => {
        return p.includes(':') ? p.split(':')[0].trim() : p;
    }).join(', ');
}

function convertCondition(c) {
    return c.replace(/\band\b/g, '&&').replace(/\bor\b/g, '||').replace(/\bnot\b/g, '!')
        .replace(/\bTrue\b/g, 'true').replace(/\bFalse\b/g, 'false').replace(/\bNone\b/g, 'null')
        .replace(/\bis not\b/g, '!==').replace(/\bis\b/g, '===');
}

function convertValue(v) {
    return v.replace(/\bTrue\b/g, 'true').replace(/\bFalse\b/g, 'false').replace(/\bNone\b/g, 'null');
}

module.exports = { convert };
