# ============================================
# Converted from JAVASCRIPT to PYTHON
# Original file: sample_javascript.js
# Conversion timestamp: 2025-12-25T16:20:40.817Z
# ============================================

# Sample JavaScript Code for Testing Code Translator

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


# ============================================
# End of conversion
# Please review TODO comments for manual fixes
# ============================================