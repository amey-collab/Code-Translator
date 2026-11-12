# Unsupported Cases and Limitations

## Code Constructs Requiring Manual Review
- Complex algorithms with language-specific optimizations
- Platform-specific system calls
- Advanced memory management (C/C++ pointers)
- Language-specific libraries and frameworks
- Inline assembly code
- Preprocessor macros and directives

## File Types Not Supported
- Binary files
- Compiled executables
- Image/media files
- Database files
- Configuration files (unless they contain code)

## Language-Specific Limitations

### Python to C/C++
- Dynamic typing → Static typing conversion
- List comprehensions → Loop structures
- Duck typing → Interface definitions

### C/C++ to Python
- Manual memory management → Automatic
- Pointer arithmetic → Array/list operations
- Multiple inheritance (C++) → Composition patterns

### Java to Other Languages
- Package structure → Module systems
- Checked exceptions → Error handling patterns
- JVM-specific features → Platform equivalents

## Workarounds
- Extension adds TODO comments for complex cases
- Manual code review always recommended
- Test converted code thoroughly
- Use conversion as starting point, not final solution