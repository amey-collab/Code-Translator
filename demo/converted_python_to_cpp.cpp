// ============================================
// Converted from PYTHON to CPP
// Original file: sample_python.py
// Conversion timestamp: 2025-12-25T16:20:40.769Z
// ============================================

#include <iostream>
#include <string>
#include <vector>
using namespace std;

// Sample Python Code for Testing Code Translator

void greet(auto name) {
    cout << "Hello, " + name + "!" << endl;

    }
void add(auto a, auto b) {
    return a + b;

    }
void factorial(auto n) {
    if (n <= 1) {
        return 1;
        }
} else {
    return n * factorial(n - 1);

    }
// Main execution
int x = 10;
int y = 20;
auto result = add(x, y);
cout << result << endl;

for (int i = 0; i < 5; i++) {
    cout << i << endl;

    }
if (x > 5) {
    cout << "x is greater than 5" << endl;
    }
else if (x == 5) {
    cout << "x equals 5" << endl;
    }
else {
    cout << "x is less than 5" << endl;

    }
// Calculate factorial
auto fact = factorial(5);
cout << fact << endl;

int main() {
    // TODO: Add main function logic
    return 0;
}


// ============================================
// End of conversion
// Please review TODO comments for manual fixes
// ============================================