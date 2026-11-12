// Python to C++ Converter

function convert(code) {
    let result = '#include <iostream>\n#include <string>\n#include <vector>\nusing namespace std;\n\n';
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
                indentStack.pop();
                varScopes.pop();
                result += '    '.repeat(indentStack.length) + '}\n';
            }
        }

        const outIndent = Math.max(0, indentStack.length - 1);

        if (trimmed.startsWith('#')) { result += '    '.repeat(outIndent) + '//' + trimmed.substring(1) + '\n'; continue; }

        // print
        if (trimmed.startsWith('print(')) {
            const inner = trimmed.slice(6, -1).trim();
            // f-string
            const fStr = inner.match(/^f["'](.*)["']$/);
            if (fStr) {
                result += '    '.repeat(outIndent) + `cout << "${fStr[1]}" << endl;\n`; continue;
            }
            // string literal
            const strLit = inner.match(/^["'](.*)["']$/);
            if (strLit) {
                result += '    '.repeat(outIndent) + `cout << "${strLit[1]}" << endl;\n`; continue;
            }
            // concatenation or variable
            result += '    '.repeat(outIndent) + `cout << ${inner} << endl;\n`;
            continue;
        }

        // def
        if (trimmed.startsWith('def ')) {
            const m = trimmed.match(/def\s+(\w+)\s*\((.*)\)\s*:/);
            if (m) {
                const params = convertParams(m[2]);
                if (m[1] === 'main') result += 'int main() {\n';
                else result += `void ${m[1]}(${params}) {\n`;
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
                    ? `class ${m[1]} : public ${m[2]} {\npublic:\n`
                    : `class ${m[1]} {\npublic:\n`;
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
            const loopVar = varExists(v) ? v : `int ${v}`;
            if (!varExists(v)) declareVar(v);
            if (step === '1') {
                result += '    '.repeat(outIndent) + `for (${loopVar} = ${start}; ${v} < ${end}; ${v}++) {\n`;
            } else {
                result += '    '.repeat(outIndent) + `for (${loopVar} = ${start}; ${v} < ${end}; ${v} += ${step}) {\n`;
            }
            indentStack.push(currentIndent + 4);
            varScopes.push(new Set());
            continue;
        }
        // for in
        const forIn = trimmed.match(/^for\s+(\w+)\s+in\s+([\w\.\[\]\'\"]+)\s*:/);
        if (forIn) {
            const item = forIn[1];
            const iterable = forIn[2];
            const itemDecl = varExists(item) ? item : `auto ${item}`;
            if (!varExists(item)) declareVar(item);
            result += '    '.repeat(outIndent) + `for (${itemDecl} : ${iterable}) {\n`;
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

        // variable assignment
        const assignMatch = trimmed.match(/^(\w+)\s*=\s*(.+)$/);
        if (assignMatch && !trimmed.includes('==') && !trimmed.includes('!=')) {
            const varName = assignMatch[1], val = assignMatch[2];
            const convertedVal = convertValue(val);
            if (varExists(varName)) {
                result += '    '.repeat(outIndent) + `${varName} = ${convertedVal};\n`;
            } else {
                const type = detectType(val);
                declareVar(varName);
                result += '    '.repeat(outIndent) + `${type} ${varName} = ${convertedVal};\n`;
            }
            continue;
        }

        // function calls ending with )
        if (trimmed.endsWith(')') || trimmed.endsWith(');')) {
            result += '    '.repeat(outIndent) + trimmed + (trimmed.endsWith(';') ? '' : ';') + '\n'; continue;
        }

        result += '    '.repeat(outIndent) + '// ' + trimmed + '\n';
    }

    while (indentStack.length > 1) {
        indentStack.pop();
        varScopes.pop();
        result += '    '.repeat(indentStack.length - 1) + '}\n';
    }

    if (!result.includes('int main(')) {
        result += '\nint main() {\n    // TODO: Add main logic\n    return 0;\n}\n';
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
        return 'auto ' + p;
    }).join(', ');
}

function convertType(t) {
    const map = { 'int': 'int', 'str': 'string', 'float': 'double', 'bool': 'bool', 'list': 'vector<auto>', 'dict': 'map<string, auto>' };
    return map[t] || 'auto';
}

function detectType(v) {
    if (v.startsWith('"') || v.startsWith("'")) return 'string';
    if (/^\d+$/.test(v)) return 'int';
    if (/^\d+\.\d+$/.test(v)) return 'double';
    if (v === 'True' || v === 'False') return 'bool';
    return 'auto';
}

function convertValue(v) {
    return v.replace(/\bTrue\b/g, 'true').replace(/\bFalse\b/g, 'false').replace(/\bNone\b/g, 'nullptr');
}

function convertCondition(c) {
    return c.replace(/\band\b/g, '&&').replace(/\bor\b/g, '||').replace(/\bnot\b/g, '!')
        .replace(/\bTrue\b/g, 'true').replace(/\bFalse\b/g, 'false').replace(/\bNone\b/g, 'nullptr');
}

module.exports = { convert };
