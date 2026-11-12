// ============================================
// Converted from PYTHON to JAVA (Corrected)
// Original file: sample_python.py
// Conversion timestamp: 2025-12-25T16:20:40.774Z
// ============================================

import java.util.*;

public class ConvertedCode {

    // Greet function (Python: def greet(name))
    public static void greet(String name) {
        System.out.println("Hello, " + name + "!");
    }

    // Add function (Python: def add(a, b))
    public static int add(int a, int b) {
        return a + b;
    }

    // Factorial function (Python: def factorial(n))
    public static int factorial(int n) {
        if (n <= 1) {
            return 1;
        } else {
            return n * factorial(n - 1);
        }
    }

    // ============================
    // Main execution starts here
    // ============================
    public static void main(String[] args) {

        greet("Code Converter");

        int x = 10;
        int y = 20;
        int result = add(x, y);
        System.out.println("Result: " + result);

        // Loop conversion
        for (int i = 0; i < 5; i++) {
            System.out.println(i);
        }

        // Conditions
        if (x > 5) {
            System.out.println("x is greater than 5");
        } else if (x == 5) {
            System.out.println("x equals 5");
        } else {
            System.out.println("x is less than 5");
        }

        // Factorial
        int fact = factorial(5);
        System.out.println("Factorial of 5: " + fact);

    }
}

// ============================================
// End of conversion (Now fully valid Java code)
// ============================================
