// Kiro Code Translator - Browser Converters
// All conversions are direct (no chaining) to avoid compounding errors

const KiroConverters = {
    detectLanguage: function(code) {
        const patterns = {
            python: ['def ', 'import ', 'print(', 'elif ', 'class '],
            cpp: ['#include', 'cout', 'cin', 'std::', 'using namespace'],
            java: ['public class', 'System.out', 'public static void main'],
            javascript: ['function ', 'console.log', 'const ', 'let ', '=>'],
            c: ['#include <stdio', 'printf(', 'scanf(', 'int main(']
        };
        let maxScore = 0, detected = 'python';
        for (const lang in patterns) {
            let score = 0;
            for (const kw of patterns[lang]) { if (code.includes(kw)) score += 2; }
            if (score > maxScore) { maxScore = score; detected = lang; }
        }
        return maxScore >= 2 ? detected : 'python';
    },

    // ─── Shared helpers ───────────────────────────────────────────────────────

    _pyCondition: function(c) {
        return c.replace(/&&/g,' and ').replace(/\|\|/g,' or ').replace(/!(?!=)/g,'not ')
            .replace(/===/g,'==').replace(/!==/g,'!=')
            .replace(/\btrue\b/g,'True').replace(/\bfalse\b/g,'False')
            .replace(/\bnull\b/g,'None').replace(/\bundefined\b/g,'None')
            .replace(/\bnullptr\b/g,'None').replace(/\bNULL\b/g,'None');
    },
    _cppCondition: function(c) {
        return c.replace(/\band\b/g,'&&').replace(/\bor\b/g,'||').replace(/\bnot\b/g,'!')
            .replace(/\bTrue\b/g,'true').replace(/\bFalse\b/g,'false')
            .replace(/\bNone\b/g,'nullptr').replace(/\bNULL\b/g,'nullptr');
    },
    _javaCondition: function(c) {
        return c.replace(/\band\b/g,'&&').replace(/\bor\b/g,'||').replace(/\bnot\b/g,'!')
            .replace(/\bTrue\b/g,'true').replace(/\bFalse\b/g,'false').replace(/\bNone\b/g,'null');
    },
    _pyValue: function(v) {
        return v.replace(/\btrue\b/g,'True').replace(/\bfalse\b/g,'False')
            .replace(/\bnull\b/g,'None').replace(/\bundefined\b/g,'None')
            .replace(/\bnullptr\b/g,'None').replace(/\bNULL\b/g,'None');
    },
    _cppValue: function(v) {
        return v.replace(/\bTrue\b/g,'true').replace(/\bFalse\b/g,'false').replace(/\bNone\b/g,'nullptr');
    },
    _javaValue: function(v) {
        return v.replace(/\bTrue\b/g,'true').replace(/\bFalse\b/g,'false').replace(/\bNone\b/g,'null').replace(/'/g,'"');
    },

    // ─── Python → X ──────────────────────────────────────────────────────────

    pythonToCpp: function(code) {
        const self = this;
        let result = '#include <iostream>\n#include <string>\n#include <vector>\nusing namespace std;\n\n';
        const lines = code.split('\n');
        let stack = [0];
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i], trimmed = line.trim();
            if (!trimmed) { result += '\n'; continue; }
            const ci = line.search(/\S/);
            while (stack.length > 1 && ci < stack[stack.length-1]) { stack.pop(); result += '    '.repeat(stack.length) + '}\n'; }
            const ind = Math.max(0, stack.length-1);
            if (trimmed.startsWith('#')) { result += '    '.repeat(ind) + '//' + trimmed.slice(1) + '\n'; continue; }
            if (trimmed.startsWith('print(')) {
                const inner = trimmed.slice(6,-1).trim();
                const fs = inner.match(/^f["'](.*)["']$/);
                if (fs) { result += '    '.repeat(ind) + `cout << "${fs[1]}" << endl;\n`; continue; }
                const sl = inner.match(/^["'](.*)["']$/);
                if (sl) { result += '    '.repeat(ind) + `cout << "${sl[1]}" << endl;\n`; continue; }
                result += '    '.repeat(ind) + `cout << ${inner} << endl;\n`; continue;
            }
            const dm = trimmed.match(/^def\s+(\w+)\s*\((.*)\)\s*:/);
            if (dm) {
                const params = dm[2].split(',').map(p=>p.trim()).filter(p=>p&&p!=='self').map(p=>p.includes(':')?p.split(':').map(s=>s.trim()).reverse().join(' '):'auto '+p).join(', ');
                result += (dm[1]==='main'?'int main()':'void '+dm[1]+'('+params+')') + ' {\n';
                stack.push(ci+4); continue;
            }
            const cm = trimmed.match(/^class\s+(\w+)(?:\s*\(\s*(\w+)\s*\))?.*:/);
            if (cm) { result += (cm[2]&&cm[2]!=='object'?`class ${cm[1]} : public ${cm[2]}`:`class ${cm[1]}`) + ' {\npublic:\n'; stack.push(ci+4); continue; }
            if (trimmed.startsWith('if ') && trimmed.endsWith(':')) { result += '    '.repeat(ind)+`if (${self._cppCondition(trimmed.slice(3,-1).trim())}) {\n`; stack.push(ci+4); continue; }
            if (trimmed.startsWith('elif ') && trimmed.endsWith(':')) { stack.pop(); result += '    '.repeat(Math.max(0,stack.length-1))+'} '; result += `else if (${self._cppCondition(trimmed.slice(5,-1).trim())}) {\n`; stack.push(ci+4); continue; }
            if (trimmed==='else:') { stack.pop(); result += '    '.repeat(Math.max(0,stack.length-1))+'} else {\n'; stack.push(ci+4); continue; }
            const fr = trimmed.match(/^for\s+(\w+)\s+in\s+range\s*\(\s*(\w+)\s*(?:,\s*(\w+))?\s*\)\s*:/);
            if (fr) { const s=fr[3]?fr[2]:'0',e=fr[3]||fr[2]; result += '    '.repeat(ind)+(s==='0'?`for (int ${fr[1]} = 0; ${fr[1]} < ${e}; ${fr[1]}++)`:`for (int ${fr[1]} = ${s}; ${fr[1]} < ${e}; ${fr[1]}++)`)+ ' {\n'; stack.push(ci+4); continue; }
            if (trimmed.startsWith('while ') && trimmed.endsWith(':')) { result += '    '.repeat(ind)+`while (${self._cppCondition(trimmed.slice(6,-1).trim())}) {\n`; stack.push(ci+4); continue; }
            if (trimmed.startsWith('return ')) { result += '    '.repeat(ind)+`return ${self._cppValue(trimmed.slice(7))};\n`; continue; }
            const am = trimmed.match(/^(\w+)\s*=\s*(.+)$/);
            if (am && !trimmed.includes('==') && !trimmed.includes('!=')) {
                const v=am[2]; let t='auto';
                if (/^\d+$/.test(v)) t='int'; else if (/^\d+\.\d+$/.test(v)) t='double';
                else if (v.startsWith('"')||v.startsWith("'")) t='string';
                else if (v==='True'||v==='False') t='bool';
                result += '    '.repeat(ind)+`${t} ${am[1]} = ${self._cppValue(v)};\n`; continue;
            }
            if (trimmed.endsWith(')')) { result += '    '.repeat(ind)+trimmed+';\n'; continue; }
            result += '    '.repeat(ind)+'// '+trimmed+'\n';
        }
        while (stack.length>1) { stack.pop(); result += '    '.repeat(stack.length-1)+'}\n'; }
        if (!result.includes('int main(')) result += '\nint main() {\n    return 0;\n}\n';
        return result;
    },

    pythonToJava: function(code) {
        const self = this;
        let result = 'import java.util.*;\n\npublic class ConvertedCode {\n';
        const lines = code.split('\n');
        let stack = [0];
        const base = 1;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i], trimmed = line.trim();
            if (!trimmed) { result += '\n'; continue; }
            const ci = line.search(/\S/);
            while (stack.length>1 && ci<stack[stack.length-1]) { stack.pop(); result += '    '.repeat(base+stack.length-1)+'}\n'; }
            const ind = base+Math.max(0,stack.length-1);
            if (trimmed.startsWith('#')) { result += '    '.repeat(ind)+'//'+trimmed.slice(1)+'\n'; continue; }
            if (trimmed.startsWith('print(')) {
                const inner = trimmed.slice(6,-1).trim();
                const fs = inner.match(/^f["'](.*)["']$/);
                if (fs) { const js=fs[1].replace(/\{(\w+)\}/g,'" + $1 + "'); result += '    '.repeat(ind)+`System.out.println("${js}");\n`; continue; }
                result += '    '.repeat(ind)+`System.out.println(${inner.replace(/'/g,'"')});\n`; continue;
            }
            const dm = trimmed.match(/^def\s+(\w+)\s*\((.*)\)\s*:/);
            if (dm) {
                const params = dm[2].split(',').map(p=>p.trim()).filter(p=>p&&p!=='self').map(p=>p.includes(':')?p.split(':').map(s=>s.trim()).reverse().join(' '):'Object '+p).join(', ');
                if (dm[1]==='__init__') result += '    '.repeat(ind)+`public ConvertedCode(${params}) {\n`;
                else if (dm[1]==='main') result += '    '.repeat(ind)+'public static void main(String[] args) {\n';
                else result += '    '.repeat(ind)+`public static void ${dm[1]}(${params}) {\n`;
                stack.push(ci+4); continue;
            }
            const cm = trimmed.match(/^class\s+(\w+).*:/);
            if (cm) { result = result.replace('public class ConvertedCode',`public class ${cm[1]}`); continue; }
            if (trimmed.startsWith('if ') && trimmed.endsWith(':')) { result += '    '.repeat(ind)+`if (${self._javaCondition(trimmed.slice(3,-1).trim())}) {\n`; stack.push(ci+4); continue; }
            if (trimmed.startsWith('elif ') && trimmed.endsWith(':')) { stack.pop(); result += '    '.repeat(base+stack.length-1)+'} '; result += `else if (${self._javaCondition(trimmed.slice(5,-1).trim())}) {\n`; stack.push(ci+4); continue; }
            if (trimmed==='else:') { stack.pop(); result += '    '.repeat(base+stack.length-1)+'} else {\n'; stack.push(ci+4); continue; }
            const fr = trimmed.match(/^for\s+(\w+)\s+in\s+range\s*\(\s*(\w+)\s*(?:,\s*(\w+))?\s*\)\s*:/);
            if (fr) { const s=fr[3]?fr[2]:'0',e=fr[3]||fr[2]; result += '    '.repeat(ind)+(s==='0'?`for (int ${fr[1]} = 0; ${fr[1]} < ${e}; ${fr[1]}++)`:`for (int ${fr[1]} = ${s}; ${fr[1]} < ${e}; ${fr[1]}++)`)+ ' {\n'; stack.push(ci+4); continue; }
            if (trimmed.startsWith('while ') && trimmed.endsWith(':')) { result += '    '.repeat(ind)+`while (${self._javaCondition(trimmed.slice(6,-1).trim())}) {\n`; stack.push(ci+4); continue; }
            if (trimmed.startsWith('return ')) { result += '    '.repeat(ind)+`return ${self._javaValue(trimmed.slice(7))};\n`; continue; }
            const am = trimmed.match(/^(\w+)\s*=\s*(.+)$/);
            if (am && !trimmed.includes('==') && !trimmed.includes('!=')) {
                const v=am[2]; let t='var';
                if (/^\d+$/.test(v)) t='int'; else if (/^\d+\.\d+$/.test(v)) t='double';
                else if (v.startsWith('"')||v.startsWith("'")) t='String';
                else if (v==='True'||v==='False') t='boolean';
                result += '    '.repeat(ind)+`${t} ${am[1]} = ${self._javaValue(v)};\n`; continue;
            }
            if (trimmed.endsWith(')')) { result += '    '.repeat(ind)+trimmed+';\n'; continue; }
            result += '    '.repeat(ind)+'// '+trimmed+'\n';
        }
        while (stack.length>1) { stack.pop(); result += '    '.repeat(base+stack.length-1)+'}\n'; }
        if (!result.includes('public static void main')) result += '\n    public static void main(String[] args) {\n    }\n';
        result += '}\n';
        return result;
    },

    pythonToJs: function(code) {
        const self = this;
        let result = '';
        const lines = code.split('\n');
        let stack = [0];
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i], trimmed = line.trim();
            if (!trimmed) { result += '\n'; continue; }
            const ci = line.search(/\S/);
            while (stack.length>1 && ci<stack[stack.length-1]) { stack.pop(); result += '    '.repeat(stack.length-1)+'}\n'; }
            const ind = Math.max(0,stack.length-1);
            if (trimmed.startsWith('#')) { result += '    '.repeat(ind)+'//'+trimmed.slice(1)+'\n'; continue; }
            if (trimmed.startsWith('print(')) {
                const inner = trimmed.slice(6,-1).trim();
                const fs = inner.match(/^f["'](.*)["']$/);
                if (fs) { const js=fs[1].replace(/\{(\w+)\}/g,'${$1}'); result += '    '.repeat(ind)+`console.log(\`${js}\`);\n`; continue; }
                result += '    '.repeat(ind)+`console.log(${inner});\n`; continue;
            }
            const dm = trimmed.match(/^def\s+(\w+)\s*\((.*)\)\s*:/);
            if (dm) {
                const params = dm[2].split(',').map(p=>p.trim()).filter(p=>p&&p!=='self').map(p=>p.includes(':')?p.split(':')[0].trim():p).join(', ');
                result += '    '.repeat(ind)+(dm[1]==='__init__'?`constructor(${params})`:`function ${dm[1]}(${params})`) + ' {\n';
                stack.push(ci+4); continue;
            }
            const cm = trimmed.match(/^class\s+(\w+)(?:\s*\(\s*(\w+)\s*\))?.*:/);
            if (cm) { result += '    '.repeat(ind)+(cm[2]&&cm[2]!=='object'?`class ${cm[1]} extends ${cm[2]}`:`class ${cm[1]}`) + ' {\n'; stack.push(ci+4); continue; }
            if (trimmed.startsWith('if ') && trimmed.endsWith(':')) { result += '    '.repeat(ind)+`if (${self._pyCondition(trimmed.slice(3,-1).trim()).replace(/\band\b/g,'&&').replace(/\bor\b/g,'||')}) {\n`; stack.push(ci+4); continue; }
            if (trimmed.startsWith('elif ') && trimmed.endsWith(':')) { stack.pop(); result += '    '.repeat(Math.max(0,stack.length-1))+'} '; result += `else if (${self._pyCondition(trimmed.slice(5,-1).trim()).replace(/\band\b/g,'&&').replace(/\bor\b/g,'||')}) {\n`; stack.push(ci+4); continue; }
            if (trimmed==='else:') { stack.pop(); result += '    '.repeat(Math.max(0,stack.length-1))+'} else {\n'; stack.push(ci+4); continue; }
            const fr = trimmed.match(/^for\s+(\w+)\s+in\s+range\s*\(\s*(\w+)\s*(?:,\s*(\w+))?\s*\)\s*:/);
            if (fr) { const s=fr[3]?fr[2]:'0',e=fr[3]||fr[2]; result += '    '.repeat(ind)+(s==='0'?`for (let ${fr[1]} = 0; ${fr[1]} < ${e}; ${fr[1]}++)`:`for (let ${fr[1]} = ${s}; ${fr[1]} < ${e}; ${fr[1]}++)`)+ ' {\n'; stack.push(ci+4); continue; }
            if (trimmed.startsWith('while ') && trimmed.endsWith(':')) { result += '    '.repeat(ind)+`while (${self._pyCondition(trimmed.slice(6,-1).trim()).replace(/\band\b/g,'&&').replace(/\bor\b/g,'||')}) {\n`; stack.push(ci+4); continue; }
            if (trimmed.startsWith('return ')) { result += '    '.repeat(ind)+`return ${self._pyValue(trimmed.slice(7))};\n`; continue; }
            let conv = trimmed.replace(/\bself\./g,'this.');
            const am = conv.match(/^(\w+)\s*=\s*(.+)$/);
            if (am && !conv.includes('==') && !conv.includes('!=')) { result += '    '.repeat(ind)+(am[1].startsWith('this.')?`${am[1]} = ${self._pyValue(am[2])};`:`let ${am[1]} = ${self._pyValue(am[2])};`)+'\n'; continue; }
            if (conv.endsWith(')')) { result += '    '.repeat(ind)+conv+';\n'; continue; }
            result += '    '.repeat(ind)+'// '+trimmed+'\n';
        }
        while (stack.length>1) { stack.pop(); result += '    '.repeat(stack.length-1)+'}\n'; }
        return result;
    },

    pythonToC: function(code) {
        const self = this;
        let result = '#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n#include <stdbool.h>\n\n';
        const lines = code.split('\n');
        let stack = [0];
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i], trimmed = line.trim();
            if (!trimmed) { result += '\n'; continue; }
            const ci = line.search(/\S/);
            while (stack.length>1 && ci<stack[stack.length-1]) { stack.pop(); result += '    '.repeat(stack.length-1)+'}\n'; }
            const ind = Math.max(0,stack.length-1);
            if (trimmed.startsWith('#')) { result += '    '.repeat(ind)+'//'+trimmed.slice(1)+'\n'; continue; }
            if (trimmed.startsWith('print(')) {
                const inner = trimmed.slice(6,-1).trim();
                const fs = inner.match(/^f["'](.*)["']$/);
                if (fs) { let fmt=fs[1],args=[]; fmt=fmt.replace(/\{(\w+)\}/g,(_,v)=>{args.push(v);return '%s';}); result += '    '.repeat(ind)+(args.length?`printf("${fmt}\\n", ${args.join(', ')});\n`:`printf("${fmt}\\n");\n`); continue; }
                const sl = inner.match(/^["'](.*)["']$/);
                if (sl) { result += '    '.repeat(ind)+`printf("${sl[1]}\\n");\n`; continue; }
                result += '    '.repeat(ind)+`printf("%d\\n", ${inner}); // TODO: Adjust format\n`; continue;
            }
            const dm = trimmed.match(/^def\s+(\w+)\s*\((.*)\)\s*:/);
            if (dm) {
                const params = dm[2].split(',').map(p=>p.trim()).filter(p=>p&&p!=='self').map(p=>p.includes(':')?p.split(':').map(s=>s.trim()).reverse().join(' '):'int '+p).join(', ');
                result += (dm[1]==='main'?'int main(void)':'void '+dm[1]+'('+(params||'void')+')') + ' {\n';
                stack.push(ci+4); continue;
            }
            if (trimmed.startsWith('if ') && trimmed.endsWith(':')) { result += '    '.repeat(ind)+`if (${self._cppCondition(trimmed.slice(3,-1).trim())}) {\n`; stack.push(ci+4); continue; }
            if (trimmed.startsWith('elif ') && trimmed.endsWith(':')) { stack.pop(); result += '    '.repeat(Math.max(0,stack.length-1))+'} '; result += `else if (${self._cppCondition(trimmed.slice(5,-1).trim())}) {\n`; stack.push(ci+4); continue; }
            if (trimmed==='else:') { stack.pop(); result += '    '.repeat(Math.max(0,stack.length-1))+'} else {\n'; stack.push(ci+4); continue; }
            const fr = trimmed.match(/^for\s+(\w+)\s+in\s+range\s*\(\s*(\w+)\s*(?:,\s*(\w+))?\s*\)\s*:/);
            if (fr) { const s=fr[3]?fr[2]:'0',e=fr[3]||fr[2]; result += '    '.repeat(ind)+(s==='0'?`for (int ${fr[1]} = 0; ${fr[1]} < ${e}; ${fr[1]}++)`:`for (int ${fr[1]} = ${s}; ${fr[1]} < ${e}; ${fr[1]}++)`)+ ' {\n'; stack.push(ci+4); continue; }
            if (trimmed.startsWith('while ') && trimmed.endsWith(':')) { result += '    '.repeat(ind)+`while (${self._cppCondition(trimmed.slice(6,-1).trim())}) {\n`; stack.push(ci+4); continue; }
            if (trimmed.startsWith('return ')) { result += '    '.repeat(ind)+`return ${self._cppValue(trimmed.slice(7))};\n`; continue; }
            const am = trimmed.match(/^(\w+)\s*=\s*(.+)$/);
            if (am && !trimmed.includes('==') && !trimmed.includes('!=')) {
                const v=am[2]; let t='int';
                if (/^\d+$/.test(v)) t='int'; else if (/^\d+\.\d+$/.test(v)) t='double';
                else if (v.startsWith('"')||v.startsWith("'")) t='char*';
                else if (v==='True'||v==='False') t='bool';
                result += '    '.repeat(ind)+`${t} ${am[1]} = ${self._cppValue(v)};\n`; continue;
            }
            if (trimmed.endsWith(')')) { result += '    '.repeat(ind)+trimmed+';\n'; continue; }
            result += '    '.repeat(ind)+'// '+trimmed+'\n';
        }
        while (stack.length>1) { stack.pop(); result += '    '.repeat(stack.length-1)+'}\n'; }
        if (!result.includes('int main(')) result += '\nint main(void) {\n    return 0;\n}\n';
        return result;
    },

    // ─── C++ → X ─────────────────────────────────────────────────────────────

    _coutToPrint: function(trimmed) {
        const coutLine = trimmed.replace(/^\s*cout\s*/,'').replace(/\s*<<\s*endl\s*;?\s*$/,'').replace(/;\s*$/,'');
        const parts = coutLine.split(/\s*<<\s*/).map(p=>p.trim()).filter(Boolean);
        if (parts.length===1) return parts[0];
        return parts.map(p=>((p.startsWith('"')&&p.endsWith('"'))||(p.startsWith("'")&&p.endsWith("'")))?p.slice(1,-1):`{${p}}`).join('');
    },

    cppToPython: function(code) {
        const self = this;
        let result = '';
        const lines = code.split('\n');
        let ind = 0;
        for (let line of lines) {
            const trimmed = line.trim();
            if (!trimmed) { result += '\n'; continue; }
            if (trimmed.startsWith('#include')||trimmed.startsWith('using namespace')) continue;
            if (trimmed.startsWith('//')) { result += '    '.repeat(ind)+'#'+trimmed.slice(2)+'\n'; continue; }
            if (trimmed.includes('cout')) {
                const parts = trimmed.replace(/^\s*cout\s*/,'').replace(/\s*<<\s*endl\s*;?\s*$/,'').replace(/;\s*$/,'').split(/\s*<<\s*/).map(p=>p.trim()).filter(Boolean);
                const fmtParts = parts.map(p=>((p.startsWith('"')&&p.endsWith('"'))||(p.startsWith("'")&&p.endsWith("'")))?p.slice(1,-1):`{${p}}`).join('');
                result += '    '.repeat(ind)+(parts.length===1&&!parts[0].startsWith('"')?`print(${parts[0]})`:`print(f"${fmtParts}")`)+'\n'; continue;
            }
            if (trimmed.includes('printf')) {
                const m = trimmed.match(/printf\s*\(\s*"([^"]*)"\s*((?:,\s*[^,)]+)*)\s*\)\s*;/);
                if (m) { let fmt=m[1].replace(/\\n/g,''); const args=m[2]?m[2].split(',').map(a=>a.trim()).filter(Boolean):[]; args.forEach(a=>{fmt=fmt.replace(/%[difs]/,`{${a}}`)}); result += '    '.repeat(ind)+(args.length?`print(f"${fmt}")`:`print("${fmt}")`)+'\n'; continue; }
            }
            const fm = trimmed.match(/^(?:void|int|float|double|string|bool|char|auto|long)\s+(\w+)\s*\((.*)\)\s*\{?\s*$/);
            if (fm) { const params=fm[2].split(',').map(p=>p.trim()).filter(Boolean).map(p=>{const pts=p.split(/\s+/);return pts[pts.length-1].replace(/[&*]/g,'');}).join(', '); result += (fm[1]==='main'?'\ndef main():':`\ndef ${fm[1]}(${params}):`)+'\n'; ind++; continue; }
            const ifm = trimmed.match(/^if\s*\((.*)\)\s*\{?\s*$/);
            if (ifm) { result += '    '.repeat(ind)+`if ${self._pyCondition(ifm[1])}:\n`; ind++; continue; }
            const eim = trimmed.match(/^}\s*else\s+if\s*\((.*)\)\s*\{?\s*$/);
            if (eim) { ind--; result += '    '.repeat(ind)+`elif ${self._pyCondition(eim[1])}:\n`; ind++; continue; }
            if (trimmed==='} else {'||trimmed==='else {') { ind--; result += '    '.repeat(ind)+'else:\n'; ind++; continue; }
            const form = trimmed.match(/^for\s*\(\s*(?:int|auto)?\s*(\w+)\s*=\s*(\w+)\s*;\s*\w+\s*<\s*(\w+)\s*;\s*\w+\+\+\s*\)\s*\{?\s*$/);
            if (form) { const s=form[2],e=form[3]; result += '    '.repeat(ind)+(s==='0'?`for ${form[1]} in range(${e}):`:`for ${form[1]} in range(${s}, ${e}):`)+'\n'; ind++; continue; }
            const wm = trimmed.match(/^while\s*\((.*)\)\s*\{?\s*$/);
            if (wm) { result += '    '.repeat(ind)+`while ${self._pyCondition(wm[1])}:\n`; ind++; continue; }
            const rm = trimmed.match(/^return\s+(.*);$/);
            if (rm) { result += '    '.repeat(ind)+`return ${self._pyValue(rm[1])}\n`; continue; }
            if (trimmed==='}'||trimmed==='};') { if(ind>0) ind--; continue; }
            if (trimmed==='{') continue;
            const vm = trimmed.match(/^(?:int|float|double|string|bool|auto|char\*?|long)\s+(\w+)\s*=\s*(.*);$/);
            if (vm) { result += '    '.repeat(ind)+`${vm[1]} = ${self._pyValue(vm[2])}\n`; continue; }
            if (trimmed.endsWith(';')) { result += '    '.repeat(ind)+self._pyValue(trimmed.slice(0,-1))+'\n'; continue; }
            result += '    '.repeat(ind)+'# '+trimmed+'\n';
        }
        if (result.includes('def main():')) result += '\n\nif __name__ == "__main__":\n    main()\n';
        return result;
    },

    cppToJava: function(code) {
        const self = this;
        let result = 'import java.util.*;\n\npublic class ConvertedCode {\n';
        const lines = code.split('\n');
        let ind = 1;
        for (let line of lines) {
            const trimmed = line.trim();
            if (!trimmed) { result += '\n'; continue; }
            if (trimmed.startsWith('#include')) { result += '    '.repeat(ind)+'// '+trimmed+'\n'; continue; }
            if (trimmed.startsWith('using namespace')) continue;
            if (trimmed.startsWith('//')) { result += '    '.repeat(ind)+trimmed+'\n'; continue; }
            if (trimmed.includes('cout')) {
                const parts = trimmed.replace(/^\s*cout\s*/,'').replace(/\s*<<\s*endl\s*;?\s*$/,'').replace(/;\s*$/,'').split(/\s*<<\s*/).map(p=>p.trim()).filter(Boolean);
                const expr = parts.map(p=>((p.startsWith('"')&&p.endsWith('"'))||(p.startsWith("'")&&p.endsWith("'")))?p:`String.valueOf(${p})`).join(' + ');
                result += '    '.repeat(ind)+`System.out.println(${expr});\n`; continue;
            }
            const fm = trimmed.match(/^(?:void|int|float|double|string|bool|char|auto|long)\s+(\w+)\s*\((.*)\)\s*\{?\s*$/);
            if (fm) {
                const rt = {void:'void',int:'int',float:'float',double:'double',string:'String',bool:'boolean',auto:'var',long:'long'}[trimmed.split(/\s+/)[0]]||'void';
                const params = fm[2].split(',').map(p=>p.trim()).filter(Boolean).map(p=>{const pts=p.split(/\s+/);return pts.length>=2?`${({int:'int',float:'float',double:'double',string:'String',bool:'boolean',auto:'var',long:'long'}[pts[0]]||pts[0])} ${pts[pts.length-1].replace(/[&*]/g,'')}`:p;}).join(', ');
                result += '    '.repeat(ind)+(fm[1]==='main'?'public static void main(String[] args)':`public static ${rt} ${fm[1]}(${params})`) + ' {\n'; ind++; continue;
            }
            const ifm = trimmed.match(/^if\s*\((.*)\)\s*\{?\s*$/);
            if (ifm) { result += '    '.repeat(ind)+`if (${ifm[1]}) {\n`; ind++; continue; }
            const eim = trimmed.match(/^}\s*else\s+if\s*\((.*)\)\s*\{?\s*$/);
            if (eim) { ind--; result += '    '.repeat(ind)+`} else if (${eim[1]}) {\n`; ind++; continue; }
            if (trimmed==='} else {'||trimmed==='else {') { ind--; result += '    '.repeat(ind)+'} else {\n'; ind++; continue; }
            const form = trimmed.match(/^for\s*\((.*)\)\s*\{?\s*$/);
            if (form) { result += '    '.repeat(ind)+`for (${form[1].replace(/\bauto\b/g,'var')}) {\n`; ind++; continue; }
            const wm = trimmed.match(/^while\s*\((.*)\)\s*\{?\s*$/);
            if (wm) { result += '    '.repeat(ind)+`while (${wm[1]}) {\n`; ind++; continue; }
            const rm = trimmed.match(/^return\s+(.*);$/);
            if (rm) { result += '    '.repeat(ind)+`return ${rm[1]};\n`; continue; }
            if (trimmed==='}'||trimmed==='};') { if(ind>1){ind--;result += '    '.repeat(ind)+'}\n';} continue; }
            if (trimmed==='{') continue;
            if (trimmed.endsWith(';')) result += '    '.repeat(ind)+trimmed+'\n';
            else result += '    '.repeat(ind)+'// '+trimmed+'\n';
        }
        result += '}\n'; return result;
    },

    cppToJs: function(code) {
        const self = this;
        let result = '';
        const lines = code.split('\n');
        let ind = 0;
        for (let line of lines) {
            const trimmed = line.trim();
            if (!trimmed) { result += '\n'; continue; }
            if (trimmed.startsWith('#include')) { result += '// '+trimmed+'\n'; continue; }
            if (trimmed.startsWith('using namespace')) continue;
            if (trimmed.startsWith('//')) { result += '    '.repeat(ind)+trimmed+'\n'; continue; }
            if (trimmed.includes('cout')) {
                const parts = trimmed.replace(/^\s*cout\s*/,'').replace(/\s*<<\s*endl\s*;?\s*$/,'').replace(/;\s*$/,'').split(/\s*<<\s*/).map(p=>p.trim()).filter(Boolean);
                result += '    '.repeat(ind)+`console.log(${parts.join(' + ')});\n`; continue;
            }
            const fm = trimmed.match(/^(?:void|int|float|double|string|bool|char|auto|long)\s+(\w+)\s*\((.*)\)\s*\{?\s*$/);
            if (fm) { const params=fm[2].split(',').map(p=>p.trim()).filter(Boolean).map(p=>{const pts=p.split(/\s+/);return pts[pts.length-1].replace(/[&*]/g,'');}).join(', '); result += `function ${fm[1]}(${params}) {\n`; ind++; continue; }
            const ifm = trimmed.match(/^if\s*\((.*)\)\s*\{?\s*$/);
            if (ifm) { result += '    '.repeat(ind)+`if (${ifm[1]}) {\n`; ind++; continue; }
            const eim = trimmed.match(/^}\s*else\s+if\s*\((.*)\)\s*\{?\s*$/);
            if (eim) { ind--; result += '    '.repeat(ind)+`} else if (${eim[1]}) {\n`; ind++; continue; }
            if (trimmed==='} else {'||trimmed==='else {') { ind--; result += '    '.repeat(ind)+'} else {\n'; ind++; continue; }
            const form = trimmed.match(/^for\s*\(\s*(?:int|auto)?\s*(\w+)\s*=\s*(\w+)\s*;\s*\w+\s*<\s*(\w+)\s*;\s*\w+\+\+\s*\)\s*\{?\s*$/);
            if (form) { result += '    '.repeat(ind)+`for (let ${form[1]} = ${form[2]}; ${form[1]} < ${form[3]}; ${form[1]}++) {\n`; ind++; continue; }
            const wm = trimmed.match(/^while\s*\((.*)\)\s*\{?\s*$/);
            if (wm) { result += '    '.repeat(ind)+`while (${wm[1]}) {\n`; ind++; continue; }
            const rm = trimmed.match(/^return\s+(.*);$/);
            if (rm) { result += '    '.repeat(ind)+`return ${rm[1].replace(/nullptr/g,'null').replace(/NULL/g,'null')};\n`; continue; }
            if (trimmed==='}'||trimmed==='};') { if(ind>0){ind--;result += '    '.repeat(ind)+'}\n';} continue; }
            if (trimmed==='{') continue;
            const vm = trimmed.match(/^(?:int|float|double|string|bool|auto|char\*?|long)\s+(\w+)\s*=\s*(.*);$/);
            if (vm) { result += '    '.repeat(ind)+`let ${vm[1]} = ${vm[2].replace(/nullptr/g,'null')};\n`; continue; }
            if (trimmed.endsWith(';')) result += '    '.repeat(ind)+trimmed.replace(/nullptr/g,'null')+'\n';
            else result += '    '.repeat(ind)+'// '+trimmed+'\n';
        }
        return result;
    },

    cppToC: function(code) {
        const self = this;
        let result = '#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n#include <stdbool.h>\n\n';
        const lines = code.split('\n');
        let ind = 0;
        for (let line of lines) {
            const trimmed = line.trim();
            if (!trimmed) { result += '\n'; continue; }
            if (trimmed.startsWith('#include <iostream>')||trimmed.startsWith('#include <string>')) continue;
            if (trimmed.startsWith('#include')) { result += trimmed+'\n'; continue; }
            if (trimmed.startsWith('using namespace')) continue;
            if (trimmed.startsWith('//')) { result += '    '.repeat(ind)+trimmed+'\n'; continue; }
            if (trimmed.includes('cout')) {
                const parts = trimmed.replace(/^\s*cout\s*/,'').replace(/\s*<<\s*endl\s*;?\s*$/,'').replace(/;\s*$/,'').split(/\s*<<\s*/).map(p=>p.trim()).filter(Boolean);
                let fmt='',args=[];
                parts.forEach(p=>{if((p.startsWith('"')&&p.endsWith('"'))||(p.startsWith("'")&&p.endsWith("'"))){fmt+=p.slice(1,-1);}else{fmt+='%s';args.push(p);}});
                result += '    '.repeat(ind)+(args.length?`printf("${fmt}\\n", ${args.join(', ')});`:`printf("${fmt}\\n");`)+'\n'; continue;
            }
            const fm = trimmed.match(/^(?:void|int|float|double|bool|auto|long)\s+(\w+)\s*\((.*)\)\s*\{?\s*$/);
            if (fm) { let rt=trimmed.split(/\s+/)[0]; if(rt==='auto')rt='int'; const params=fm[2].replace(/\bstring\b/g,'char*').replace(/\bauto\b/g,'int'); result += `${rt} ${fm[1]}(${params||'void'}) {\n`; ind++; continue; }
            const ifm = trimmed.match(/^if\s*\((.*)\)\s*\{?\s*$/);
            if (ifm) { result += '    '.repeat(ind)+`if (${ifm[1]}) {\n`; ind++; continue; }
            const eim = trimmed.match(/^}\s*else\s+if\s*\((.*)\)\s*\{?\s*$/);
            if (eim) { ind--; result += '    '.repeat(ind)+`} else if (${eim[1]}) {\n`; ind++; continue; }
            if (trimmed==='} else {'||trimmed==='else {') { ind--; result += '    '.repeat(ind)+'} else {\n'; ind++; continue; }
            const form = trimmed.match(/^for\s*\((.*)\)\s*\{?\s*$/);
            if (form) { result += '    '.repeat(ind)+`for (${form[1].replace(/\bauto\b/g,'int')}) {\n`; ind++; continue; }
            const wm = trimmed.match(/^while\s*\((.*)\)\s*\{?\s*$/);
            if (wm) { result += '    '.repeat(ind)+`while (${wm[1]}) {\n`; ind++; continue; }
            const rm = trimmed.match(/^return\s+(.*);$/);
            if (rm) { result += '    '.repeat(ind)+`return ${rm[1]};\n`; continue; }
            if (trimmed==='}'||trimmed==='};') { if(ind>0){ind--;result += '    '.repeat(ind)+'}\n';} continue; }
            if (trimmed==='{') continue;
            result += '    '.repeat(ind)+trimmed.replace(/\bstring\b/g,'char*').replace(/\bauto\b/g,'int').replace(/\bnullptr\b/g,'NULL')+'\n';
        }
        return result;
    },

    // ─── Java → X ────────────────────────────────────────────────────────────

    javaToPython: function(code) {
        const self = this;
        let result = '';
        const lines = code.split('\n');
        let ind = 0, inClass = false;
        for (let line of lines) {
            const trimmed = line.trim();
            if (!trimmed) { result += '\n'; continue; }
            if (trimmed.startsWith('import ')||trimmed.startsWith('package ')) continue;
            if (trimmed.startsWith('//')) { result += '    '.repeat(ind)+'#'+trimmed.slice(2)+'\n'; continue; }
            if (trimmed.includes('System.out.print')) {
                const m = trimmed.match(/System\.out\.println?\s*\(\s*([\s\S]+?)\s*\)\s*;/);
                if (m) { let c=m[1]; c=c.replace(/"([^"]*?)"\s*\+\s*(\w+)/g,(_,s,v)=>`"${s}" + str(${v})`).replace(/(\w+)\s*\+\s*"([^"]*?)"/g,(_,v,s)=>`str(${v}) + "${s}"`); result += '    '.repeat(ind)+`print(${c})\n`; continue; }
            }
            const cm = trimmed.match(/^(?:public\s+)?class\s+(\w+)(?:\s+extends\s+(\w+))?\s*\{?$/);
            if (cm) { result += (cm[2]?`class ${cm[1]}(${cm[2]}):`:`class ${cm[1]}:`)+'\n'; ind++; inClass=true; continue; }
            const mm = trimmed.match(/^(?:public|private|protected)?\s*(?:static\s+)?(?:void|int|float|double|String|boolean|Object|long)\s+(\w+)\s*\((.*)\)\s*\{?$/);
            if (mm) {
                const params=mm[2].split(',').map(p=>p.trim()).filter(p=>p&&p!=='String[] args').map(p=>{const pts=p.split(/\s+/);return pts[pts.length-1];}).join(', ');
                if (mm[1]==='main') result += '    '.repeat(ind)+'def main():\n';
                else if (inClass) result += '    '.repeat(ind)+`def ${mm[1]}(self${params?', '+params:''}):\n`;
                else result += '    '.repeat(ind)+`def ${mm[1]}(${params}):\n`;
                ind++; continue;
            }
            const ifm = trimmed.match(/^if\s*\((.*)\)\s*\{?$/);
            if (ifm) { result += '    '.repeat(ind)+`if ${self._pyCondition(ifm[1])}:\n`; ind++; continue; }
            const eim = trimmed.match(/^}\s*else\s+if\s*\((.*)\)\s*\{?$/);
            if (eim) { ind--; result += '    '.repeat(ind)+`elif ${self._pyCondition(eim[1])}:\n`; ind++; continue; }
            if (trimmed==='} else {'||trimmed==='else {') { ind--; result += '    '.repeat(ind)+'else:\n'; ind++; continue; }
            const form = trimmed.match(/^for\s*\(\s*(?:int|var)\s+(\w+)\s*=\s*(\w+)\s*;\s*\w+\s*<\s*(\w+)\s*;\s*\w+\+\+\s*\)\s*\{?$/);
            if (form) { const s=form[2],e=form[3]; result += '    '.repeat(ind)+(s==='0'?`for ${form[1]} in range(${e}):`:`for ${form[1]} in range(${s}, ${e}):`)+'\n'; ind++; continue; }
            const wm = trimmed.match(/^while\s*\((.*)\)\s*\{?$/);
            if (wm) { result += '    '.repeat(ind)+`while ${self._pyCondition(wm[1])}:\n`; ind++; continue; }
            const rm = trimmed.match(/^return\s+(.*);$/);
            if (rm) { result += '    '.repeat(ind)+`return ${self._pyValue(rm[1])}\n`; continue; }
            if (trimmed==='}'||trimmed==='};') { if(ind>0) ind--; continue; }
            if (trimmed==='{') continue;
            const vm = trimmed.match(/^(?:int|float|double|String|boolean|var|Object|long)\s+(\w+)\s*=\s*(.*);$/);
            if (vm) { result += '    '.repeat(ind)+`${vm[1]} = ${self._pyValue(vm[2])}\n`; continue; }
            let conv = trimmed.replace(/\bthis\./g,'self.');
            if (conv.endsWith(';')) { result += '    '.repeat(ind)+conv.slice(0,-1)+'\n'; continue; }
            result += '    '.repeat(ind)+'# '+trimmed+'\n';
        }
        if (result.includes('def main():')) result += '\n\nif __name__ == "__main__":\n    main()\n';
        return result;
    },

    javaToCpp: function(code) {
        const self = this;
        let result = '#include <iostream>\n#include <string>\n#include <vector>\nusing namespace std;\n\n';
        const lines = code.split('\n');
        let ind = 0, className = 'ConvertedCode';
        const typeMap = {int:'int',float:'float',double:'double',String:'string',boolean:'bool',var:'auto',Object:'auto',void:'void',long:'long'};
        for (let line of lines) {
            const trimmed = line.trim();
            if (!trimmed) { result += '\n'; continue; }
            if (trimmed.startsWith('import ')||trimmed.startsWith('package ')) continue;
            if (trimmed.startsWith('//')) { result += '    '.repeat(ind)+trimmed+'\n'; continue; }
            if (trimmed.includes('System.out.print')) {
                const m = trimmed.match(/System\.out\.println?\s*\(\s*([\s\S]+?)\s*\)\s*;/);
                if (m) { result += '    '.repeat(ind)+`cout << ${m[1]} << endl;\n`; continue; }
            }
            const cm = trimmed.match(/^(?:public\s+)?class\s+(\w+)(?:\s+extends\s+(\w+))?\s*\{?$/);
            if (cm) { className=cm[1]; result += (cm[2]?`class ${cm[1]} : public ${cm[2]}`:`class ${cm[1]}`) + ' {\npublic:\n'; ind++; continue; }
            const mm = trimmed.match(/^(?:public|private|protected)?\s*(?:static\s+)?(void|int|float|double|String|boolean|Object|long)\s+(\w+)\s*\((.*)\)\s*\{?$/);
            if (mm) {
                const rt=typeMap[mm[1]]||mm[1]; const params=mm[3].split(',').map(p=>p.trim()).filter(Boolean).map(p=>{const pts=p.split(/\s+/);return pts.length>=2?`${typeMap[pts[0]]||pts[0]} ${pts[pts.length-1]}`:p;}).join(', ');
                result += '    '.repeat(ind)+(mm[2]==='main'?'int main(int argc, char* argv[])':`${rt} ${mm[2]}(${params})`) + ' {\n'; ind++; continue;
            }
            const ifm = trimmed.match(/^if\s*\((.*)\)\s*\{?$/);
            if (ifm) { result += '    '.repeat(ind)+`if (${ifm[1]}) {\n`; ind++; continue; }
            const eim = trimmed.match(/^}\s*else\s+if\s*\((.*)\)\s*\{?$/);
            if (eim) { ind--; result += '    '.repeat(ind)+`} else if (${eim[1]}) {\n`; ind++; continue; }
            if (trimmed==='} else {'||trimmed==='else {') { ind--; result += '    '.repeat(ind)+'} else {\n'; ind++; continue; }
            const form = trimmed.match(/^for\s*\((.*)\)\s*\{?$/);
            if (form) { result += '    '.repeat(ind)+`for (${form[1].replace(/\bvar\b/g,'auto')}) {\n`; ind++; continue; }
            const wm = trimmed.match(/^while\s*\((.*)\)\s*\{?$/);
            if (wm) { result += '    '.repeat(ind)+`while (${wm[1]}) {\n`; ind++; continue; }
            const rm = trimmed.match(/^return\s+(.*);$/);
            if (rm) { result += '    '.repeat(ind)+`return ${rm[1].replace(/\bnull\b/g,'nullptr')};\n`; continue; }
            if (trimmed==='}'||trimmed==='};') { if(ind>0){ind--;result += '    '.repeat(ind)+'}\n';} continue; }
            if (trimmed==='{') continue;
            if (trimmed.endsWith(';')) result += '    '.repeat(ind)+trimmed.replace(/\bnull\b/g,'nullptr')+'\n';
            else result += '    '.repeat(ind)+'// '+trimmed+'\n';
        }
        if (result.includes('class '+className)) result += '};\n';
        return result;
    },

    javaToJs: function(code) {
        const self = this;
        let result = '';
        const lines = code.split('\n');
        let ind = 0, inClass = false, className = '';
        for (let line of lines) {
            const trimmed = line.trim();
            if (!trimmed) { result += '\n'; continue; }
            if (trimmed.startsWith('import ')||trimmed.startsWith('package ')) { result += '// '+trimmed+'\n'; continue; }
            if (trimmed.startsWith('//')) { result += '    '.repeat(ind)+trimmed+'\n'; continue; }
            if (trimmed.includes('System.out.print')) {
                const m = trimmed.match(/System\.out\.println?\s*\(\s*([\s\S]+?)\s*\)\s*;/);
                if (m) { result += '    '.repeat(ind)+`console.log(${m[1]});\n`; continue; }
            }
            const cm = trimmed.match(/^(?:public\s+)?class\s+(\w+)(?:\s+extends\s+(\w+))?\s*\{?$/);
            if (cm) { className=cm[1]; result += (cm[2]?`class ${cm[1]} extends ${cm[2]}`:`class ${cm[1]}`) + ' {\n'; ind++; inClass=true; continue; }
            const mm = trimmed.match(/^(?:public|private|protected)?\s*(?:static\s+)?(?:void|int|float|double|String|boolean|Object|long)\s+(\w+)\s*\((.*)\)\s*\{?$/);
            if (mm) {
                const params=mm[2].split(',').map(p=>p.trim()).filter(p=>p&&p!=='String[] args').map(p=>{const pts=p.split(/\s+/);return pts[pts.length-1];}).join(', ');
                result += '    '.repeat(ind)+(mm[1]==='main'?'static main()':mm[1]+'('+params+')') + ' {\n'; ind++; continue;
            }
            const ifm = trimmed.match(/^if\s*\((.*)\)\s*\{?$/);
            if (ifm) { result += '    '.repeat(ind)+`if (${ifm[1]}) {\n`; ind++; continue; }
            const eim = trimmed.match(/^}\s*else\s+if\s*\((.*)\)\s*\{?$/);
            if (eim) { ind--; result += '    '.repeat(ind)+`} else if (${eim[1]}) {\n`; ind++; continue; }
            if (trimmed==='} else {'||trimmed==='else {') { ind--; result += '    '.repeat(ind)+'} else {\n'; ind++; continue; }
            const form = trimmed.match(/^for\s*\(\s*(?:int|var)\s+(\w+)\s*=\s*(\w+)\s*;\s*\w+\s*<\s*(\w+)\s*;\s*\w+\+\+\s*\)\s*\{?$/);
            if (form) { result += '    '.repeat(ind)+`for (let ${form[1]} = ${form[2]}; ${form[1]} < ${form[3]}; ${form[1]}++) {\n`; ind++; continue; }
            const wm = trimmed.match(/^while\s*\((.*)\)\s*\{?$/);
            if (wm) { result += '    '.repeat(ind)+`while (${wm[1]}) {\n`; ind++; continue; }
            const rm = trimmed.match(/^return\s+(.*);$/);
            if (rm) { result += '    '.repeat(ind)+`return ${rm[1]};\n`; continue; }
            if (trimmed==='}'||trimmed==='};') { if(ind>0){ind--;result += '    '.repeat(ind)+'}\n';} continue; }
            if (trimmed==='{') continue;
            const vm = trimmed.match(/^(?:int|float|double|String|boolean|var|Object|long)\s+(\w+)\s*=\s*(.*);$/);
            if (vm) { result += '    '.repeat(ind)+`let ${vm[1]} = ${vm[2]};\n`; continue; }
            if (trimmed.endsWith(';')) result += '    '.repeat(ind)+trimmed+'\n';
            else result += '    '.repeat(ind)+'// '+trimmed+'\n';
        }
        if (result.includes('static main()')) result += `\n// Run main\n${className}.main();\n`;
        return result;
    },

    javaToC: function(code) {
        const self = this;
        let result = '#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n#include <stdbool.h>\n\n';
        const lines = code.split('\n');
        let ind = 0;
        const typeMap = {int:'int',float:'float',double:'double',String:'char*',boolean:'bool',var:'int',void:'void',long:'long'};
        for (let line of lines) {
            const trimmed = line.trim();
            if (!trimmed) { result += '\n'; continue; }
            if (trimmed.startsWith('import ')||trimmed.startsWith('package ')) continue;
            if (trimmed.startsWith('//')) { result += '    '.repeat(ind)+trimmed+'\n'; continue; }
            if (trimmed.includes('System.out.print')) {
                const m = trimmed.match(/System\.out\.println?\s*\(\s*([\s\S]+?)\s*\)\s*;/);
                if (m) { const sl=m[1].match(/^"([^"]*)"$/); if(sl){result += '    '.repeat(ind)+`printf("${sl[1]}\\n");\n`;}else{result += '    '.repeat(ind)+`printf("%s\\n", ${m[1]}); // TODO: Adjust format\n`;} continue; }
            }
            const cm = trimmed.match(/^(?:public\s+)?class\s+(\w+)/);
            if (cm) { result += `// Class ${cm[1]} converted to C functions\n\n`; continue; }
            const mm = trimmed.match(/^(?:public|private|protected)?\s*(?:static\s+)?(void|int|float|double|String|boolean|long)\s+(\w+)\s*\((.*)\)\s*\{?$/);
            if (mm) {
                const rt=typeMap[mm[1]]||mm[1]; const params=mm[3].split(',').map(p=>p.trim()).filter(p=>p&&p!=='String[] args').map(p=>{const pts=p.split(/\s+/);return pts.length>=2?`${typeMap[pts[0]]||pts[0]} ${pts[pts.length-1]}`:p;}).join(', ');
                result += (mm[2]==='main'?'int main(int argc, char *argv[])':`${rt} ${mm[2]}(${params||'void'})`) + ' {\n'; ind++; continue;
            }
            const ifm = trimmed.match(/^if\s*\((.*)\)\s*\{?$/);
            if (ifm) { result += '    '.repeat(ind)+`if (${ifm[1]}) {\n`; ind++; continue; }
            const eim = trimmed.match(/^}\s*else\s+if\s*\((.*)\)\s*\{?$/);
            if (eim) { ind--; result += '    '.repeat(ind)+`} else if (${eim[1]}) {\n`; ind++; continue; }
            if (trimmed==='} else {'||trimmed==='else {') { ind--; result += '    '.repeat(ind)+'} else {\n'; ind++; continue; }
            const form = trimmed.match(/^for\s*\((.*)\)\s*\{?$/);
            if (form) { result += '    '.repeat(ind)+`for (${form[1].replace(/\bvar\b/g,'int')}) {\n`; ind++; continue; }
            const wm = trimmed.match(/^while\s*\((.*)\)\s*\{?$/);
            if (wm) { result += '    '.repeat(ind)+`while (${wm[1]}) {\n`; ind++; continue; }
            const rm = trimmed.match(/^return\s+(.*);$/);
            if (rm) { result += '    '.repeat(ind)+`return ${rm[1].replace(/\bnull\b/g,'NULL')};\n`; continue; }
            if (trimmed==='}'||trimmed==='};') { if(ind>0){ind--;result += '    '.repeat(ind)+'}\n';} continue; }
            if (trimmed==='{') continue;
            if (trimmed.endsWith(';')) result += '    '.repeat(ind)+trimmed.replace(/\bnull\b/g,'NULL')+'\n';
            else result += '    '.repeat(ind)+'// '+trimmed+'\n';
        }
        return result;
    },

    // ─── JS → X ──────────────────────────────────────────────────────────────

    jsToPython: function(code) {
        const self = this;
        let result = '';
        const lines = code.split('\n');
        let ind = 0;
        for (let line of lines) {
            const trimmed = line.trim();
            if (!trimmed) { result += '\n'; continue; }
            if (trimmed.startsWith('//')) { result += '    '.repeat(ind)+'#'+trimmed.slice(2)+'\n'; continue; }
            if (trimmed.includes('console.log')) {
                const m = trimmed.match(/console\.log\s*\(\s*([\s\S]+?)\s*\)\s*;?/);
                if (m) { let c=m[1]; c=c.replace(/`([^`]*)`/g,(_,s)=>`f"${s.replace(/\$\{(\w+)\}/g,'{$1}')}"`); result += '    '.repeat(ind)+`print(${c})\n`; continue; }
            }
            const fm = trimmed.match(/^(?:async\s+)?function\s+(\w+)\s*\((.*)\)\s*\{?$/);
            if (fm) { result += '    '.repeat(ind)+`def ${fm[1]}(${fm[2]}):\n`; ind++; continue; }
            const am = trimmed.match(/^(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\((.*)\)\s*=>\s*\{?$/);
            if (am) { result += '    '.repeat(ind)+`def ${am[1]}(${am[2]}):\n`; ind++; continue; }
            const cm = trimmed.match(/^class\s+(\w+)(?:\s+extends\s+(\w+))?\s*\{?$/);
            if (cm) { result += '    '.repeat(ind)+(cm[2]?`class ${cm[1]}(${cm[2]}):`:`class ${cm[1]}:`)+'\n'; ind++; continue; }
            const ctm = trimmed.match(/^constructor\s*\((.*)\)\s*\{?$/);
            if (ctm) { result += '    '.repeat(ind)+`def __init__(self${ctm[1]?', '+ctm[1]:''}):\n`; ind++; continue; }
            const ifm = trimmed.match(/^if\s*\((.*)\)\s*\{?$/);
            if (ifm) { result += '    '.repeat(ind)+`if ${self._pyCondition(ifm[1])}:\n`; ind++; continue; }
            const eim = trimmed.match(/^}\s*else\s+if\s*\((.*)\)\s*\{?$/);
            if (eim) { ind--; result += '    '.repeat(ind)+`elif ${self._pyCondition(eim[1])}:\n`; ind++; continue; }
            if (trimmed==='} else {'||trimmed==='else {') { ind--; result += '    '.repeat(ind)+'else:\n'; ind++; continue; }
            const form = trimmed.match(/^for\s*\(\s*(?:let|var|const)\s+(\w+)\s*=\s*(\w+)\s*;\s*\w+\s*<\s*(\w+)\s*;\s*\w+\+\+\s*\)\s*\{?$/);
            if (form) { const s=form[2],e=form[3]; result += '    '.repeat(ind)+(s==='0'?`for ${form[1]} in range(${e}):`:`for ${form[1]} in range(${s}, ${e}):`)+'\n'; ind++; continue; }
            const fof = trimmed.match(/^for\s*\(\s*(?:let|var|const)\s+(\w+)\s+of\s+(\w+)\s*\)\s*\{?$/);
            if (fof) { result += '    '.repeat(ind)+`for ${fof[1]} in ${fof[2]}:\n`; ind++; continue; }
            const wm = trimmed.match(/^while\s*\((.*)\)\s*\{?$/);
            if (wm) { result += '    '.repeat(ind)+`while ${self._pyCondition(wm[1])}:\n`; ind++; continue; }
            const rm = trimmed.match(/^return\s+(.*?);?$/);
            if (rm) { result += '    '.repeat(ind)+`return ${self._pyValue(rm[1])}\n`; continue; }
            if (trimmed==='}'||trimmed==='};') { if(ind>0) ind--; continue; }
            if (trimmed==='{') continue;
            const vm = trimmed.match(/^(?:const|let|var)\s+(\w+)\s*=\s*(.*?);?$/);
            if (vm) { result += '    '.repeat(ind)+`${vm[1]} = ${self._pyValue(vm[2])}\n`; continue; }
            let conv = trimmed.replace(/\bthis\./g,'self.');
            if (conv.endsWith(';')) conv=conv.slice(0,-1);
            result += '    '.repeat(ind)+conv+'\n';
        }
        return result;
    },

    jsToCpp: function(code) {
        const self = this;
        let result = '#include <iostream>\n#include <string>\n#include <vector>\nusing namespace std;\n\n';
        const lines = code.split('\n');
        let ind = 0;
        for (let line of lines) {
            const trimmed = line.trim();
            if (!trimmed) { result += '\n'; continue; }
            if (trimmed.startsWith('//')) { result += '    '.repeat(ind)+trimmed+'\n'; continue; }
            if (trimmed.includes('console.log')) {
                const m = trimmed.match(/console\.log\s*\(\s*([\s\S]+?)\s*\)\s*;?/);
                if (m) { result += '    '.repeat(ind)+`cout << ${m[1]} << endl;\n`; continue; }
            }
            const fm = trimmed.match(/^(?:async\s+)?function\s+(\w+)\s*\((.*)\)\s*\{?$/);
            if (fm) { const params=fm[2].split(',').map(p=>p.trim()).filter(Boolean).map(p=>'auto '+p).join(', '); result += (fm[1]==='main'?'int main()':'void '+fm[1]+'('+params+')') + ' {\n'; ind++; continue; }
            const am = trimmed.match(/^(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\((.*)\)\s*=>\s*\{?$/);
            if (am) { const params=am[2].split(',').map(p=>p.trim()).filter(Boolean).map(p=>'auto '+p).join(', '); result += `void ${am[1]}(${params}) {\n`; ind++; continue; }
            const cm = trimmed.match(/^class\s+(\w+)(?:\s+extends\s+(\w+))?\s*\{?$/);
            if (cm) { result += (cm[2]?`class ${cm[1]} : public ${cm[2]}`:`class ${cm[1]}`) + ' {\npublic:\n'; ind++; continue; }
            const ifm = trimmed.match(/^if\s*\((.*)\)\s*\{?$/);
            if (ifm) { result += '    '.repeat(ind)+`if (${ifm[1].replace(/===/g,'==').replace(/!==/g,'!=')}) {\n`; ind++; continue; }
            const eim = trimmed.match(/^}\s*else\s+if\s*\((.*)\)\s*\{?$/);
            if (eim) { ind--; result += '    '.repeat(ind)+`} else if (${eim[1].replace(/===/g,'==').replace(/!==/g,'!=')}) {\n`; ind++; continue; }
            if (trimmed==='} else {'||trimmed==='else {') { ind--; result += '    '.repeat(ind)+'} else {\n'; ind++; continue; }
            const form = trimmed.match(/^for\s*\(\s*(?:let|var|const)\s+(\w+)\s*=\s*(\w+)\s*;\s*\w+\s*<\s*(\w+)\s*;\s*\w+\+\+\s*\)\s*\{?$/);
            if (form) { result += '    '.repeat(ind)+`for (int ${form[1]} = ${form[2]}; ${form[1]} < ${form[3]}; ${form[1]}++) {\n`; ind++; continue; }
            const wm = trimmed.match(/^while\s*\((.*)\)\s*\{?$/);
            if (wm) { result += '    '.repeat(ind)+`while (${wm[1]}) {\n`; ind++; continue; }
            const rm = trimmed.match(/^return\s+(.*?);?$/);
            if (rm) { result += '    '.repeat(ind)+`return ${rm[1].replace(/\bnull\b/g,'nullptr')};\n`; continue; }
            if (trimmed==='}'||trimmed==='};') { if(ind>0){ind--;result += '    '.repeat(ind)+'}\n';} continue; }
            if (trimmed==='{') continue;
            const vm = trimmed.match(/^(?:const|let|var)\s+(\w+)\s*=\s*(.*?);?$/);
            if (vm) { let t='auto'; const v=vm[2]; if(/^\d+$/.test(v))t='int'; else if(/^\d+\.\d+$/.test(v))t='double'; else if(v.startsWith('"')||v.startsWith("'"))t='string'; else if(v==='true'||v==='false')t='bool'; result += '    '.repeat(ind)+`${t} ${vm[1]} = ${v.replace(/\bnull\b/g,'nullptr')};\n`; continue; }
            if (trimmed.endsWith(';')) result += '    '.repeat(ind)+trimmed+'\n';
            else result += '    '.repeat(ind)+'// '+trimmed+'\n';
        }
        if (!result.includes('int main(')) result += '\nint main() {\n    return 0;\n}\n';
        return result;
    },

    jsToJava: function(code) {
        const self = this;
        let result = 'import java.util.*;\n\npublic class ConvertedCode {\n';
        const lines = code.split('\n');
        let ind = 1, className = 'ConvertedCode';
        for (let line of lines) {
            const trimmed = line.trim();
            if (!trimmed) { result += '\n'; continue; }
            if (trimmed.startsWith('//')) { result += '    '.repeat(ind)+trimmed+'\n'; continue; }
            if (trimmed.includes('console.log')) {
                const m = trimmed.match(/console\.log\s*\(\s*([\s\S]+?)\s*\)\s*;?/);
                if (m) { result += '    '.repeat(ind)+`System.out.println(${m[1]});\n`; continue; }
            }
            const fm = trimmed.match(/^(?:async\s+)?function\s+(\w+)\s*\((.*)\)\s*\{?$/);
            if (fm) { const params=fm[2].split(',').map(p=>p.trim()).filter(Boolean).map(p=>'Object '+p).join(', '); result += '    '.repeat(ind)+(fm[1]==='main'?'public static void main(String[] args)':`public static void ${fm[1]}(${params})`) + ' {\n'; ind++; continue; }
            const cm = trimmed.match(/^class\s+(\w+)(?:\s+extends\s+(\w+))?\s*\{?$/);
            if (cm) { className=cm[1]; result=result.replace('public class ConvertedCode',cm[2]?`public class ${cm[1]} extends ${cm[2]}`:`public class ${cm[1]}`); continue; }
            const ctm = trimmed.match(/^constructor\s*\((.*)\)\s*\{?$/);
            if (ctm) { const params=ctm[1].split(',').map(p=>p.trim()).filter(Boolean).map(p=>'Object '+p).join(', '); result += '    '.repeat(ind)+`public ${className}(${params}) {\n`; ind++; continue; }
            const ifm = trimmed.match(/^if\s*\((.*)\)\s*\{?$/);
            if (ifm) { result += '    '.repeat(ind)+`if (${ifm[1].replace(/===/g,'==').replace(/!==/g,'!=')}) {\n`; ind++; continue; }
            const eim = trimmed.match(/^}\s*else\s+if\s*\((.*)\)\s*\{?$/);
            if (eim) { ind--; result += '    '.repeat(ind)+`} else if (${eim[1].replace(/===/g,'==').replace(/!==/g,'!=')}) {\n`; ind++; continue; }
            if (trimmed==='} else {'||trimmed==='else {') { ind--; result += '    '.repeat(ind)+'} else {\n'; ind++; continue; }
            const form = trimmed.match(/^for\s*\(\s*(?:let|var|const)\s+(\w+)\s*=\s*(\w+)\s*;\s*\w+\s*<\s*(\w+)\s*;\s*\w+\+\+\s*\)\s*\{?$/);
            if (form) { result += '    '.repeat(ind)+`for (int ${form[1]} = ${form[2]}; ${form[1]} < ${form[3]}; ${form[1]}++) {\n`; ind++; continue; }
            const wm = trimmed.match(/^while\s*\((.*)\)\s*\{?$/);
            if (wm) { result += '    '.repeat(ind)+`while (${wm[1]}) {\n`; ind++; continue; }
            const rm = trimmed.match(/^return\s+(.*?);?$/);
            if (rm) { result += '    '.repeat(ind)+`return ${rm[1]};\n`; continue; }
            if (trimmed==='}'||trimmed==='};') { if(ind>1){ind--;result += '    '.repeat(ind)+'}\n';} continue; }
            if (trimmed==='{') continue;
            const vm = trimmed.match(/^(?:const|let|var)\s+(\w+)\s*=\s*(.*?);?$/);
            if (vm) { let t='var'; const v=vm[2]; if(/^\d+$/.test(v))t='int'; else if(/^\d+\.\d+$/.test(v))t='double'; else if(v.startsWith('"')||v.startsWith("'"))t='String'; else if(v==='true'||v==='false')t='boolean'; result += '    '.repeat(ind)+`${t} ${vm[1]} = ${v};\n`; continue; }
            if (trimmed.endsWith(';')) result += '    '.repeat(ind)+trimmed+'\n';
            else result += '    '.repeat(ind)+'// '+trimmed+'\n';
        }
        result += '}\n'; return result;
    },

    jsToC: function(code) {
        const self = this;
        let result = '#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n#include <stdbool.h>\n\n';
        const lines = code.split('\n');
        let ind = 0;
        for (let line of lines) {
            const trimmed = line.trim();
            if (!trimmed) { result += '\n'; continue; }
            if (trimmed.startsWith('//')) { result += '    '.repeat(ind)+trimmed+'\n'; continue; }
            if (trimmed.includes('console.log')) {
                const m = trimmed.match(/console\.log\s*\(\s*([\s\S]+?)\s*\)\s*;?/);
                if (m) { const sl=m[1].match(/^["']([^"']*)["']$/); if(sl){result += '    '.repeat(ind)+`printf("${sl[1]}\\n");\n`;}else{result += '    '.repeat(ind)+`printf("%d\\n", ${m[1]}); // TODO: Adjust format\n`;} continue; }
            }
            const fm = trimmed.match(/^(?:async\s+)?function\s+(\w+)\s*\((.*)\)\s*\{?$/);
            if (fm) { const params=fm[2].split(',').map(p=>p.trim()).filter(Boolean).map(p=>'int '+p).join(', '); result += (fm[1]==='main'?'int main(int argc, char *argv[])':'void '+fm[1]+'('+(params||'void')+')') + ' {\n'; ind++; continue; }
            const ifm = trimmed.match(/^if\s*\((.*)\)\s*\{?$/);
            if (ifm) { result += '    '.repeat(ind)+`if (${ifm[1].replace(/===/g,'==').replace(/!==/g,'!=')}) {\n`; ind++; continue; }
            const eim = trimmed.match(/^}\s*else\s+if\s*\((.*)\)\s*\{?$/);
            if (eim) { ind--; result += '    '.repeat(ind)+`} else if (${eim[1].replace(/===/g,'==').replace(/!==/g,'!=')}) {\n`; ind++; continue; }
            if (trimmed==='} else {'||trimmed==='else {') { ind--; result += '    '.repeat(ind)+'} else {\n'; ind++; continue; }
            const form = trimmed.match(/^for\s*\(\s*(?:let|var|const)\s+(\w+)\s*=\s*(\w+)\s*;\s*\w+\s*<\s*(\w+)\s*;\s*\w+\+\+\s*\)\s*\{?$/);
            if (form) { result += '    '.repeat(ind)+`for (int ${form[1]} = ${form[2]}; ${form[1]} < ${form[3]}; ${form[1]}++) {\n`; ind++; continue; }
            const wm = trimmed.match(/^while\s*\((.*)\)\s*\{?$/);
            if (wm) { result += '    '.repeat(ind)+`while (${wm[1]}) {\n`; ind++; continue; }
            const rm = trimmed.match(/^return\s+(.*?);?$/);
            if (rm) { result += '    '.repeat(ind)+`return ${rm[1].replace(/\bnull\b/g,'NULL')};\n`; continue; }
            if (trimmed==='}'||trimmed==='};') { if(ind>0){ind--;result += '    '.repeat(ind)+'}\n';} continue; }
            if (trimmed==='{') continue;
            const vm = trimmed.match(/^(?:const|let|var)\s+(\w+)\s*=\s*(.*?);?$/);
            if (vm) { let t='int'; const v=vm[2]; if(/^\d+$/.test(v))t='int'; else if(/^\d+\.\d+$/.test(v))t='double'; else if(v.startsWith('"')||v.startsWith("'"))t='char*'; else if(v==='true'||v==='false')t='bool'; result += '    '.repeat(ind)+`${t} ${vm[1]} = ${v.replace(/\bnull\b/g,'NULL')};\n`; continue; }
            if (trimmed.endsWith(';')) result += '    '.repeat(ind)+trimmed+'\n';
            else result += '    '.repeat(ind)+'// '+trimmed+'\n';
        }
        if (!result.includes('int main(')) result += '\nint main(int argc, char *argv[]) {\n    return 0;\n}\n';
        return result;
    },

    // ─── C → X ───────────────────────────────────────────────────────────────

    cToPython: function(code) {
        const self = this;
        let result = '';
        const lines = code.split('\n');
        let ind = 0;
        for (let line of lines) {
            const trimmed = line.trim();
            if (!trimmed) { result += '\n'; continue; }
            if (trimmed.startsWith('#include')) continue;
            if (trimmed.startsWith('//')) { result += '    '.repeat(ind)+'#'+trimmed.slice(2)+'\n'; continue; }
            if (trimmed.includes('printf')) {
                const m = trimmed.match(/printf\s*\(\s*"([^"]*)"\s*((?:,\s*[^,)]+)*)\s*\)\s*;/);
                if (m) { let fmt=m[1].replace(/\\n/g,''); const args=m[2]?m[2].split(',').map(a=>a.trim()).filter(Boolean):[]; args.forEach(a=>{fmt=fmt.replace(/%[difs]/,`{${a}}`)}); result += '    '.repeat(ind)+(args.length?`print(f"${fmt}")`:`print("${fmt}")`)+'\n'; continue; }
            }
            if (trimmed.includes('scanf')) {
                const m = trimmed.match(/scanf\s*\(\s*"[^"]*"\s*,\s*&(\w+)\s*\)\s*;/);
                if (m) { result += '    '.repeat(ind)+`${m[1]} = int(input())\n`; continue; }
            }
            const fm = trimmed.match(/^(?:void|int|float|double|char\*?|long)\s+(\w+)\s*\((.*)\)\s*\{?\s*$/);
            if (fm) { const params=fm[2].replace(/void/g,'').split(',').map(p=>p.trim()).filter(Boolean).map(p=>{const pts=p.split(/\s+/);return pts[pts.length-1].replace(/[*&]/g,'');}).join(', '); result += (fm[1]==='main'?'\ndef main():':`\ndef ${fm[1]}(${params}):`)+'\n'; ind++; continue; }
            const ifm = trimmed.match(/^if\s*\((.*)\)\s*\{?\s*$/);
            if (ifm) { result += '    '.repeat(ind)+`if ${self._pyCondition(ifm[1])}:\n`; ind++; continue; }
            const eim = trimmed.match(/^}\s*else\s+if\s*\((.*)\)\s*\{?\s*$/);
            if (eim) { ind--; result += '    '.repeat(ind)+`elif ${self._pyCondition(eim[1])}:\n`; ind++; continue; }
            if (trimmed==='} else {'||trimmed==='else {'||trimmed==='} else') { ind--; result += '    '.repeat(ind)+'else:\n'; ind++; continue; }
            const form = trimmed.match(/^for\s*\(\s*(?:int\s+)?(\w+)\s*=\s*(\w+)\s*;\s*\w+\s*<\s*(\w+)\s*;\s*\w+\+\+\s*\)\s*\{?\s*$/);
            if (form) { const s=form[2],e=form[3]; result += '    '.repeat(ind)+(s==='0'?`for ${form[1]} in range(${e}):`:`for ${form[1]} in range(${s}, ${e}):`)+'\n'; ind++; continue; }
            const wm = trimmed.match(/^while\s*\((.*)\)\s*\{?\s*$/);
            if (wm) { result += '    '.repeat(ind)+`while ${self._pyCondition(wm[1])}:\n`; ind++; continue; }
            const rm = trimmed.match(/^return\s+(.*);$/);
            if (rm) { result += '    '.repeat(ind)+`return ${self._pyValue(rm[1])}\n`; continue; }
            if (trimmed==='}'||trimmed==='};') { if(ind>0) ind--; continue; }
            if (trimmed==='{') continue;
            const vm = trimmed.match(/^(?:int|float|double|char\*?|bool|long)\s+(\w+)\s*=\s*(.*);$/);
            if (vm) { result += '    '.repeat(ind)+`${vm[1]} = ${self._pyValue(vm[2])}\n`; continue; }
            if (trimmed.endsWith(';')) { result += '    '.repeat(ind)+self._pyValue(trimmed.slice(0,-1))+'\n'; continue; }
            if (trimmed!=='{') result += '    '.repeat(ind)+'# '+trimmed+'\n';
        }
        if (result.includes('def main():')) result += '\n\nif __name__ == "__main__":\n    main()\n';
        return result;
    },

    cToCpp: function(code) {
        const self = this;
        let result = '#include <iostream>\n#include <string>\n#include <vector>\nusing namespace std;\n\n';
        const lines = code.split('\n');
        let ind = 0;
        for (let line of lines) {
            const trimmed = line.trim();
            if (!trimmed) { result += '\n'; continue; }
            if (trimmed.startsWith('#include <stdio.h>')||trimmed.startsWith('#include <string.h>')) continue;
            if (trimmed.startsWith('#include <stdlib.h>')) { result += '#include <cstdlib>\n'; continue; }
            if (trimmed.startsWith('#include')) { result += trimmed+'\n'; continue; }
            if (trimmed.startsWith('//')) { result += '    '.repeat(ind)+trimmed+'\n'; continue; }
            if (trimmed.includes('printf')) {
                const m = trimmed.match(/printf\s*\(\s*"([^"]*)"\s*((?:,\s*[^,)]+)*)\s*\)\s*;/);
                if (m) { let fmt=m[1].replace(/\\n/g,''); const args=m[2]?m[2].split(',').map(a=>a.trim()).filter(Boolean):[]; if(args.length){let parts=[]; let rem=fmt; args.forEach(a=>{const idx=rem.indexOf('%'); if(idx>=0){if(idx>0)parts.push(`"${rem.slice(0,idx)}"`); parts.push(a); rem=rem.slice(idx+2);}});if(rem)parts.push(`"${rem}"`); result += '    '.repeat(ind)+`cout << ${parts.join(' << ')} << endl;\n`;}else{result += '    '.repeat(ind)+`cout << "${fmt}" << endl;\n`;} continue; }
            }
            if (trimmed.includes('scanf')) {
                const m = trimmed.match(/scanf\s*\(\s*"[^"]*"\s*,\s*&(\w+)\s*\)\s*;/);
                if (m) { result += '    '.repeat(ind)+`cin >> ${m[1]};\n`; continue; }
            }
            const fm = trimmed.match(/^(?:void|int|float|double|char\*?|long)\s+(\w+)\s*\((.*)\)\s*\{?\s*$/);
            if (fm) { let rt=trimmed.split(/\s+/)[0]; const params=fm[2].replace(/char\s*\*/g,'string'); result += (fm[1]==='main'?'int main()':rt+' '+fm[1]+'('+params+')') + ' {\n'; ind++; continue; }
            const ifm = trimmed.match(/^if\s*\((.*)\)\s*\{?\s*$/);
            if (ifm) { result += '    '.repeat(ind)+`if (${ifm[1]}) {\n`; ind++; continue; }
            const eim = trimmed.match(/^}\s*else\s+if\s*\((.*)\)\s*\{?\s*$/);
            if (eim) { ind--; result += '    '.repeat(ind)+`} else if (${eim[1]}) {\n`; ind++; continue; }
            if (trimmed==='} else {'||trimmed==='else {') { ind--; result += '    '.repeat(ind)+'} else {\n'; ind++; continue; }
            const form = trimmed.match(/^for\s*\((.*)\)\s*\{?\s*$/);
            if (form) { result += '    '.repeat(ind)+`for (${form[1]}) {\n`; ind++; continue; }
            const wm = trimmed.match(/^while\s*\((.*)\)\s*\{?\s*$/);
            if (wm) { result += '    '.repeat(ind)+`while (${wm[1]}) {\n`; ind++; continue; }
            const rm = trimmed.match(/^return\s+(.*);$/);
            if (rm) { result += '    '.repeat(ind)+`return ${rm[1]};\n`; continue; }
            if (trimmed==='}'||trimmed==='};') { if(ind>0){ind--;result += '    '.repeat(ind)+'}\n';} continue; }
            if (trimmed==='{') continue;
            result += '    '.repeat(ind)+trimmed.replace(/char\s*\*\s*(\w+)\s*=\s*"([^"]*)"/g,'string $1 = "$2"').replace(/\bNULL\b/g,'nullptr')+'\n';
        }
        return result;
    },

    cToJava: function(code) {
        const self = this;
        let result = 'import java.util.*;\n\npublic class ConvertedCode {\n';
        const lines = code.split('\n');
        let ind = 1;
        const typeMap = {int:'int',float:'float',double:'double','char*':'String',char:'char',bool:'boolean',void:'void',long:'long'};
        for (let line of lines) {
            const trimmed = line.trim();
            if (!trimmed) { result += '\n'; continue; }
            if (trimmed.startsWith('#include')) { result += '    '.repeat(ind)+'// '+trimmed+'\n'; continue; }
            if (trimmed.startsWith('//')) { result += '    '.repeat(ind)+trimmed+'\n'; continue; }
            if (trimmed.includes('printf')) {
                const m = trimmed.match(/printf\s*\(\s*"([^"]*)"\s*((?:,\s*[^,)]+)*)\s*\)\s*;/);
                if (m) { let fmt=m[1].replace(/\\n/g,''); const args=m[2]?m[2].split(',').map(a=>a.trim()).filter(Boolean):[]; if(args.length){result += '    '.repeat(ind)+`System.out.printf("${fmt}\\n", ${args.join(', ')});\n`;}else{result += '    '.repeat(ind)+`System.out.println("${fmt}");\n`;} continue; }
            }
            const fm = trimmed.match(/^(?:void|int|float|double|char\*?|long)\s+(\w+)\s*\((.*)\)\s*\{?\s*$/);
            if (fm) { const rt=typeMap[trimmed.split(/\s+/)[0]]||'void'; const params=fm[2].replace(/void/g,'').split(',').map(p=>p.trim()).filter(Boolean).map(p=>{const pts=p.split(/\s+/);return pts.length>=2?`${typeMap[pts[0]]||pts[0]} ${pts[pts.length-1].replace(/[*&]/g,'')}`:p;}).join(', '); result += '    '.repeat(ind)+(fm[1]==='main'?'public static void main(String[] args)':`public static ${rt} ${fm[1]}(${params})`) + ' {\n'; ind++; continue; }
            const ifm = trimmed.match(/^if\s*\((.*)\)\s*\{?\s*$/);
            if (ifm) { result += '    '.repeat(ind)+`if (${ifm[1]}) {\n`; ind++; continue; }
            const eim = trimmed.match(/^}\s*else\s+if\s*\((.*)\)\s*\{?\s*$/);
            if (eim) { ind--; result += '    '.repeat(ind)+`} else if (${eim[1]}) {\n`; ind++; continue; }
            if (trimmed==='} else {'||trimmed==='else {') { ind--; result += '    '.repeat(ind)+'} else {\n'; ind++; continue; }
            const form = trimmed.match(/^for\s*\((.*)\)\s*\{?\s*$/);
            if (form) { result += '    '.repeat(ind)+`for (${form[1]}) {\n`; ind++; continue; }
            const wm = trimmed.match(/^while\s*\((.*)\)\s*\{?\s*$/);
            if (wm) { result += '    '.repeat(ind)+`while (${wm[1]}) {\n`; ind++; continue; }
            const rm = trimmed.match(/^return\s+(.*);$/);
            if (rm) { result += '    '.repeat(ind)+`return ${rm[1].replace(/\bNULL\b/g,'null')};\n`; continue; }
            if (trimmed==='}'||trimmed==='};') { if(ind>1){ind--;result += '    '.repeat(ind)+'}\n';} continue; }
            if (trimmed==='{') continue;
            if (trimmed.endsWith(';')) result += '    '.repeat(ind)+trimmed.replace(/\bNULL\b/g,'null')+'\n';
            else result += '    '.repeat(ind)+'// '+trimmed+'\n';
        }
        result += '}\n'; return result;
    },

    cToJs: function(code) {
        const self = this;
        let result = '';
        const lines = code.split('\n');
        let ind = 0;
        for (let line of lines) {
            const trimmed = line.trim();
            if (!trimmed) { result += '\n'; continue; }
            if (trimmed.startsWith('#include')) { result += '// '+trimmed+'\n'; continue; }
            if (trimmed.startsWith('//')) { result += '    '.repeat(ind)+trimmed+'\n'; continue; }
            if (trimmed.includes('printf')) {
                const m = trimmed.match(/printf\s*\(\s*"([^"]*)"\s*((?:,\s*[^,)]+)*)\s*\)\s*;/);
                if (m) { let fmt=m[1].replace(/\\n/g,''); const args=m[2]?m[2].split(',').map(a=>a.trim()).filter(Boolean):[]; if(args.length){args.forEach(a=>{fmt=fmt.replace(/%[difs]/,'${'+a+'}');}); result += '    '.repeat(ind)+`console.log(\`${fmt}\`);\n`;}else{result += '    '.repeat(ind)+`console.log("${fmt}");\n`;} continue; }
            }
            const fm = trimmed.match(/^(?:void|int|float|double|char\*?|long)\s+(\w+)\s*\((.*)\)\s*\{?\s*$/);
            if (fm) { const params=fm[2].replace(/void/g,'').split(',').map(p=>p.trim()).filter(Boolean).map(p=>{const pts=p.split(/\s+/);return pts[pts.length-1].replace(/[*&]/g,'');}).join(', '); result += `function ${fm[1]}(${params}) {\n`; ind++; continue; }
            const ifm = trimmed.match(/^if\s*\((.*)\)\s*\{?\s*$/);
            if (ifm) { result += '    '.repeat(ind)+`if (${ifm[1]}) {\n`; ind++; continue; }
            const eim = trimmed.match(/^}\s*else\s+if\s*\((.*)\)\s*\{?\s*$/);
            if (eim) { ind--; result += '    '.repeat(ind)+`} else if (${eim[1]}) {\n`; ind++; continue; }
            if (trimmed==='} else {'||trimmed==='else {') { ind--; result += '    '.repeat(ind)+'} else {\n'; ind++; continue; }
            const form = trimmed.match(/^for\s*\(\s*(?:int\s+)?(\w+)\s*=\s*(\w+)\s*;\s*\w+\s*<\s*(\w+)\s*;\s*\w+\+\+\s*\)\s*\{?\s*$/);
            if (form) { result += '    '.repeat(ind)+`for (let ${form[1]} = ${form[2]}; ${form[1]} < ${form[3]}; ${form[1]}++) {\n`; ind++; continue; }
            const wm = trimmed.match(/^while\s*\((.*)\)\s*\{?\s*$/);
            if (wm) { result += '    '.repeat(ind)+`while (${wm[1]}) {\n`; ind++; continue; }
            const rm = trimmed.match(/^return\s+(.*);$/);
            if (rm) { result += '    '.repeat(ind)+`return ${rm[1].replace(/\bNULL\b/g,'null')};\n`; continue; }
            if (trimmed==='}'||trimmed==='};') { if(ind>0){ind--;result += '    '.repeat(ind)+'}\n';} continue; }
            if (trimmed==='{') continue;
            const vm = trimmed.match(/^(?:int|float|double|char\*?|bool|long)\s+(\w+)\s*=\s*(.*);$/);
            if (vm) { result += '    '.repeat(ind)+`let ${vm[1]} = ${vm[2].replace(/\bNULL\b/g,'null')};\n`; continue; }
            if (trimmed.endsWith(';')) result += '    '.repeat(ind)+trimmed.replace(/\bNULL\b/g,'null')+'\n';
            else result += '    '.repeat(ind)+'// '+trimmed+'\n';
        }
        if (result.includes('function main(')) result += '\n// Run main\nmain();\n';
        return result;
    },

    // ─── Router ───────────────────────────────────────────────────────────────

    convert: function(code, sourceLang, targetLang) {
        if (sourceLang === targetLang) return code;
        const map = {
            'python_cpp': this.pythonToCpp, 'python_java': this.pythonToJava,
            'python_javascript': this.pythonToJs, 'python_c': this.pythonToC,
            'cpp_python': this.cppToPython, 'cpp_java': this.cppToJava,
            'cpp_javascript': this.cppToJs, 'cpp_c': this.cppToC,
            'java_python': this.javaToPython, 'java_cpp': this.javaToCpp,
            'java_javascript': this.javaToJs, 'java_c': this.javaToC,
            'javascript_python': this.jsToPython, 'javascript_cpp': this.jsToCpp,
            'javascript_java': this.jsToJava, 'javascript_c': this.jsToC,
            'c_python': this.cToPython, 'c_cpp': this.cToCpp,
            'c_java': this.cToJava, 'c_javascript': this.cToJs
        };
        const converter = map[sourceLang + '_' + targetLang];
        return converter ? converter.call(this, code) : '// Conversion not supported\n' + code;
    }
};

if (typeof window !== 'undefined') { window.KiroConverters = KiroConverters; }
