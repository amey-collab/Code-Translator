# Kiro Code Translator - Installation Guide

## 🚀 Quick Installation

### Method 1: VS Code Extension (Recommended)
1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X`)
3. Search for "Kiro Code Translator"
4. Click "Install"

### Method 2: Manual Installation
1. Download the `.vsix` file from releases
2. Open VS Code
3. Press `Ctrl+Shift+P` and type "Extensions: Install from VSIX"
4. Select the downloaded `.vsix` file

### Method 3: Development Setup
1. Clone this repository
2. Open in VS Code
3. Press `F5` to run in Extension Development Host

## ✅ Verify Installation

1. Open any code file (Python, C++, Java, JavaScript, C)
2. Open terminal in VS Code (`Ctrl+` ` or View > Terminal)
3. Type: `Convert Code Language-python`
4. If successful, a new tab will open with converted code

## 🎯 Usage

### Terminal Commands
```bash
Convert Code Language-python    # Convert to Python
Convert Code Language-cpp       # Convert to C++
Convert Code Language-java      # Convert to Java
Convert Code Language-js        # Convert to JavaScript
Convert Code Language-c         # Convert to C
```

### Supported Languages
- **Python** (.py) - Functions, classes, loops, conditionals
- **C++** (.cpp) - Classes, templates, STL, OOP patterns
- **Java** (.java) - Classes, methods, packages, inheritance
- **JavaScript** (.js) - Functions, objects, ES6+ features
- **C** (.c) - Functions, structs, pointers, procedural

## 🔧 Requirements

- VS Code 1.74.0 or higher
- Active code file in editor
- Supported source language

## 🐛 Troubleshooting

### Extension Not Working
1. Check VS Code version (must be 1.74.0+)
2. Reload VS Code window (`Ctrl+R`)
3. Check Output panel for errors

### Command Not Recognized
1. Ensure exact command format: `Convert Code Language-<target>`
2. Use lowercase language names
3. Check supported languages list

### Conversion Issues
1. Ensure source file contains recognizable code
2. Check if conversion path is supported
3. Review TODO comments in converted output

## 📞 Support

- GitHub Issues: [Report bugs](https://github.com/kiro/code-translator/issues)
- Documentation: [Full docs](https://github.com/kiro/code-translator/wiki)
- Email: support@kiro-translator.com

## 🔄 Updates

The extension auto-updates through VS Code marketplace. Manual updates:
1. Go to Extensions
2. Find "Kiro Code Translator"
3. Click "Update" if available

## 🎉 You're Ready!

Start converting code between languages with simple terminal commands. Happy coding!