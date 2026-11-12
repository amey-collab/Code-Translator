# Conversion Router Module

## Purpose
Maps source language to target language and routes to appropriate converter

## Conversion Matrix
| Source → Target | Handler Module |
|----------------|----------------|
| Python → C++ | python_to_cpp.js |
| Python → Java | python_to_java.js |
| Python → JS | python_to_js.js |
| C++ → Python | cpp_to_python.js |
| C++ → Java | cpp_to_java.js |
| Java → Python | java_to_python.js |
| Java → C++ | java_to_cpp.js |
| JS → Python | js_to_python.js |
| JS → C++ | js_to_cpp.js |

## Routing Logic
1. Receive source language (from detector)
2. Receive target language (from command)
3. Check if conversion path exists
4. Load appropriate converter module
5. Execute conversion
6. Return converted code

## Error Handling
- Unsupported conversion → Create placeholder with TODO comments
- Converter not found → "Conversion from <source> to <target> not yet supported"
- Conversion failure → Preserve structure, add error comments