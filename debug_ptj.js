const src = require('fs').readFileSync('./converters/python_to_java.js','utf8');
const patched = src.replace(
    'emitMainLine(trimmed, ci, topStack',
    'process.stderr.write("MAIN:"+trimmed+"\\n"); emitMainLine(trimmed, ci, topStack'
);
const tmp = require('os').tmpdir()+'/ptj_debug.js';
require('fs').writeFileSync(tmp, patched);
const {convert} = require(tmp);
const out = convert(require('fs').readFileSync('./examples/sample_python.py','utf8'));
process.stdout.write(out);
