// Test Runner for Kiro Code Translator
const languageDetector = require('../core/language_detector');
const pythonToCpp = require('../converters/python_to_cpp');
const pythonToJava = require('../converters/python_to_java');
const pythonToJs = require('../converters/python_to_js');
const pythonToC = require('../converters/python_to_c');
const cppToPython = require('../converters/cpp_to_python');
const javaToPython = require('../converters/java_to_python');
const jsToPython = require('../converters/js_to_python');

console.log('='.repeat(60));
console.log('KIRO CODE TRANSLATOR - TEST SUITE');
console.log('='.repeat(60));

// Test 1: Language Detection
console.log('\n--- TEST 1: Language Detection ---\n');

const pythonCode = `
def hello():
    print("Hello World")

if __name__ == "__main__":
    hello()
`;

const cppCode = `
#include <iostream>
using namespace std;

int main() {
    cout << "Hello World" << endl;
    return 0;
}
`;

const javaCode = `
public class Hello {
    public static void main(String[] args) {
        System.out.println("Hello World");
    }
}
`;

const jsCode = `
function hello() {
    console.log("Hello World");
}

hello();
`;

const cCode = `
#include <stdio.h>

int main() {
    printf("Hello World\\n");
    return 0;
}
`;

console.log('Python detection:', languageDetector.detectLanguage(pythonCode));
console.log('C++ detection:', languageDetector.detectLanguage(cppCode));
console.log('Java detection:', languageDetector.detectLanguage(javaCode));
console.log('JavaScript detection:', languageDetector.detectLanguage(jsCode));
console.log('C detection:', languageDetector.detectLanguage(cCode));

// Test 2: Python to C++ Conversion
console.log('\n--- TEST 2: Python to C++ Conversion ---\n');

const pythonSample = `
# Sample Python code
def greet(name):
    print("Hello " + name)

def add(a, b):
    return a + b

x = 10
y = 20
result = add(x, y)
print(result)

for i in range(5):
    print(i)

if x > 5:
    print("x is greater than 5")
else:
    print("x is not greater than 5")
`;

console.log('Input Python:');
console.log(pythonSample);
console.log('\nConverted to C++:');
console.log(pythonToCpp.convert(pythonSample));

// Test 3: Python to Java Conversion
console.log('\n--- TEST 3: Python to Java Conversion ---\n');
console.log('Converted to Java:');
console.log(pythonToJava.convert(pythonSample));

// Test 4: Python to JavaScript Conversion
console.log('\n--- TEST 4: Python to JavaScript Conversion ---\n');
console.log('Converted to JavaScript:');
console.log(pythonToJs.convert(pythonSample));

// Test 5: C++ to Python Conversion
console.log('\n--- TEST 5: C++ to Python Conversion ---\n');

const cppSample = `
#include <iostream>
using namespace std;

int add(int a, int b) {
    return a + b;
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
    } else {
        cout << "x is not greater than 5" << endl;
    }
    
    return 0;
}
`;

console.log('Input C++:');
console.log(cppSample);
console.log('\nConverted to Python:');
console.log(cppToPython.convert(cppSample));

// Test 6: Java to Python Conversion
console.log('\n--- TEST 6: Java to Python Conversion ---\n');

const javaSample = `
public class Calculator {
    public static int add(int a, int b) {
        return a + b;
    }
    
    public static void main(String[] args) {
        int x = 10;
        int y = 20;
        int result = add(x, y);
        System.out.println(result);
        
        for (int i = 0; i < 5; i++) {
            System.out.println(i);
        }
        
        if (x > 5) {
            System.out.println("x is greater than 5");
        } else {
            System.out.println("x is not greater than 5");
        }
    }
}
`;

console.log('Input Java:');
console.log(javaSample);
console.log('\nConverted to Python:');
console.log(javaToPython.convert(javaSample));

// Test 7: JavaScript to Python Conversion
console.log('\n--- TEST 7: JavaScript to Python Conversion ---\n');

const jsSample = `
function add(a, b) {
    return a + b;
}

let x = 10;
let y = 20;
let result = add(x, y);
console.log(result);

for (let i = 0; i < 5; i++) {
    console.log(i);
}

if (x > 5) {
    console.log("x is greater than 5");
} else {
    console.log("x is not greater than 5");
}
`;

console.log('Input JavaScript:');
console.log(jsSample);
console.log('\nConverted to Python:');
console.log(jsToPython.convert(jsSample));

console.log('\n' + '='.repeat(60));
console.log('ALL TESTS COMPLETED');
console.log('='.repeat(60));