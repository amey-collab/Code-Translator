// Kiro Code Translator - Main Application
document.addEventListener('DOMContentLoaded', function() {
    var sourceCode = document.getElementById('sourceCode');
    var outputCode = document.getElementById('outputCode');
    var sourceLanguage = document.getElementById('sourceLanguage');
    var targetLanguage = document.getElementById('targetLanguage');
    var convertBtn = document.getElementById('convertBtn');
    var copyBtn = document.getElementById('copyBtn');
    var downloadBtn = document.getElementById('downloadBtn');
    var clearBtn = document.getElementById('clearBtn');
    var swapBtn = document.getElementById('swapBtn');
    var sampleBtn = document.getElementById('sampleBtn');
    var themeToggle = document.getElementById('themeToggle');
    var sourceLineNumbers = document.getElementById('sourceLineNumbers');
    var outputLineNumbers = document.getElementById('outputLineNumbers');
    var sourceCharCount = document.getElementById('sourceCharCount');
    var outputCharCount = document.getElementById('outputCharCount');
    var sourceStatus = document.getElementById('sourceStatus');
    var outputStatus = document.getElementById('outputStatus');
    var detectedLang = document.getElementById('detectedLang');
    var toast = document.getElementById('toast');
    var toastMessage = document.getElementById('toastMessage');

    var samples = {
        python: '# Python Sample\ndef greet(name):\n    print("Hello, " + name)\n\ndef add(a, b):\n    return a + b\n\nx = 10\ny = 20\nresult = add(x, y)\nprint(result)\n\nfor i in range(5):\n    print(i)\n\nif x > 5:\n    print("x is greater")\nelse:\n    print("x is smaller")',
        cpp: '// C++ Sample\n#include <iostream>\nusing namespace std;\n\nvoid greet(string name) {\n    cout << "Hello, " << name << endl;\n}\n\nint add(int a, int b) {\n    return a + b;\n}\n\nint main() {\n    int x = 10;\n    int y = 20;\n    int result = add(x, y);\n    cout << result << endl;\n    \n    for (int i = 0; i < 5; i++) {\n        cout << i << endl;\n    }\n    return 0;\n}',
        java: '// Java Sample\npublic class Sample {\n    public static void greet(String name) {\n        System.out.println("Hello, " + name);\n    }\n    \n    public static int add(int a, int b) {\n        return a + b;\n    }\n    \n    public static void main(String[] args) {\n        int x = 10;\n        int y = 20;\n        int result = add(x, y);\n        System.out.println(result);\n        \n        for (int i = 0; i < 5; i++) {\n            System.out.println(i);\n        }\n    }\n}',
        javascript: '// JavaScript Sample\nfunction greet(name) {\n    console.log("Hello, " + name);\n}\n\nfunction add(a, b) {\n    return a + b;\n}\n\nlet x = 10;\nlet y = 20;\nlet result = add(x, y);\nconsole.log(result);\n\nfor (let i = 0; i < 5; i++) {\n    console.log(i);\n}\n\nif (x > 5) {\n    console.log("x is greater");\n}',
        c: '// C Sample\n#include <stdio.h>\n\nvoid greet(char* name) {\n    printf("Hello, %s\\n", name);\n}\n\nint add(int a, int b) {\n    return a + b;\n}\n\nint main() {\n    int x = 10;\n    int y = 20;\n    int result = add(x, y);\n    printf("%d\\n", result);\n    \n    for (int i = 0; i < 5; i++) {\n        printf("%d\\n", i);\n    }\n    return 0;\n}'
    };

    function updateLineNumbers(textarea, lineNumbersEl) {
        var lines = textarea.value.split('\n').length;
        var html = '';
        for (var i = 1; i <= lines; i++) {
            html += i + '<br>';
        }
        lineNumbersEl.innerHTML = html;
    }

    function showToast(message, isError) {
        toastMessage.textContent = message;
        var icon = toast.querySelector('.toast-icon');
        icon.textContent = isError ? '✗' : '✓';
        icon.style.color = isError ? 'var(--error)' : 'var(--success)';
        toast.classList.add('show');
        setTimeout(function() { toast.classList.remove('show'); }, 3000);
    }

    
function detectSourceLanguage() {
        if (sourceLanguage.value !== 'auto') return sourceLanguage.value;
        var detected = KiroConverters.detectLanguage(sourceCode.value);
        detectedLang.textContent = 'Auto-detect: ' + detected.charAt(0).toUpperCase() + detected.slice(1);
        return detected;
    }

    function convertCode() {
        var code = sourceCode.value.trim();
        if (!code) {
            showToast('Please enter some code first!', true);
            return;
        }

        var sourceLang = detectSourceLanguage();
        var targetLang = targetLanguage.value;

        if (sourceLang === targetLang) {
            showToast('Source and target languages are the same!', true);
            return;
        }

        convertBtn.classList.add('converting');
        sourceStatus.textContent = 'Converting...';

        setTimeout(function() {
            try {
                var result = KiroConverters.convert(code, sourceLang, targetLang);
                outputCode.value = result;
                updateLineNumbers(outputCode, outputLineNumbers);
                outputCharCount.textContent = result.length + ' chars';
                outputStatus.textContent = 'Converted: ' + sourceLang + ' → ' + targetLang;
                showToast('Successfully converted to ' + targetLang.toUpperCase() + '!', false);
            } catch (error) {
                showToast('Conversion failed: ' + error.message, true);
                outputStatus.textContent = 'Error';
            }
            convertBtn.classList.remove('converting');
            sourceStatus.textContent = 'Ready';
        }, 300);
    }

    function copyToClipboard() {
        if (!outputCode.value) {
            showToast('Nothing to copy!', true);
            return;
        }
        navigator.clipboard.writeText(outputCode.value).then(function() {
            showToast('Copied to clipboard!', false);
        }).catch(function() {
            showToast('Failed to copy!', true);
        });
    }

    function downloadFile() {
        if (!outputCode.value) {
            showToast('Nothing to download!', true);
            return;
        }
        var extensions = { python: 'py', cpp: 'cpp', java: 'java', javascript: 'js', c: 'c' };
        var ext = extensions[targetLanguage.value] || 'txt';
        var blob = new Blob([outputCode.value], { type: 'text/plain' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'converted_code.' + ext;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Downloaded as converted_code.' + ext, false);
    }

    
function clearAll() {
        sourceCode.value = '';
        outputCode.value = '';
        updateLineNumbers(sourceCode, sourceLineNumbers);
        updateLineNumbers(outputCode, outputLineNumbers);
        sourceCharCount.textContent = '0 chars';
        outputCharCount.textContent = '0 chars';
        sourceStatus.textContent = 'Ready';
        outputStatus.textContent = 'Waiting for conversion...';
        showToast('Cleared!', false);
    }

    function swapLanguages() {
        var temp = outputCode.value;
        if (temp) {
            sourceCode.value = temp;
            outputCode.value = '';
            var sourceLang = sourceLanguage.value === 'auto' ? detectSourceLanguage() : sourceLanguage.value;
            sourceLanguage.value = targetLanguage.value;
            targetLanguage.value = sourceLang;
            updateLineNumbers(sourceCode, sourceLineNumbers);
            updateLineNumbers(outputCode, outputLineNumbers);
            sourceCharCount.textContent = sourceCode.value.length + ' chars';
            outputCharCount.textContent = '0 chars';
            showToast('Swapped!', false);
        }
    }

    function loadSample() {
        var lang = sourceLanguage.value === 'auto' ? 'python' : sourceLanguage.value;
        sourceCode.value = samples[lang] || samples.python;
        updateLineNumbers(sourceCode, sourceLineNumbers);
        sourceCharCount.textContent = sourceCode.value.length + ' chars';
        showToast('Loaded ' + lang + ' sample!', false);
    }

    function toggleTheme() {
        document.body.classList.toggle('light-theme');
        var isLight = document.body.classList.contains('light-theme');
        themeToggle.textContent = isLight ? '☀️' : '🌙';
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
    }

    // Event listeners
    convertBtn.addEventListener('click', convertCode);
    copyBtn.addEventListener('click', copyToClipboard);
    downloadBtn.addEventListener('click', downloadFile);
    clearBtn.addEventListener('click', clearAll);
    swapBtn.addEventListener('click', swapLanguages);
    sampleBtn.addEventListener('click', loadSample);
    themeToggle.addEventListener('click', toggleTheme);

    sourceCode.addEventListener('input', function() {
        updateLineNumbers(sourceCode, sourceLineNumbers);
        sourceCharCount.textContent = sourceCode.value.length + ' chars';
        if (sourceLanguage.value === 'auto') detectSourceLanguage();
    });

    sourceCode.addEventListener('scroll', function() {
        sourceLineNumbers.scrollTop = sourceCode.scrollTop;
    });

    outputCode.addEventListener('scroll', function() {
        outputLineNumbers.scrollTop = outputCode.scrollTop;
    });

    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            convertCode();
        }
    });

    // Load saved theme
    if (localStorage.getItem('theme') === 'light') {
        document.body.classList.add('light-theme');
        themeToggle.textContent = '☀️';
    }

    // Initialize
    updateLineNumbers(sourceCode, sourceLineNumbers);
    updateLineNumbers(outputCode, outputLineNumbers);
    
    console.log('Kiro Code Translator loaded!');
});