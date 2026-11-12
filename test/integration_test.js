// Integration Test for Kiro Code Translator
const languageDetector = require('../core/language_detector');
const conversionRouter = require('../core/conversion_router');
const outputGenerator = require('../core/output_generator');

console.log('🧪 KIRO CODE TRANSLATOR - INTEGRATION TEST');
console.log('=' .repeat(50));

let passedTests = 0;
let totalTests = 0;

function test(description, testFn) {
    totalTests++;
    try {
        testFn();
        console.log(`✅ ${description}`);
        passedTests++;
    } catch (error) {
        console.log(`❌ ${description}: ${error.message}`);
    }
}

// Test 1: Language Detection
test('Language Detection - Python', () => {
    const code = 'def hello():\n    print("Hello")';
    const detected = languageDetector.detectLanguage(code);
    if (detected !== 'python') throw new Error(`Expected python, got ${detected}`);
});

test('Language Detection - C++', () => {
    const code = '#include <iostream>\nusing namespace std;\nint main() { return 0; }';
    const detected = languageDetector.detectLanguage(code);
    if (detected !== 'cpp') throw new Error(`Expected cpp, got ${detected}`);
});

test('Language Detection - Java', () => {
    const code = 'public class Test {\n    public static void main(String[] args) {}\n}';
    const detected = languageDetector.detectLanguage(code);
    if (detected !== 'java') throw new Error(`Expected java, got ${detected}`);
});

test('Language Detection - JavaScript', () => {
    const code = 'function test() {\n    console.log("Hello");\n}';
    const detected = languageDetector.detectLanguage(code);
    if (detected !== 'javascript') throw new Error(`Expected javascript, got ${detected}`);
});

test('Language Detection - C', () => {
    const code = '#include <stdio.h>\nint main() {\n    printf("Hello");\n    return 0;\n}';
    const detected = languageDetector.detectLanguage(code);
    if (detected !== 'c') throw new Error(`Expected c, got ${detected}`);
});

// Test 2: Conversion Support Check
test('Conversion Support - Python to C++', () => {
    const supported = conversionRouter.isConversionSupported('python', 'cpp');
    if (!supported) throw new Error('Python to C++ should be supported');
});

test('Conversion Support - Java to Python', () => {
    const supported = conversionRouter.isConversionSupported('java', 'python');
    if (!supported) throw new Error('Java to Python should be supported');
});

test('Conversion Support - JavaScript to C', () => {
    const supported = conversionRouter.isConversionSupported('javascript', 'c');
    if (!supported) throw new Error('JavaScript to C should be supported');
});

// Test 3: Actual Conversions
test('Python to C++ Conversion', () => {
    const pythonCode = 'def add(a, b):\n    return a + b\n\nresult = add(5, 3)\nprint(result)';
    const result = conversionRouter.convert(pythonCode, 'python', 'cpp');
    if (!result.success) throw new Error(`Conversion failed: ${result.error}`);
    if (!result.code.includes('#include <iostream>')) throw new Error('Missing C++ headers');
    if (!result.code.includes('cout')) throw new Error('Missing cout statement');
});

test('Python to JavaScript variable redeclaration handling', () => {
    const pythonCode = 'x = 5\nx = x + 1\nprint(x)';
    const result = conversionRouter.convert(pythonCode, 'python', 'javascript');
    if (!result.success) throw new Error(`Conversion failed: ${result.error}`);
    const lines = result.code.split('\n').map(l => l.trim()).filter(Boolean);
    const redeclCount = lines.filter(l => l.startsWith('let x')).length;
    if (redeclCount !== 1) throw new Error('x should be declared once in JS output');
});

test('Python to C++ range step conversion', () => {
    const pythonCode = 'for i in range(1, 10, 2):\n    print(i)';
    const result = conversionRouter.convert(pythonCode, 'python', 'cpp');
    if (!result.success) throw new Error(`Conversion failed: ${result.error}`);
    if (!result.code.includes('for (int i = 1; i < 10; i += 2)')) throw new Error('Range step should translate to i += 2');
});

