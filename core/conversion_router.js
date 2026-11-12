// Conversion Router Module
// Maps source language to target language and routes to appropriate converter

const pythonToCpp = require('../converters/python_to_cpp');
const pythonToJava = require('../converters/python_to_java');
const pythonToJs = require('../converters/python_to_js');
const pythonToC = require('../converters/python_to_c');
const cppToPython = require('../converters/cpp_to_python');
const cppToJava = require('../converters/cpp_to_java');
const cppToC = require('../converters/cpp_to_c');
const cppToJs = require('../converters/cpp_to_js');
const javaToPython = require('../converters/java_to_python');
const javaToCpp = require('../converters/java_to_cpp');
const javaToC = require('../converters/java_to_c');
const javaToJs = require('../converters/java_to_js');
const jsToPython = require('../converters/js_to_python');
const jsToCpp = require('../converters/js_to_cpp');
const jsToC = require('../converters/js_to_c');
const jsToJava = require('../converters/js_to_java');
const cToPython = require('../converters/c_to_python');
const cToCpp = require('../converters/c_to_cpp');
const cToJava = require('../converters/c_to_java');
const cToJs = require('../converters/c_to_js');

const CONVERSION_MAP = {
    'python_to_cpp': pythonToCpp,
    'python_to_java': pythonToJava,
    'python_to_javascript': pythonToJs,
    'python_to_c': pythonToC,
    'cpp_to_python': cppToPython,
    'cpp_to_java': cppToJava,
    'cpp_to_c': cppToC,
    'cpp_to_javascript': cppToJs,
    'java_to_python': javaToPython,
    'java_to_cpp': javaToCpp,
    'java_to_c': javaToC,
    'java_to_javascript': javaToJs,
    'javascript_to_python': jsToPython,
    'javascript_to_cpp': jsToCpp,
    'javascript_to_c': jsToC,
    'javascript_to_java': jsToJava,
    'c_to_python': cToPython,
    'c_to_cpp': cToCpp,
    'c_to_java': cToJava,
    'c_to_javascript': cToJs
};

function getConversionKey(source, target) {
    return `${source}_to_${target}`;
}

function convert(sourceCode, sourceLang, targetLang) {
    const key = getConversionKey(sourceLang, targetLang);
    const converter = CONVERSION_MAP[key];
    
    if (!converter) {
        return {
            success: false,
            error: `Conversion from ${sourceLang} to ${targetLang} not yet supported`,
            code: null
        };
    }
    
    try {
        const convertedCode = converter.convert(sourceCode);
        return {
            success: true,
            error: null,
            code: convertedCode
        };
    } catch (err) {
        return {
            success: false,
            error: `Conversion failed: ${err.message}`,
            code: null
        };
    }
}

function isConversionSupported(sourceLang, targetLang) {
    const key = getConversionKey(sourceLang, targetLang);
    return CONVERSION_MAP.hasOwnProperty(key);
}

module.exports = {
    convert,
    isConversionSupported,
    getConversionKey
};