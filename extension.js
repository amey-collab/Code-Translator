// Kiro Code Translator - Main Extension Entry Point
const vscode = require('vscode');
const languageDetector = require('./core/language_detector');
const conversionRouter = require('./core/conversion_router');
const outputGenerator = require('./core/output_generator');

// Supported target languages
const SUPPORTED_LANGUAGES = ['python', 'c', 'cpp', 'java', 'javascript', 'js'];

// Language aliases
const LANGUAGE_ALIASES = {
    'js': 'javascript',
    'py': 'python',
    'c++': 'cpp'
};

function activate(context) {
    console.log('Kiro Code Translator is now active!');

    // Register commands for each target language
    const convertToPython = vscode.commands.registerCommand('kiro-code-translator.convertToPython', () => {
        convertCode('python');
    });

    const convertToC = vscode.commands.registerCommand('kiro-code-translator.convertToC', () => {
        convertCode('c');
    });

    const convertToCpp = vscode.commands.registerCommand('kiro-code-translator.convertToCpp', () => {
        convertCode('cpp');
    });

    const convertToJava = vscode.commands.registerCommand('kiro-code-translator.convertToJava', () => {
        convertCode('java');
    });

    const convertToJs = vscode.commands.registerCommand('kiro-code-translator.convertToJs', () => {
        convertCode('javascript');
    });

    // Register terminal command listener
    const terminalListener = vscode.window.onDidWriteTerminalData(event => {
        const data = event.data.trim();
        
        // Check for conversion command pattern
        if (data.startsWith('Convert Code Language-')) {
            const targetLang = data.replace('Convert Code Language-', '').trim().toLowerCase();
            
            // Resolve aliases
            const resolvedLang = LANGUAGE_ALIASES[targetLang] || targetLang;
            
            if (SUPPORTED_LANGUAGES.includes(resolvedLang)) {
                convertCode(resolvedLang);
            } else {
                vscode.window.showErrorMessage(`Unsupported target language: ${targetLang}`);
            }
        }
    });

    context.subscriptions.push(
        convertToPython,
        convertToC,
        convertToCpp,
        convertToJava,
        convertToJs,
        terminalListener
    );
}

async function convertCode(targetLang) {
    // Get active editor
    const editor = vscode.window.activeTextEditor;
    
    if (!editor) {
        vscode.window.showErrorMessage('No file is currently open in editor');
        return;
    }

    const document = editor.document;
    const sourceCode = document.getText();
    const fileName = document.fileName;

    if (!sourceCode || sourceCode.trim() === '') {
        vscode.window.showErrorMessage('File is empty - nothing to convert');
        return;
    }

    // Detect source language
    const sourceLang = languageDetector.detectLanguage(sourceCode, fileName);
    
    if (!sourceLang) {
        vscode.window.showErrorMessage('Source Language Not Identified - Manual support required');
        return;
    }

    // Check if source and target are the same
    if (sourceLang === targetLang || (sourceLang === 'javascript' && targetLang === 'js')) {
        vscode.window.showInformationMessage(`File is already in ${languageDetector.getLanguageDisplayName(targetLang)}`);
        return;
    }

    // Check if conversion is supported
    if (!conversionRouter.isConversionSupported(sourceLang, targetLang)) {
        vscode.window.showErrorMessage(`Conversion from ${languageDetector.getLanguageDisplayName(sourceLang)} to ${languageDetector.getLanguageDisplayName(targetLang)} not yet supported`);
        return;
    }

    // Perform conversion
    const result = conversionRouter.convert(sourceCode, sourceLang, targetLang);
    
    if (!result.success) {
        vscode.window.showErrorMessage(result.error);
        return;
    }

    // Generate full output with header/footer
    const fullOutput = outputGenerator.generateFullOutput(
        result.code,
        sourceLang,
        targetLang,
        fileName
    );

    // Create new document with converted code
    const newDocument = await vscode.workspace.openTextDocument({
        content: fullOutput,
        language: outputGenerator.getVSCodeLanguageId(targetLang)
    });

    // Show the new document
    await vscode.window.showTextDocument(newDocument, {
        viewColumn: vscode.ViewColumn.Beside,
        preview: false
    });

    vscode.window.showInformationMessage(
        `Converted from ${languageDetector.getLanguageDisplayName(sourceLang)} to ${languageDetector.getLanguageDisplayName(targetLang)}`
    );
}

function deactivate() {
    console.log('Kiro Code Translator deactivated');
}

module.exports = {
    activate,
    deactivate
};