test('Java to Python Conversion', () => {
    const javaCode = 'public class Test {\n    public static void main(String[] args) {\n        System.out.println("Hello");\n    }\n}';
    const result = conversionRouter.convert(javaCode, 'java', 'python');
    if (!result.success) throw new Error(`Conversion failed: ${result.error}`);
    if (!result.code.includes('print(')) throw new Error('Missing print statement');
    if (!result.code.includes('def main():')) throw new Error('Missing main function');
});

test('JavaScript to Python Conversion', () => {
    const jsCode = 'function greet(name) {\n    console.log("Hello " + name);\n}\ngreet("World");';
    const result = conversionRouter.convert(jsCode, 'javascript', 'python');
    if (!result.success) throw new Error(`Conversion failed: ${result.error}`);
    if (!result.code.includes('def greet(')) throw new Error('Missing function definition');
    if (!result.code.includes('print(')) throw new Error('Missing print statement');
});

// Test 4: Output Generation
test('Output Generator - Header Generation', () => {
    const header = outputGenerator.generateOutputHeader('python', 'cpp', 'test.py');
    if (!header.includes('Converted from PYTHON to CPP')) throw new Error('Missing conversion info');
    if (!header.includes('test.py')) throw new Error('Missing original file path');
});

test('Output Generator - File Extension Mapping', () => {
    if (outputGenerator.getFileExtension('python') !== 'py') throw new Error('Wrong Python extension');
    if (outputGenerator.getFileExtension('cpp') !== 'cpp') throw new Error('Wrong C++ extension');
    if (outputGenerator.getFileExtension('java') !== 'java') throw new Error('Wrong Java extension');
    if (outputGenerator.getFileExtension('javascript') !== 'js') throw new Error('Wrong JavaScript extension');
    if (outputGenerator.getFileExtension('c') !== 'c') throw new Error('Wrong C extension');
});

test('Output Generator - VS Code Language ID', () => {
    if (outputGenerator.getVSCodeLanguageId('python') !== 'python') throw new Error('Wrong Python language ID');
    if (outputGenerator.getVSCodeLanguageId('cpp') !== 'cpp') throw new Error('Wrong C++ language ID');
    if (outputGenerator.getVSCodeLanguageId('java') !== 'java') throw new Error('Wrong Java language ID');
    if (outputGenerator.getVSCodeLanguageId('javascript') !== 'javascript') throw new Error('Wrong JavaScript language ID');
    if (outputGenerator.getVSCodeLanguageId('c') !== 'c') throw new Error('Wrong C language ID');
});

// Test 5: Full Integration Test
test('Full Integration - Python to All Languages', () => {
    const pythonCode = 'def hello():\n    print("Hello World")\n\nhello()';
    const targets = ['cpp', 'java', 'javascript', 'c'];
    
    targets.forEach(target => {
        const result = conversionRouter.convert(pythonCode, 'python', target);
        if (!result.success) throw new Error(`Failed to convert Python to ${target}: ${result.error}`);
        
        const fullOutput = outputGenerator.generateFullOutput(result.code, 'python', target, 'test.py');
        if (!fullOutput.includes('Converted from PYTHON')) throw new Error(`Missing header in ${target} output`);
        if (!fullOutput.includes('End of conversion')) throw new Error(`Missing footer in ${target} output`);
    });
});

// Results
console.log('\n' + '='.repeat(50));
console.log(`📊 TEST RESULTS: ${passedTests}/${totalTests} passed`);

if (passedTests === totalTests) {
    console.log('🎉 ALL TESTS PASSED! Extension is ready for use.');
    console.log('\n🚀 To use the extension:');
    console.log('1. Open VS Code');
    console.log('2. Press F5 to run in Extension Development Host');
    console.log('3. Open any code file');
    console.log('4. Use terminal commands like: Convert Code Language-python');
} else {
    console.log(`❌ ${totalTests - passedTests} tests failed. Please fix issues before deployment.`);
    process.exit(1);
}

console.log('\n✨ Code Translator is ready to rock!');