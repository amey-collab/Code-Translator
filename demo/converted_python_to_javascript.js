// ============================================
// Converted from PYTHON to JAVASCRIPT (Fixed)
// Original file: sample_python.py
// Conversion timestamp: 2025-12-25T16:20:40.777Z
// ============================================

// Sample Python Code for Testing Code Translator

function greet(name) {
    console.log("Hello, " + name + "!");
}

function add(a, b) {
    return a + b;
}

function factorial(n) {
    if (n <= 1) {
        return 1;
    } else {
        return n * factorial(n - 1);
    }
}

// Main execution
let x = 10;
let y = 20;
let result = add(x, y);
console.log("Result:", result);

// Loop example
for (let i = 0; i < 5; i++) {
    console.log(i);
}

// Condition example
if (x > 5) {
    console.log("x is greater than 5");
} else if (x === 5) {
    console.log("x equals 5");
} else {
    console.log("x is less than 5");
}

// Calculate factorial
let fact = factorial(5);
console.log("Factorial of 5:", fact);

// ============================================
// End of conversion (Fully valid JavaScript)
// ============================================
