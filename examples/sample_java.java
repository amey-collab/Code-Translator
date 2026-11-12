// Sample Java Code for Testing Kiro Code Translator
public class sample_java {
    
    // Method to print a greeting
    public static void greet(String name) {
        System.out.println("Hello, " + name + "!");
    }
    
    // Method to add two numbers
    public static int add(int a, int b) {
        return a + b;
    }
    
    // Recursive factorial method
    public static int factorial(int n) {
        if (n <= 1) {
            return 1;
        } else {
            return n * factorial(n - 1);
        }
    }
    
    public static void main(String[] args) {
        
        // Calling greet function
        greet("Kiro");

        int x = 10;
        int y = 20;
        int result = add(x, y);
        System.out.println("Sum: " + result);
        
        // Loop example
        System.out.println("\nLoop Output:");
        for (int i = 0; i < 5; i++) {
            System.out.println(i);
        }
        
        // Condition check
        System.out.println("\nCondition Check:");
        if (x > 5) {
            System.out.println("x is greater than 5");
        } else if (x == 5) {
            System.out.println("x equals 5");
        } else {
            System.out.println("x is less than 5");
        }
        
        // Factorial call
        int fact = factorial(5);
        System.out.println("\nFactorial of 5: " + fact);
    }
}
