// JavaScript to C++ Converter

function convert(code) {
    let result = '#include <iostream>\n#include <string>\n#include <vector>\nusing namespace std;\n\n';
    const lines = code.split('\n');
    let indentLevel = 0;

    for (let line of lines) {
        const trimmed = line.trim();
        if (trimmed === '') { result += '\n'; continue; }

        if (trimmed.startsWith('//')) { result += '    '.repeat(indentLevel) + trimmed + '\n'; continue; }

        // console.log
        if (trimmed.includes('console.log')) {
            const m = trimmed.match(/console\.log\s*\(\s*([\s\S]+?)\s*\)\s*;?/);
            if (m) {
                let content = m[1];
                // template literal
                const tmpl = content.match(/^`([^`]*)`$/);
                if (tmpl) {
                    const parts = tmpl[1].split(/\$\{(\w+)\}/);
                    const coutParts = parts.map((p, i) => i % 2 === 0 ? `"${p}"` : p).filter(p => p !== '""');
                    result += '    '.repeat(indentLevel) + `cout << ${coutParts.join(' << ')} << endl;\n`;
                } else {
                    result += '    '.repeat(indentLevel) + `cout << ${content} << endl;\n`;
                }
                continue;
            }
        }

        // function definition
        const funcMatch = trimmed.match(/^(?:async\s+)?function\s+(\w+)\s*\((.*)\)\s*\{?$/);
        if (funcMatch) {
            const params = convertParams(funcMatch[2]);
            if (funcMatch[1] === 'main') result += 'int main() {\n';
            else result += `void ${funcMatch[1]}(${params}) {\n`;
            indentLevel++;
            continue;
        }

        // arrow function
        const arrowMatch = trimmed.match(/^(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\((.*)\)\s*=>\s*\{?$/);
        if (arrowMatch) {
            const params = convertParams(arrowMatch[2]);
            result += `void ${arrowMatch[1]}(${params}) {\n`;
            indentLevel++;
            continue;
        }

        // class
        const classMatch = trimmed.match(/^class\s+(\w+)(?:\s+extends\s+(\w+))?\s*\{?$/);
        if (classMatch) {
            result += classMatch[2]
                ? `class ${classMatch[1]} : public ${classMatch[2]} {\npublic:\n`
                : `class ${classMatch[1]} {\npublic:\n`;
            indentLevel++;
            continue;
        }

        // constructor
        const constructorMatch = trimmed.match(/^constructor\s*\((.*)\)\s*\{?$/);
        if (constructorMatch) {
            const params = convertParams(constructorMatch[1]);
            result += '    '.repeat(indentLevel) + `Constructor(${params}) {\n`;
            indentLevel++;
            continue;
        }

        const ifMatch = trimmed.match(/^if\s*\((.*)\)\s*\{?$/);
        if (ifMatch) {
            let cond = ifMatch[1].replace(/===/g, '==').replace(/!==/g, '!=');
            result += '    '.repeat(indentLevel) + `if (${cond}) {\n`; indentLevel++; continue;
        }

        const elseIfMatch = trimmed.match(/^}\s*else\s+if\s*\((.*)\)\s*\{?$/);
        if (elseIfMatch) {
            indentLevel--;
            let cond = elseIfMatch[1].replace(/===/g, '==').replace(/!==/g, '!=');
            result += '    '.repeat(indentLevel) + `} else if (${cond}) {\n`; indentLevel++; continue;
        }

        if (trimmed === '} else {' || trimmed === 'else {') { indentLevel--; result += '    '.repeat(indentLevel) + '} else {\n'; indentLevel++; continue; }

        const forMatch = trimmed.match(/^for\s*\(\s*(?:let|var|const)\s+(\w+)\s*=\s*(\w+)\s*;\s*\w+\s*<\s*(\w+)\s*;\s*\w+\+\+\s*\)\s*\{?$/);
        if (forMatch) {
            result += '    '.repeat(indentLevel) + `for (int ${forMatch[1]} = ${forMatch[2]}; ${forMatch[1]} < ${forMatch[3]}; ${forMatch[1]}++) {\n`;
            indentLevel++; continue;
        }
        const forOfMatch = trimmed.match(/^for\s*\(\s*(?:let|var|const)\s+(\w+)\s+of\s+(\w+)\s*\)\s*\{?$/);
        if (forOfMatch) { result += '    '.repeat(indentLevel) + `for (auto ${forOfMatch[1]} : ${forOfMatch[2]}) {\n`; indentLevel++; continue; }

        const whileMatch = trimmed.match(/^while\s*\((.*)\)\s*\{?$/);
        if (whileMatch) { result += '    '.repeat(indentLevel) + `while (${whileMatch[1]}) {\n`; indentLevel++; continue; }

        const returnMatch = trimmed.match(/^return\s+(.*?);?$/);
        if (returnMatch) {
            let val = returnMatch[1].replace(/\bnull\b/g, 'nullptr').replace(/\bundefined\b/g, 'nullptr');
            result += '    '.repeat(indentLevel) + `return ${val};\n`; continue;
        }

        if (trimmed === '}' || trimmed === '};') {
            if (indentLevel > 0) { indentLevel--; result += '    '.repeat(indentLevel) + '}\n'; }
            continue;
        }
        if (trimmed === '{') continue;

        const varMatch = trimmed.match(/^(?:const|let|var)\s+(\w+)\s*=\s*(.*?);?$/);
        if (varMatch) {
            const type = detectType(varMatch[2]);
            result += '    '.repeat(indentLevel) + `${type} ${varMatch[1]} = ${varMatch[2].replace(/\bnull\b/g, 'nullptr')};\n`; continue;
        }

        if (trimmed !== '{') {
            if (trimmed.endsWith(';')) result += '    '.repeat(indentLevel) + trimmed + '\n';
            else result += '    '.repeat(indentLevel) + '// ' + trimmed + '\n';
        }
    }

    if (!result.includes('int main(')) result += '\nint main() {\n    // TODO: Add main logic\n    return 0;\n}\n';
    return result;
}

function convertParams(params) {
    if (!params || params.trim() === '') return '';
    return params.split(',').map(p => p.trim()).filter(Boolean).map(p => 'auto ' + p).join(', ');
}

function detectType(v) {
    if (v.startsWith('"') || v.startsWith("'") || v.startsWith('`')) return 'string';
    if (/^\d+$/.test(v)) return 'int';
    if (/^\d+\.\d+$/.test(v)) return 'double';
    if (v === 'true' || v === 'false') return 'bool';
    if (v.startsWith('[')) return 'vector<auto>';
    return 'auto';
}

module.exports = { convert };
