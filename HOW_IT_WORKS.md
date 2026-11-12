# 🧠 Kiro Code Translator - How It Works (For Your Understanding)

## 📁 Project Structure Overview

```
Kiro-Code-Translator/
├── web/                    ← WEB INTERFACE (Browser-based)
├── core/                   ← CORE LOGIC (Node.js modules)
├── converters/             ← CONVERSION ENGINES (20 files)
├── test/                   ← TEST FILES
├── examples/               ← SAMPLE CODE FILES
├── demo/                   ← DEMO & OUTPUTS
└── docs/                   ← DOCUMENTATION
```

---

## 🌐 WEB INTERFACE (What You Use in Browser)

### `web/index.html`
**Purpose:** The main webpage you see in browser
- Contains two text areas (source code & converted code)
- Dropdown menus for selecting languages
- Buttons (Convert, Copy, Download, Clear, Swap)
- Links to CSS and JavaScript files

### `web/style.css`
**Purpose:** Makes the page look beautiful (VS Code-like dark theme)
- Colors, fonts, spacing, animations
- Dark/Light theme support
- Responsive design for different screen sizes

### `web/converters.js`
**Purpose:** THE BRAIN - Contains all conversion logic for browser
- `detectLanguage(code)` - Automatically detects what language the code is
- `pythonToCpp(code)` - Converts Python → C++
- `pythonToJava(code)` - Converts Python → Java
- `pythonToJs(code)` - Converts Python → JavaScript
- `pythonToC(code)` - Converts Python → C
- `cppToPython(code)` - Converts C++ → Python
- `javaToPython(code)` - Converts Java → Python
- `jsToPython(code)` - Converts JavaScript → Python
- `convert(code, source, target)` - Main function that routes to correct converter

### `web/app.js`
**Purpose:** Handles user interactions
- Button click events (Convert, Copy, Download, etc.)
- Updates line numbers as you type
- Shows toast notifications (success/error messages)
- Theme toggle (dark/light)
- Keyboard shortcuts (Ctrl+Enter to convert)

---

## ⚙️ CORE MODULES (Node.js - For VS Code Extension)

### `core/language_detector.js`
**Purpose:** Detects what programming language the code is written in
```
How it works:
1. Checks file extension (.py, .cpp, .java, .js, .c)
2. Looks for keywords (def, #include, public class, function, printf)
3. Scores each language based on matches
4. Returns the highest scoring language
```

### `core/conversion_router.js`
**Purpose:** Routes code to the correct converter
```
How it works:
1. Takes source language + target language
2. Creates a key like "python_cpp"
3. Looks up the correct converter function
4. Calls that converter and returns result
```

### `core/output_generator.js`
**Purpose:** Formats the final output
```
How it works:
1. Adds header comment (source → target, timestamp)
2. Adds the converted code
3. Adds footer comment
4. Returns file extension for the target language
```

---

## 🔄 CONVERTERS (The Actual Conversion Logic)

Each converter file follows this pattern:

### Example: `converters/python_to_cpp.js`
```javascript
function convert(code) {
    // 1. Split code into lines
    // 2. Loop through each line
    // 3. Detect what the line is (function, if, loop, print, etc.)
    // 4. Convert to target language syntax
    // 5. Return converted code
}
```

### Conversion Rules (What Gets Converted):

| Python | C++ |
|--------|-----|
| `print("hello")` | `cout << "hello" << endl;` |
| `def func():` | `void func() {` |
| `if x > 5:` | `if (x > 5) {` |
| `for i in range(5):` | `for (int i = 0; i < 5; i++) {` |
| `# comment` | `// comment` |
| `True/False` | `true/false` |

### All 20 Converter Files:
```
python_to_cpp.js    python_to_java.js    python_to_js.js    python_to_c.js
cpp_to_python.js    cpp_to_java.js       cpp_to_js.js       cpp_to_c.js
java_to_python.js   java_to_cpp.js       java_to_js.js      java_to_c.js
js_to_python.js     js_to_cpp.js         js_to_java.js      js_to_c.js
c_to_python.js      c_to_cpp.js          c_to_java.js       c_to_js.js
```

