// JavaScript to C Converter

function convert(code) {
    let result = '#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n#include <stdbool.h>\n\n';
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
                const strLit = content.match(/^["']([^"']*)["']$/);
                if (strLit) { result += '    '.repeat(indentLevel) + `printf("${strLit[1]}\\n");\n`; continue; }
                const varOnly = content.match(/^(\w+)$/);
                if (varOnly) { result += '    '.repeat(indentLevel) + `printf("%d\\n", ${varOnly[1]}); // TODO: Adjust format\n`; continue; }
                result += '    '.repeat(indentLevel) + `printf("%s\\n", ${content}); // TODO: Adjust format\n`;
                continue;
            }
        }

        // function definition
        const funcMatch = trimmed.match(/^(?:async\s+)?function\s+(\w+)\s*\((.*)\)\s*\{?$/);
        if (funcMatch) {
            const params = convertParams(funcMatch[2]);
            if (funcMatch[1] === 'main') result += 'int main(int argc, char *argv[]) {\n';
            else result += `void ${funcMatch[1]}(${params || 'void'}) {\n`;
            indentLevel++;
            continue;
        }

        // arrow function
        const arrowMatch = trimmed.match(/^(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\((.*)\)\s*=>\s*\{?$/);
        if (arrowMatch) {
            const params = convertParams(arrowMatch[2]);
            result += `void ${arrowMatch[1]}(${params || 'void'}) {\n`;
            indentLevel++;
            continue;
        }

        // Skip class (C doesn't have classes)
        const classMatch = trimmed.match(/^class\s+(\w+)/);
        if (classMatch) { result += `// Class ${classMatch[1]} - convert to struct/functions manually\ntypedef struct ${classMatch[1]} {\n`; indentLevel++; continue; }

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

        const whileMatch = trimmed.match(/^while\s*\((.*)\)\s*\{?$/);
        if (whileMatch) { result += '    '.repeat(indentLevel) + `while (${whileMatch[1]}) {\n`; indentLevel++; continue; }

        const returnMatch = trimmed.match(/^return\s+(.*?);?$/);
        if (returnMatch) {
            let val = returnMatch[1].replace(/\bnull\b/g, 'NULL').replace(/\bundefined\b/g, 'NULL');
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
            result += '    '.repeat(indentLevel) + `${type} ${varMatch[1]} = ${varMatch[2].replace(/\bnull\b/g, 'NULL')};\n`; continue;
        }

        if (trimmed !== '{') {
            if (trimmed.endsWith(';')) result += '    '.repeat(indentLevel) + trimmed + '\n';
            else result += '    '.repeat(indentLevel) + '// ' + trimmed + '\n';
        }
    }

    if (!result.includes('int main(')) result += '\nint main(int argc, char *argv[]) {\n    // TODO: Add main logic\n    return 0;\n}\n';
    return result;
}

function convertParams(params) {
    if (!params || params.trim() === '') return '';
    return params.split(',').map(p => p.trim()).filter(Boolean).map(p => 'int ' + p).join(', ');
}

function detectType(v) {
    if (v.startsWith('"') || v.startsWith("'")) return 'char*';
    if (/^\d+$/.test(v)) return 'int';
    if (/^\d+\.\d+$/.test(v)) return 'double';
    if (v === 'true' || v === 'false') return 'bool';
    return 'int';
}

module.exports = { convert };
