// Load the actual module functions by eval-ing the file
const src = require('fs').readFileSync('./converters/python_to_java.js', 'utf8');
// Extract just the emitMainLine function and helpers
eval(src.replace('module.exports = { convert };', ''));

let out = '';
const emit = (s) => { out += s; };
const stack = [0];

const testLines = [
    { trimmed: '# Main execution', ci: 0 },
    { trimmed: 'x = 10', ci: 0 },
    { trimmed: 'result = add(x, y)', ci: 0 },
    { trimmed: 'print(result)', ci: 0 },
    { trimmed: 'for i in range(5):', ci: 0 },
    { trimmed: 'print(i)', ci: 4 },
    { trimmed: 'if x > 5:', ci: 0 },
    { trimmed: 'print("x is greater than 5")', ci: 4 },
    { trimmed: 'elif x == 5:', ci: 0 },
    { trimmed: 'print("x equals 5")', ci: 4 },
    { trimmed: 'else:', ci: 0 },
    { trimmed: 'print("x is less than 5")', ci: 4 },
];

for (const {trimmed, ci} of testLines) {
    emitMainLine(trimmed, ci, stack, emit);
}

// Close remaining
while (stack.length > 1) {
    stack.pop();
    out += '        ' + '    '.repeat(stack.length - 1) + '}\n';
}

console.log(out);