---

## 🧪 TEST FILES

### `test/test_runner.js`
**Purpose:** Tests basic conversion functionality
- Tests language detection
- Tests each converter
- Shows pass/fail results

### `test/integration_test.js`
**Purpose:** Tests the complete flow
- Tests all converters together
- Tests output generation
- Verifies everything works end-to-end

---

## 📝 HOW CONVERSION ACTUALLY WORKS (Step by Step)

### When You Click "Convert" Button:

```
1. USER TYPES CODE
   ↓
2. app.js captures the code from textarea
   ↓
3. detectLanguage() identifies source language
   (looks for keywords like "def", "print", "#include")
   ↓
4. User selects target language from dropdown
   ↓
5. convert(code, source, target) is called
   ↓
6. Router finds correct converter (e.g., pythonToCpp)
   ↓
7. Converter processes line by line:
   - "def hello():" → "void hello() {"
   - "print('hi')" → "cout << 'hi' << endl;"
   - "if x > 5:" → "if (x > 5) {"
   ↓
8. Converted code returned to app.js
   ↓
9. app.js displays result in output textarea
   ↓
10. User can Copy or Download the result
```

---

## 🔑 KEY CONCEPTS

### 1. Pattern Matching (Regex)
```javascript
// This finds "print('something')" in code
trimmed.match(/print\s*\(\s*["'](.*)["']\s*\)/)
```

### 2. String Replacement
```javascript
// Replace Python "and" with C++ "&&"
condition.replace(/and/g, '&&')
```

### 3. Line-by-Line Processing
```javascript
const lines = code.split('\n');  // Split into lines
for (let line of lines) {        // Process each line
    // Convert this line
}
```

### 4. Indentation Tracking
```javascript
const indent = line.search(/\S/);  // Find first non-space character
// Used to know if we're inside a function or at top level
```

---

## 📊 DATA FLOW DIAGRAM

```
┌─────────────────┐
│  User Input     │  (Python code in textarea)
└────────┬────────┘
         ↓
┌─────────────────┐
│ Language Detect │  (Is it Python? C++? Java?)
└────────┬────────┘
         ↓
┌─────────────────┐
│ Select Target   │  (User picks: Convert to Java)
└────────┬────────┘
         ↓
┌─────────────────┐
│ Conversion      │  (pythonToJava function runs)
│ Engine          │  
└────────┬────────┘
         ↓
┌─────────────────┐
│ Output Display  │  (Java code shown in output)
└─────────────────┘
```

---

## 🎯 SIMPLE EXAMPLE

### Input (Python):
```python
print("hello world")
```

### What Happens Inside:
```javascript
// 1. Line is: print("hello world")
// 2. Regex matches: print("hello world")
// 3. Extracts: "hello world"
// 4. Creates: System.out.println("hello world");
// 5. Wraps in main() method
```

### Output (Java):
```java
public class ConvertedCode {
    public static void main(String[] args) {
        System.out.println("hello world");
    }
}
```

---

## 📁 FILES YOU CAN IGNORE

These are just documentation/config, not actual code:
- `*.md` files (documentation)
- `package.json` (npm config)
- `.gitignore` (git config)
- `LICENSE` (legal stuff)

---

## 🚀 TO USE THE WEB VERSION

1. Open `web/index.html` in browser
2. Write code in left panel
3. Select target language
4. Click Convert
5. See result in right panel
6. Copy or Download

---

## 💡 SUMMARY

| Component | What It Does |
|-----------|--------------|
| `web/index.html` | The webpage structure |
| `web/style.css` | Makes it look nice |
| `web/converters.js` | All conversion logic |
| `web/app.js` | Handles button clicks |
| `core/*.js` | Node.js version of logic |
| `converters/*.js` | Individual converter files |
| `test/*.js` | Test files |

**The magic happens in `converters.js`** - it reads your code line by line and transforms each line from one language syntax to another!
