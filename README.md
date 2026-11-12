# 🚀 Code Translator

**Smart, On-Demand Code Conversion Extension for VS Code**

Convert code between Python, C++, Java, JavaScript, and C using simple terminal commands. No popups, no interruptions - just clean conversion when you need it.

## ✨ Features

- **On-demand conversion** - Only converts when you trigger it
- **Auto language detection** - Identifies source language automatically
- **Terminal-based triggers** - Simple command interface
- **Safe conversion** - Never overwrites original files
- **Multi-language support** - Python, C, C++, Java, JavaScript

## 🎯 Quick Start

1. Open any code file in VS Code
2. Open terminal (`Ctrl+` ` or View > Terminal)
3. Type conversion command:
```bash
Convert Code Language-python
```
4. New tab opens with converted code!

## 📋 Supported Commands

| Command | Target Language |
|---------|-----------------|
| `Convert Code Language-python` | Python |
| `Convert Code Language-c` | C |
| `Convert Code Language-cpp` | C++ |
| `Convert Code Language-java` | Java |
| `Convert Code Language-js` | JavaScript |

## 🔄 Conversion Matrix

| From ↓ / To → | Python | C | C++ | Java | JavaScript |
|---------------|--------|---|-----|------|------------|
| **Python** | - | ✅ | ✅ | ✅ | ✅ |
| **C** | ✅ | - | ✅ | ✅ | ✅ |
| **C++** | ✅ | ✅ | - | ✅ | ✅ |
| **Java** | ✅ | ✅ | ✅ | - | ✅ |
| **JavaScript** | ✅ | ✅ | ✅ | ✅ | - |

## 🛠️ How It Works

1. **Detects** your currently open file
2. **Identifies** the source programming language
3. **Converts** code to your requested target language
4. **Opens** result in new tab with syntax highlighting
5. **Preserves** your original file unchanged

## 📁 Project Structure

```
Code-Translator/
├── package.json              # Extension manifest
├── extension.js              # Main entry point
├── core/                     # Core modules
│   ├── language_detector.js  # Source language detection
│   ├── conversion_router.js  # Conversion routing
│   └── output_generator.js   # Output formatting
├── converters/               # Language converters (20 files)
│   ├── python_to_cpp.js
│   ├── python_to_java.js
│   ├── cpp_to_python.js
│   └── ... (all combinations)
├── examples/                 # Sample code files
├── demo/                     # Demo & converted outputs
├── test/                     # Test suites
└── docs/                     # Documentation
```

## 🧪 Testing

Run tests to verify everything works:

```bash
# Run unit tests
node test/test_runner.js

# Run integration tests
node test/integration_test.js

# Run demo converter
node demo/demo_converter.js
```

## 🔧 Development Setup

1. Clone the repository
2. Open in VS Code
3. Press `F5` to launch Extension Development Host
4. Open any code file and test conversion commands

## 🛡️ Safety Features

- ✅ Never modifies original files
- ✅ Creates new tabs for converted code
- ✅ Adds TODO comments for complex conversions
- ✅ Preserves code structure and logic
- ✅ No workflow interruptions

## 📝 Conversion Notes

- Complex language-specific features may need manual review
- TODO comments mark areas requiring attention
- Test converted code thoroughly before use
- Use conversion as starting point, not final solution

## 🚀 Installation

### From VS Code Marketplace
1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X`)
3. Search "Code Translator"
4. Click Install

### Manual Installation
1. Download `.vsix` file from releases
2. In VS Code: `Ctrl+Shift+P` → "Extensions: Install from VSIX"
3. Select the downloaded file

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines before submitting PRs.



**Made with ❤️ by Team**

*Convert code, not your workflow.*