# Custom Interpreted Language - Specification and Usage

## Overview

This interpreted language processes expressions, assignments, conditionals, loops, and user input using a custom parser and interpreter built in Python.

## Syntax Rules

### 1. Literals

- Integers: `42`
- Floats: `3.14`
- Strings: `~hello~`
- Booleans: `true`, `false`

### 2. Variables

- Assignment: `x = 5`
- Variables are global and must be defined before use.

### 3. Arithmetic Operators

| Operator | Description    |
| -------- | -------------- |
| `+`    | Addition       |
| `-`    | Subtraction    |
| `*`    | Multiplication |
| `/`    | Division       |

### 4. Logical Operators

| Operator | Description |
| -------- | ----------- |
| `&`    | Logical AND |
| `!`    | Logical NOT |

| = Logical OR

### 5. Comparison Operators

| Operator | Description        |
| -------- | ------------------ |
| `==`   | Equal to           |
| `!=`   | Not equal to       |
| `<`    | Less than          |
| `<=`   | Less than or equal |
| `>`    | Greater than       |
| `>=`   | Greater or equal   |

### 6. Grouping

- Use parentheses: `(x + 2) * 3`

### 7. Control Flow

#### If (?) - Else (:)

```
? (x > 10) ./
    d x
/.
```

Optionally with `else`:

```
?(x > 10) ./
    d x
/. : ./
    d ~too small~
/.
```

### 8. Input and Output

- Input: `i (x)` prompts the user and stores the result in `x`
- Output: `d x` prints the value of `x`

## Execution Instructions

1. Add expressions and statements to `test2.src`
2. Run `main.py` to parse and evaluate each line.
3. Comments can be written using square brackets, e.g., `[This is a comment]`

## Special Notes

- Strings must be enclosed in `~like this~`
- All blocks are wrapped in `./` and `/.` instead of curly braces `{}` and `}`
- Mixed-type (string + int etc.) are handled as strings.

## Example Program

```
i(x)
?(x > 0) ./
    d ~Positive~
/. : ./
    d ~Negative or Zero~
/.

y = x + 10
d y
```

Interpreter Components: Lexer (token_converter.py), Parser/AST (expression_analyser.py), Driver (main.py)
