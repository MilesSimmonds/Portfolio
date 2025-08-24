from tokens import Token, TokenType

# Turns a line of code into a list of tokens
def tokenise(line):
    try:
        tokens = []
        position = 0
        positionMax = len(line)

        while position < positionMax:
            character = line[position]

            # Handle './' as LEFT_BRACE
            if line[position:position+2] == "./":
                tokens.append(Token(TokenType.LEFT_BRACE, "./", None, 1))
                position += 2
                continue

            # Handle '/.' as RIGHT_BRACE
            if line[position:position+2] == "/.":
                tokens.append(Token(TokenType.RIGHT_BRACE, "/.", None, 1))
                position += 2
                continue

            # Single-character keywords
            if character == "i":
                tokens.append(Token(TokenType.INPUT, "i", None, 1))
                position += 1
                continue
            if character == "d":
                tokens.append(Token(TokenType.DISPLAY, "d", None, 1))
                position += 1
                continue
            if character == "?":
                tokens.append(Token(TokenType.IF, "?", None, 1))
                position += 1
                continue
            if character == ":":
                tokens.append(Token(TokenType.ELSE, ":", None, 1))
                position += 1
                continue
            if character == "&":
                tokens.append(Token(TokenType.AND, "&", None, 1))
                position += 1
                continue
            if character == "|":
                tokens.append(Token(TokenType.OR, "|", None, 1))
                position += 1
                continue
            if character == "!":
                tokens.append(Token(TokenType.BANG, "!", None, 1))
                position += 1
                continue

            # String literal using ~
            if character == "~":
                start = position + 1
                end = start
                while end < positionMax and line[end] != "~":
                    end += 1
                if end >= positionMax: 
                    raise ValueError("You forgot to close the string with ~")
                string_value = line[start:end]
                tokens.append(Token(TokenType.STRING, string_value, string_value, 1))
                position = end + 1
                continue

            # Assignment and comparison
            if character == "=":
                if position + 1 < positionMax and line[position+1] == "=":
                    tokens.append(Token(TokenType.EQUAL_EQUAL, "==", None, 1))
                    position += 2
                else:
                    tokens.append(Token(TokenType.EQUAL, "=", None, 1))
                    position += 1
                continue
            if line[position:position+2] == "!=":
                tokens.append(Token(TokenType.BANG_EQUAL, "!=", None, 1))
                position += 2
                continue
            if line[position:position+2] == "<=":
                tokens.append(Token(TokenType.LESS_EQUAL, "<=", None, 1))
                position += 2
                continue
            if line[position:position+2] == ">=":
                tokens.append(Token(TokenType.GREATER_EQUAL, ">=", None, 1))
                position += 2
                continue

            # Parentheses and braces
            if character == "(":
                tokens.append(Token(TokenType.LEFT_PAREN, "(", None, 1))
                position += 1
                continue
            if character == ")":
                tokens.append(Token(TokenType.RIGHT_PAREN, ")", None, 1))
                position += 1
                continue

            # Arithmetic operators
            if character == "+":
                tokens.append(Token(TokenType.PLUS, "+", None, 1))
                position += 1
                continue
            if character == "-":
                tokens.append(Token(TokenType.MINUS, "-", None, 1))
                position += 1
                continue
            if character == "*":
                tokens.append(Token(TokenType.STAR, "*", None, 1))
                position += 1
                continue
            if character == "/":
                tokens.append(Token(TokenType.SLASH, "/", None, 1))
                position += 1
                continue
            if character == "<":
                tokens.append(Token(TokenType.LESS, "<", None, 1))
                position += 1
                continue
            if character == ">":
                tokens.append(Token(TokenType.GREATER, ">", None, 1))
                position += 1
                continue

            # Identifiers and keywords
            if character.isalpha() or character == "_":
                start = position
                while position < positionMax and (line[position].isalnum() or line[position] == "_"):
                    position += 1
                ident = line[start:position].lower()
                if ident == "true":
                    tokens.append(Token(TokenType.TRUE, ident, True, 1))
                elif ident == "false":
                    tokens.append(Token(TokenType.FALSE, ident, False, 1))
                else:
                    tokens.append(Token(TokenType.IDENTIFIER, ident, ident, 1))
                continue

            # Numbers (int or float)
            if character.isdigit() or (character == "." and position + 1 < positionMax and line[position + 1].isdigit()):
                start = position
                has_dot = False
                if character == ".":
                    has_dot = True
                    position += 1
                else:
                    position += 1
                while position < positionMax and (line[position].isdigit() or (line[position] == "." and not has_dot)):
                    if line[position] == ".":
                        has_dot = True
                    position += 1
                num_str = line[start:position]
                if "." in num_str:
                    tokens.append(Token(TokenType.FLOAT, num_str, float(num_str), 1))
                else:
                    tokens.append(Token(TokenType.INTEGER, num_str, int(num_str), 1))
                continue

            # Skip whitespace
            if character.isspace():
                position += 1
                continue

            # Unknown character error
            raise ValueError(f"Unknown character: {character}")

        return tokens
    except Exception as e:
        raise ValueError(f"Tokenisation failed: {e}")
