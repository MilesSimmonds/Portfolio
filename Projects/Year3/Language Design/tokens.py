# No enum import needed

# Token types for the language
class TokenType:
    # Single-character tokens
    LEFT_PAREN      = 1
    RIGHT_PAREN     = 2
    MINUS           = 3
    PLUS            = 4
    SLASH           = 5
    STAR            = 6
    EQUAL           = 7

    # One or two character tokens
    BANG            = 8
    BANG_EQUAL      = 9
    EQUAL_EQUAL     = 10
    GREATER         = 11
    GREATER_EQUAL   = 12
    LESS            = 13
    LESS_EQUAL      = 14

    # Literals
    IDENTIFIER      = 15
    STRING          = 16
    INTEGER         = 17
    FLOAT           = 18

    # Keywords
    AND             = 19
    OR              = 20
    TRUE            = 21
    FALSE           = 22
    NOT             = 23
    DISPLAY         = 24  

    IF              = 25
    ELSE            = 26
    INPUT           = 27

    EOF             = 28

    # Braces for blocks
    LEFT_BRACE      = 30  # ./
    RIGHT_BRACE     = 31  # /.

# Token object to store type, text, value, and line number
class Token:
    def __init__(self, type, text: str, literal, line: int):
        self.type = type
        self.text = text
        self.literal = literal
        self.line = line
    
    # Show token details for debugging
    def __repr__(self):
        return f"Token({self.type}, '{self.text}', {repr(self.literal)})"
