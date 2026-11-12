# Right Click Context Menu (Future Feature)

## Purpose
Alternative trigger method via right-click context menu in editor

## Menu Structure
```
Convert Code To →
├── Python
├── C
├── C++
├── Java
└── JavaScript
```

## Implementation Notes
- Add to VS Code context menu contributions
- Show only when file contains convertible code
- Same conversion logic as terminal commands
- Faster access for users who prefer GUI

## Context Menu Conditions
- Only show when:
  - File is open in editor
  - File contains recognized code
  - Source language is detected
  - Target conversion is supported