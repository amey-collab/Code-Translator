# Sample Python Code for Testing Kiro Code Translator

def greet(name):
    print("Hello, " + name + "!")

def add(a, b):
    return a + b

def factorial(n):
    if n <= 1:
        return 1
    else:
        return n * factorial(n - 1)

# Main execution
x = 10
y = 20
result = add(x, y)
print(result)

for i in range(5):
    print(i)

if x > 5:
    print("x is greater than 5")
elif x == 5:
    print("x equals 5")
else:
    print("x is less than 5")

# Calculate factorial
fact = factorial(5)
print(fact)