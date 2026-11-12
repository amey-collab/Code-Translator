// JavaScript to Java Converter

function convert(code) {
    let result = 'import java.util.*;\n\npublic class ConvertedCode {\n';
    const lines = code.split('\n');
    let indentLevel = 1;
    let className = 'ConvertedCode';

    for (let line of lines) {
        const trimmed = line.trim();
        if (trimmed === '') { result += '\n'; continue; }

        if (trimmed.startsWith('//')) { result += '    '.repeat(indentLevel) + trimmed + '\n'; continue; }

        // console.log
        if (trimmed.includes('console.log')) {
            const m = trimmed.match(/console\.log\s*\(\s*([\s\S]+?)\s*\)\s*;?/);
            if (m) { result += '    '.repeat(indentLevel) + `System.out.println(${m[1]});\n`; continue; }
        }

        // function definition
        const funcMatch = trimmed.match(/^(?:async\s+)?function\s+(\w+)\s*\((.*)\)\s*\{?$/);
        if (funcMatch) {
            const params = convertParams(funcMatch[2]);
            if (funcMatch[1] === 'main') result += '    '.repeat(indentLevel) + 'public static void main(String[] args) {\n';
            else result += '    '.repeat(indentLevel) + `public static void ${funcMatch[1]}(${params}) {\n`;
            indentLevel++;
            continue;
        }

        // arrow function
        const arrowMatch = trimmed.match(/^(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\((.*)\)\s*=>\s*\{?$/);
        if (arrowMatch) {
            const params = convertParams(arrowMatch[2]);
            result += '    '.repeat(indentLevel) + `public static void ${arrowMatch[1]}(${params}) {\n`;
            indentLevel++;
            continue;
        }

        // class
        const classMatch = trimmed.match(/^class\s+(\w+)(?:\s+extends\s+(\w+))?\s*\{?$/);
        if (classMatch) {
            className = classMatch[1];
            result = result.replace('public class ConvertedCode', classMatch[2]
                ? `public class ${className} extends ${classMatch[2]}`
                : `public class ${className}`);
            continue;
        }

        // constructor
        const constructorMatch = trimmed.match(/^constructor\s*\((.*)\)\s*\{?$/);
        if (constructorMatch) {
            const params = convertParams(constructorMatch[1]);
            result += '    '.repeat(indentLevel) + `public ${className}(${params}) {\n`;
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
        if (forOfMatch) { result += '    '.repeat(indentLevel) + `for (var ${forOfMatch[1]} : ${forOfMatch[2]}) {\n`; indentLevel++; continue; }

        const whileMatch = trimmed.match(/^while\s*\((.*)\)\s*\{?$/);
        if (whileMatch) { result += '    '.repeat(indentLevel) + `while (${whileMatch[1]}) {\n`; indentLevel++; continue; }

        const returnMatch = trimmed.match(/^return\s+(.*?);?$/);
        if (returnMatch) { result += '    '.repeat(indentLevel) + `return ${returnMatch[1]};\n`; continue; }

        if (trimmed === '}' || trimmed === '};') {
            if (indentLevel > 1) { indentLevel--; result += '    '.repeat(indentLevel) + '}\n'; }
            continue;
        }
        if (trimmed === '{') continue;

        const varMatch = trimmed.match(/^(?:const|let|var)\s+(\w+)\s*=\s*(.*?);?$/);
        if (varMatch) {
            const type = detectType(varMatch[2]);
            result += '    '.repeat(indentLevel) + `${type} ${varMatch[1]} = ${varMatch[2]};\n`; continue;
        }

        if (trimmed !== '{') {
            if (trimmed.endsWith(';')) result += '    '.repeat(indentLevel) + trimmed + '\n';
            else result += '    '.repeat(indentLevel) + '// ' + trimmed + '\n';
        }
    }

    result += '}\n';
    return result;
}

function convertParams(params) {
    if (!params || params.trim() === '') return '';
    return params.split(',').map(p => p.trim()).filter(Boolean).map(p => 'Object ' + p).join(', ');
}

function detectType(v) {
    if (v.startsWith('"') || v.startsWith("'")) return 'String';
    if (/^\d+$/.test(v)) return 'int';
    if (/^\d+\.\d+$/.test(v)) return 'double';
    if (v === 'true' || v === 'false') return 'boolean';
    if (v.startsWith('[')) return 'ArrayList<Object>';
    if (v.startsWith('{')) return 'HashMap<String, Object>';
    return 'var';
}

module.exports = { convert };
