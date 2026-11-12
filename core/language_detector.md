# Language Detector Module

## Purpose
Automatically identifies source programming language from code content

## Detection Priority
1. File extension (if available)
2. Syntax recognition patterns
3. Language-specific keywords
4. Code structure patterns

## Language Patterns

### Python
- Keywords: `def`, `import`, `from`, `class`, `if __name__`
- Syntax: Indentation-based, `print()`, `:`
- Extensions: `.py`, `.pyw`

### C
- Keywords: `#include`, `int main()`, `printf`, `scanf`
- Syntax: `{}`, `;`, `//`, `/* */`
- Extensions: `.c`, `.h`

### C++
- Keywords: `#include <iostream>`, `using namespace`, `cout`, `cin`
- Syntax: `{}`, `;`, `//`, `/* */`, `::`
- Extensions: `.cpp`, `.cxx`, `.cc`, `.hpp`

### Java
- Keywords: `public class`, `public static void main`, `System.out`
- Syntax: `{}`, `;`, `//`, `/* */`
- Extensions: `.java`

### JavaScript
- Keywords: `function`, `var`, `let`, `const`, `console.log`
- Syntax: `{}`, `;`, `//`, `/* */`
- Extensions: `.js`, `.jsx`

## Fallback
If detection fails: "Source Language Not Identified - Manual support required"