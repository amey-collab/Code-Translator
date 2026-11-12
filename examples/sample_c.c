// Sample C Code for Testing Kiro Code Translator
#include <stdio.h>

void greet(char* name) {
    printf("Hello, %s!\n", name);
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
    printf("%d\n", result);

    for (int i = 0; i < 5; i++) {
        printf("%d\n", i);
    }

    if (x > 5) {
        printf("x is greater than 5\n");
    } else if (x == 5) {
        printf("x equals 5\n");
    } else {
        printf("x is less than 5\n");
    }

    // Calculate factorial
    int fact = factorial(5);
    printf("%d\n", fact);

    return 0;
}