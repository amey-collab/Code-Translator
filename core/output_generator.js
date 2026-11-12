// Output Generator Module
// Creates new editor tab with converted code result

function generateOutputHeader(sourceLang, targetLang, originalPath) {
    const timestamp = new Date().toISOString();
    const langComments = {
        python: '#',
        c: '//',
        cpp: '//',
        java: '//',
        javascript: '//'
    };
    
    const comment = langComments[targetLang] || '//';
    
    return `${comment} ============================================
${comment} Converted from ${sourceLang.toUpperCase()} to ${targetLang.toUpperCase()}
${comment} Original file: ${originalPath || 'Unknown'}
${comment} Conversion timestamp: ${timestamp}
${comment} ============================================

`;
}

function generateOutputFooter(targetLang) {
    const langComments = {
        python: '#',
        c: '//',
        cpp: '//',
        java: '//',
        javascript: '//'
    };
    
    const comment = langComments[targetLang] || '//';
    
    return `

${comment} ============================================
${comment} End of conversion
${comment} Please review TODO comments for manual fixes
${comment} ============================================`;
}

function getFileExtension(lang) {
    const extensions = {
        python: 'py',
        c: 'c',
        cpp: 'cpp',
        java: 'java',
        javascript: 'js'
    };
    return extensions[lang] || 'txt';
}

function getVSCodeLanguageId(lang) {
    const ids = {
        python: 'python',
        c: 'c',
        cpp: 'cpp',
        java: 'java',
        javascript: 'javascript'
    };
    return ids[lang] || 'plaintext';
}

function generateFullOutput(convertedCode, sourceLang, targetLang, originalPath) {
    const header = generateOutputHeader(sourceLang, targetLang, originalPath);
    const footer = generateOutputFooter(targetLang);
    return header + convertedCode + footer;
}

module.exports = {
    generateOutputHeader,
    generateOutputFooter,
    getFileExtension,
    getVSCodeLanguageId,
    generateFullOutput
};