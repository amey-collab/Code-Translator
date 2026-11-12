// Sample C++ Code for Testing Kiro Code Translator
#include <iostream>
using namespace std;

void greet(string name) {
    cout << "Hello, " << name << "!" << endl;
}

int add(int a, int b) {
    return a + b;
}

int factorial(int n) {
    if (n <= 1) {
        return 1;
    } else {
        return n * factorial(n - 1);
    }
}

int main() {
    int x = 10;
    int y = 20;
    int result = add(x, y);
    cout << result << endl;

    for (int i = 0; i < 5; i++) {
        cout << i << endl;
    }

    if (x > 5) {
        cout << "x is greater than 5" << endl;
    } else if (x == 5) {
        cout << "x equals 5" << endl;
    } else {
        cout << "x is less than 5" << endl;
    }

    // Calculate factorial
    int fact = factorial(5);
    cout << fact << endl;

    return 0;
}