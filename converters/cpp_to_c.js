// C++ to C Converter

function convert(code) {
    let result = '#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n#include <stdbool.h>\n\n';
    const lines = code.split('\n');
    let indentLevel = 0;

    for (let line of lines) {
        const trimmed = line.trim();
        if (trimmed === '') { result += '\n'; continue; }

        if (trimmed.startsWith('#include <iostream>') || trimmed.startsWith('#include <string>')) continue;
        if (trimmed.startsWith('#include')) { result += trimmed + '\n'; continue; }
        if (trimmed.startsWith('using namespace')) continue;

        if (trimmed.startsWith('//')) { result += '    '.repeat(indentLevel) + trimmed + '\n'; continue; }

        // cout with chained <<
        if (trimmed.includes('cout')) {
            const coutLine = trimmed.replace(/^\s*cout\s*/, '').replace(/\s*<<\s*endl\s*;?\s*$/, '').replace(/;\s*$/, '');
            const parts = coutLine.split(/\s*<<\s*/).map(p => p.trim()).filter(Boolean);
            // Build printf format
            let fmt = '', args = [];
            parts.forEach(p => {
                if ((p.startsWith('"') && p.endsWith('"')) || (p.startsWith("'") && p.endsWith("'"))) {
                    fmt += p.slice(1, -1);
                } else {
                    fmt += '%s'; args.push(p);
                }
            });
            if (args.length) result += '    '.repeat(indentLevel) + `printf("${fmt}\\n", ${args.join(', ')});\n`;
            else result += '    '.repeat(indentLevel) + `printf("${fmt}\\n");\n`;
            continue;
        }

        // cin
        if (trimmed.includes('cin')) {
            const m = trimmed.match(/cin\s*>>\s*(\w+)\s*;/);
            if (m) { result += '    '.repeat(indentLevel) + `scanf("%d", &${m[1]}); // TODO: Adjust format\n`; continue; }
        }

        // Function definitions
        const funcMatch = trimmed.match(/^(?:void|int|float|double|bool|auto|long)\s+(\w+)\s*\((.*)\)\s*\{?\s*$/);
        if (funcMatch) {
            let rt = trimmed.split(/\s+/)[0];
            if (rt === 'auto') rt = 'int';
            const params = convertParams(funcMatch[2]);
            result += `${rt} ${funcMatch[1]}(${params || 'void'}) {\n`;
            indentLevel++;
            continue;
        }

        // Class to struct
        const classMatch = trimmed.match(/^class\s+(\w+)\s*\{?\s*$/);
        if (classMatch) { result += `typedef struct ${classMatch[1]} {\n`; indentLevel++; continue; }

        const ifMatch = trimmed.match(/^if\s*\((.*)\)\s*\{?\s*$/);
        if (ifMatch) { result += '    '.repeat(indentLevel) + `if (${ifMatch[1]}) {\n`; indentLevel++; continue; }

        const elseIfMatch = trimmed.match(/^}\s*else\s+if\s*\((.*)\)\s*\{?\s*$/);
        if (elseIfMatch) { indentLevel--; result += '    '.repeat(indentLevel) + `} else if (${elseIfMatch[1]}) {\n`; indentLevel++; continue; }

        if (trimmed === '} else {' || trimmed === 'else {') { indentLevel--; result += '    '.repeat(indentLevel) + '} else {\n'; indentLevel++; continue; }

        const forMatch = trimmed.match(/^for\s*\((.*)\)\s*\{?\s*$/);
        if (forMatch) {
            let fc = forMatch[1].replace(/\bauto\b/g, 'int');
            result += '    '.repeat(indentLevel) + `for (${fc}) {\n`; indentLevel++; continue;
        }

        const whileMatch = trimmed.match(/^while\s*\((.*)\)\s*\{?\s*$/);
        if (whileMatch) { result += '    '.repeat(indentLevel) + `while (${whileMatch[1]}) {\n`; indentLevel++; continue; }

        const returnMatch = trimmed.match(/^return\s+(.*);$/);
        if (returnMatch) { result += '    '.repeat(indentLevel) + `return ${returnMatch[1]};\n`; continue; }

        if (trimmed === '}' || trimmed === '};') {
            if (indentLevel > 0) { indentLevel--; result += '    '.repeat(indentLevel) + '}\n'; }
            continue;
        }
        if (trimmed === '{') continue;

        let converted = trimmed.replace(/\bstring\b/g, 'char*').replace(/\bauto\b/g, 'int')
            .replace(/\bnullptr\b/g, 'NULL').replace(/std::/g, '');
        result += '    '.repeat(indentLevel) + converted + (converted.endsWith(';') ? '' : '') + '\n';
    }

    return result;
}

function convertParams(params) {
    if (!params || params.trim() === '') return '';
    return params.split(',').map(p => p.trim()).filter(Boolean).map(p => {
        return p.replace(/\bstring\b/g, 'char*').replace(/\bauto\b/g, 'int').replace(/&/g, '*');
    }).join(', ');
}

module.exports = { convert };
