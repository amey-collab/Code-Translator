const fs = require('fs');
const code = fs.readFileSync('./examples/sample_python.py', 'utf8');
const lines = code.split('\n');
const className = 'ConvertedCode';

let methods = '';
let mainBody = '';
let inBlock = false;
let blockBaseIndent = 0;
let methodStack = [0];
let topStack = [0];

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === '') {
        if (inBlock) methods += '\n';
        else mainBody += '\n';
        continue;
    }

    const ci = line.search(/\S/);

    if (inBlock && ci <= blockBaseIndent) {
        while (methodStack.length > 1) {
            methodStack.pop();
            methods += '    '.repeat(1 + methodStack.length - 1) + '}\n';
        }
        inBlock = false;
        methodStack = [0];
        console.log('CLOSED BLOCK, line:', JSON.stringify(trimmed), 'ci:', ci, 'blockBaseIndent:', blockBaseIndent);
    }

    if (!inBlock && (trimmed.startsWith('def ') || trimmed.startsWith('class '))) {
        inBlock = true;
        blockBaseIndent = ci;
        console.log('OPENED BLOCK:', JSON.stringify(trimmed));
    }

    if (inBlock) {
        methods += '[METHOD]' + trimmed + '\n';
    } else {
        mainBody += '[MAIN]' + trimmed + '\n';
        console.log('MAIN LINE:', JSON.stringify(trimmed));
    }
}

console.log('\n=== mainBody ===');
console.log(mainBody);
