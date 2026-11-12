// Demo Script for Code Translator
const languageDetector = require('../core/language_detector');
const conversionRouter = require('../core/conversion_router');
const outputGenerator = require('../core/output_generator');
const fs = require('fs');

console.log('🚀 CODE TRANSLATOR - LIVE DEMO');
console.log('=' .repeat(50));

// Read sample files
const pythonCode = fs.readFileSync('./examples/sample_python.py', 'utf8');
const cppCode = fs.readFileSync('./examples/sample_cpp.cpp', 'utf8');
const javaCode = fs.readFileSync('./examples/sample_java.java', 'utf8');
const jsCode = fs.readFileSync('./examples/sample_javascript.js', 'utf8');
const cCode = fs.readFileSync('./examples/sample_c.c', 'utf8');

console.log('\n📁 Sample Files Loaded:');
console.log('- Python:', pythonCode.split('\n').length, 'lines');
console.log('- C++:', cppCode.split('\n').length, 'lines');
console.log('- Java:', javaCode.split('\n').length, 'lines');
console.log('- JavaScript:', jsCode.split('\n').length, 'lines');
console.log('- C:', cCode.split('\n').length, 'lines');

// Demo conversions
const demos = [
    { name: 'Python → C++', source: pythonCode, sourceLang: 'python', targetLang: 'cpp' },
    { name: 'Python → Java', source: pythonCode, sourceLang: 'python', targetLang: 'java' },
    { name: 'Python → JavaScript', source: pythonCode, sourceLang: 'python', targetLang: 'javascript' },
    { name: 'C++ → Python', source: cppCode, sourceLang: 'cpp', targetLang: 'python' },
    { name: 'Java → Python', source: javaCode, sourceLang: 'java', targetLang: 'python' },
    { name: 'JavaScript → Python', source: jsCode, sourceLang: 'javascript', targetLang: 'python' }
];

demos.forEach((demo, index) => {
    console.log(`\n🔄 DEMO ${index + 1}: ${demo.name}`);
    console.log('-'.repeat(30));
    
    // Detect source language
    const detectedLang = languageDetector.detectLanguage(demo.source);
    console.log(`✅ Detected: ${languageDetector.getLanguageDisplayName(detectedLang)}`);
    
    // Check if conversion is supported
    if (conversionRouter.isConversionSupported(demo.sourceLang, demo.targetLang)) {
        console.log(`✅ Conversion supported: ${demo.sourceLang} → ${demo.targetLang}`);
        
        // Perform conversion
        const result = conversionRouter.convert(demo.source, demo.sourceLang, demo.targetLang);
        
        if (result.success) {
            console.log('✅ Conversion successful');
            
            // Generate full output
            const fullOutput = outputGenerator.generateFullOutput(
                result.code,
                demo.sourceLang,
                demo.targetLang,
                `sample_${demo.sourceLang}.${outputGenerator.getFileExtension(demo.sourceLang)}`
            );
            
            // Save converted file
            const outputFile = `./demo/converted_${demo.sourceLang}_to_${demo.targetLang}.${outputGenerator.getFileExtension(demo.targetLang)}`;
            fs.writeFileSync(outputFile, fullOutput);
            console.log(`💾 Saved: ${outputFile}`);
            
        } else {
            console.log('❌ Conversion failed:', result.error);
        }
    } else {
        console.log(`❌ Conversion not supported: ${demo.sourceLang} → ${demo.targetLang}`);
    }
});

console.log('\n🎉 DEMO COMPLETED!');
console.log('Check the ./demo/ folder for converted files.');
console.log('\n📋 USAGE INSTRUCTIONS:');
console.log('1. Open any code file in VS Code');
console.log('2. Open terminal in VS Code');
console.log('3. Type: Convert Code Language-<target>');
console.log('4. Examples:');
console.log('   - Convert Code Language-python');
console.log('   - Convert Code Language-cpp');
console.log('   - Convert Code Language-java');
console.log('   - Convert Code Language-js');
console.log('   - Convert Code Language-c');
console.log('\n✨ Happy coding with Code Translator!');