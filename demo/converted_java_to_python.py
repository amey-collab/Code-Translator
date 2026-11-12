# ============================================
# Converted from JAVA to PYTHON
# Original file: sample_java.java
# Conversion timestamp: 2025-12-25T16:20:40.813Z
# ============================================

# Sample Java Code for Testing Code Translator
class sample_java:

    # Method to print a greeting
    def greet(self, name):
        print("Hello, " + name + "!")

    # Method to add two numbers
    def add(self, a, b):
        return a + b

    # Recursive factorial method
    def factorial(self, n):
        if n <= 1:
            return 1
        else:
            return n * factorial(n - 1)

    def main():

        # Calling greet function
        greet("Code Translator")

        x = 10
        y = 20
        result = add(x, y)
        print("Sum: " + result)

        # Loop example
        print("\nLoop Output:")
        for i in range(5):
            print(i)

        # Condition check
        print("\nCondition Check:")
        if x > 5:
            print("x is greater than 5")
        elif x == 5:
            print("x equals 5")
        else:
            print("x is less than 5")

        # Factorial call
        fact = factorial(5)
        print("\nFactorial of 5: " + fact)



if __name__ == "__main__":
    main()


# ============================================
# End of conversion
# Please review TODO comments for manual fixes
# ============================================