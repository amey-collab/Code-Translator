// Language Detector Module
// Automatically identifies source programming language from code content

const LANGUAGE_PATTERNS = {
    python: {
        extensions: ['.py', '.pyw'],
        keywords: ['def ', 'import ', 'from ', 'class ', 'if __name__', 'print(', 'elif ', 'except:', 'lambda '],
        patterns: [/^\s*def\s+\w+\s*\(/, /^\s*class\s+\w+/, /^\s*import\s+\w+/, /^\s*from\s+\w+\s+import/]
    },
    c: {
        extensions: ['.c', '.h'],
        keywords: ['#include <stdio.h>', '#include <stdlib.h>', 'printf(', 'scanf(', 'int main(', 'void main('],
        patterns: [/#include\s*<\w+\.h>/, /int\s+main\s*\(/, /printf\s*\(/, /malloc\s*\(/]
    },
    cpp: {
        extensions: ['.cpp', '.cxx', '.cc', '.hpp', '.hxx'],
        keywords: ['#include <iostream>', 'using namespace', 'cout', 'cin', 'std::', 'class ', 'public:', 'private:'],
        patterns: [/#include\s*<iostream>/, /using\s+namespace\s+std/, /std::/, /cout\s*<</, /cin\s*>>/]
    },
    java: {
        extensions: ['.java'],
        keywords: ['public class', 'public static void main', 'System.out', 'import java.', 'package ', 'private ', 'protected '],
        patterns: [/public\s+class\s+\w+/, /public\s+static\s+void\s+main/, /System\.out\.print/]
    },
    javascript: {
        extensions: ['.js', '.jsx', '.mjs'],
        keywords: ['function ', 'const ', 'let ', 'var ', 'console.log', '=>', 'require(', 'module.exports', 'async ', 'await '],
        patterns: [/function\s+\w+\s*\(/, /const\s+\w+\s*=/, /let\s+\w+\s*=/, /console\.log\s*\(/, /=>\s*{/]
    }
};

function detectLanguage(code, fileName = '') {
    // Priority 1: Check file extension
    if (fileName) {
        const ext = '.' + fileName.split('.').pop().toLowerCase();
        for (const [lang, config] of Object.entries(LANGUAGE_PATTERNS)) {
            if (config.extensions.includes(ext)) {
                return lang;
            }
        }
    }

    // Priority 2: Check syntax patterns and keywords
    const scores = {};
    for (const [lang, config] of Object.entries(LANGUAGE_PATTERNS)) {
        scores[lang] = 0;
        
        // Check keywords
        for (const keyword of config.keywords) {
            if (code.includes(keyword)) {
                scores[lang] += 2;
            }
        }
        
        // Check regex patterns
        for (const pattern of config.patterns) {
            if (pattern.test(code)) {
                scores[lang] += 3;
            }
        }
    }

    // Find highest scoring language
    let maxScore = 0;
    let detectedLang = null;
    for (const [lang, score] of Object.entries(scores)) {
        if (score > maxScore) {
            maxScore = score;
            detectedLang = lang;
        }
    }

    if (maxScore >= 2) {
        return detectedLang;
    }

    return null; // Source Language Not Identified
}

function getLanguageDisplayName(lang) {
    const names = {
        python: 'Python',
        c: 'C',
        cpp: 'C++',
        java: 'Java',
        javascript: 'JavaScript'
    };
    return names[lang] || lang;
}

module.exports = {
    detectLanguage,
    getLanguageDisplayName,
    LANGUAGE_PATTERNS
};