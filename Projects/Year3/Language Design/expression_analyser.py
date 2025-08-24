from tokens import Token, TokenType  # Import token types

global_vars = {}  # Store all variables here

# ASTNode represents a node in the syntax tree
class ASTNode:
    def __init__(self, token):
        self.token = token
        self.left = None
        self.right = None

    # Evaluate this node
    def evaluate(self):
        token = self.token.type
        # Variable lookup
        if token == TokenType.IDENTIFIER:
            var_name = self.token.literal
            if var_name in global_vars:
                return global_vars[var_name]
            else:
                raise ValueError(f"Undefined variable: {var_name}")
        # Assignment
        elif token == TokenType.EQUAL:
            var_name = self.left.token.literal
            value = self.right.evaluate()
            global_vars[var_name] = value
            return value
        # Display/print
        elif token == TokenType.DISPLAY:
            value = self.left.evaluate()
            print(value)
            return value
        # Integer literal
        elif token == TokenType.INTEGER:
            return self.token.literal
        # Float literal
        elif token == TokenType.FLOAT:
            return self.token.literal
        # String literal
        elif token == TokenType.STRING:
            return f"~{self.token.literal}~"
        # Boolean true
        elif token == TokenType.TRUE:
            return True
        # Boolean false
        elif token == TokenType.FALSE:
            return False
        # Addition
        elif token == TokenType.PLUS:
            left = self.left.evaluate()
            right = self.right.evaluate()
            # Numeric addition
            if isinstance(left, (int, float)) and isinstance(right, (int, float)):
                return left + right
            # String concatenation
            if isinstance(left, str) and isinstance(right, str):
                return f"~{left.strip('~') + right.strip('~')}~"
            # String + number
            if isinstance(left, str) and isinstance(right, (int, float)):
                return f"~{left.strip('~') + str(right)}~"
            if isinstance(left, (int, float)) and isinstance(right, str):
                return f"~{str(left) + right.strip('~')}~"
            # Error for invalid types
            raise Exception(f"Cannot add incompatible types: {type(left).__name__} + {type(right).__name__}")
        # Subtraction
        elif token == TokenType.MINUS:
            if self.right is None:
                return -self.left.evaluate()
            return self.left.evaluate() - self.right.evaluate()
        # Multiplication
        elif token == TokenType.STAR:
            return self.left.evaluate() * self.right.evaluate()
        # Division
        elif token == TokenType.SLASH:
            return self.left.evaluate() / self.right.evaluate()
        # Equality
        elif token == TokenType.EQUAL_EQUAL:
            return self.left.evaluate() == self.right.evaluate()
        # Not equal
        elif token == TokenType.BANG_EQUAL:
            return self.left.evaluate() != self.right.evaluate()
        # Less than
        elif token == TokenType.LESS:
            return self.left.evaluate() < self.right.evaluate()
        # Less or equal
        elif token == TokenType.LESS_EQUAL:
            return self.left.evaluate() <= self.right.evaluate()
        # Greater than
        elif token == TokenType.GREATER:
            return self.left.evaluate() > self.right.evaluate()
        # Greater or equal
        elif token == TokenType.GREATER_EQUAL:
            return self.left.evaluate() >= self.right.evaluate()
        # Logical AND
        elif token == TokenType.AND:
            return self.left.evaluate() and self.right.evaluate()
        # Logical OR
        elif token == TokenType.OR:
            return self.left.evaluate() or self.right.evaluate()
        # Logical NOT
        elif token == TokenType.BANG or token == TokenType.NOT:
            return not self.left.evaluate()
        # If statement
        elif token == TokenType.IF:
            if self.condition.evaluate():
                return self.true_branch.evaluate()
            elif self.false_branch:
                return self.false_branch.evaluate()
        # Input statement
        elif token == TokenType.INPUT:
            user_input = input("Enter value: ")
            try:
                if '.' in user_input:
                    value = float(user_input)
                else:
                    value = int(user_input)
            except ValueError:
                value = user_input
            var_name = self.left.token.literal
            global_vars[var_name] = value
            return value
        # Ignore braces
        elif token == TokenType.LEFT_BRACE or token == TokenType.RIGHT_BRACE:
            return None
        # Error for unknown node
        else:
            raise ValueError(f"Cannot evaluate AST node with token type {self.token.type}")

# Node for if statements
class IfNode(ASTNode):
    def __init__(self, condition, true_branch, false_branch=None):
        super().__init__(Token(TokenType.IF, "?", None, 0))
        self.condition = condition
        self.true_branch = true_branch
        self.false_branch = false_branch

    def evaluate(self):
        if self.condition.evaluate():
            return self.true_branch.evaluate()
        elif self.false_branch:
            return self.false_branch.evaluate()

# Parse tokens into an AST
def analyse(tokens):
    try:
        # Parse a statement (assignment, display, if, input, or expression)
        def parse_statement():
            # Display statement
            if tokens and tokens[0].type == TokenType.DISPLAY:
                tokens.pop(0)
                expr = parse_expression()
                node = ASTNode(Token(TokenType.DISPLAY, "display", None, 1))
                node.left = expr
                return node
            # Assignment
            elif (len(tokens) >= 3 and tokens[0].type == TokenType.IDENTIFIER and
                  tokens[1].type == TokenType.EQUAL):
                var_token = tokens.pop(0)
                eq_token = tokens.pop(0)
                expr = parse_expression()
                node = ASTNode(eq_token)
                node.left = ASTNode(var_token)
                node.right = expr
                return node
            # If statement
            elif tokens and tokens[0].type == TokenType.IF:
                tokens.pop(0)
                condition = parse_expression()
                # Parse true branch
                true_branch = None
                if tokens and tokens[0].type == TokenType.LEFT_BRACE:
                    tokens.pop(0)
                    if tokens and tokens[0].type == TokenType.RIGHT_BRACE:
                        tokens.pop(0)
                        true_branch = ASTNode(Token(TokenType.LEFT_BRACE, "noop", None, 0))
                    else:
                        true_branch = parse_statement()
                        if not tokens or tokens[0].type != TokenType.RIGHT_BRACE:
                            raise ValueError("Expected '/.'")
                        tokens.pop(0)
                else:
                    true_branch = parse_statement()
                # Optional else branch
                false_branch = None
                if tokens and tokens[0].type == TokenType.ELSE:
                    tokens.pop(0)
                    if tokens and tokens[0].type == TokenType.LEFT_BRACE:
                        tokens.pop(0)
                        if tokens and tokens[0].type == TokenType.RIGHT_BRACE:
                            tokens.pop(0)
                            false_branch = ASTNode(Token(TokenType.LEFT_BRACE, "noop", None, 0))
                        else:
                            false_branch = parse_statement()
                            if not tokens or tokens[0].type != TokenType.RIGHT_BRACE:
                                raise ValueError("Expected '/.'")
                            tokens.pop(0)
                    else:
                        false_branch = parse_statement()
                return IfNode(condition, true_branch, false_branch)
            # Input statement
            elif tokens and tokens[0].type == TokenType.INPUT:
                tokens.pop(0)
                if not tokens or tokens[0].type != TokenType.LEFT_PAREN:
                    raise ValueError("Expected '(' after input")
                tokens.pop(0)
                var_token = tokens.pop(0)
                if tokens[0].type != TokenType.RIGHT_PAREN:
                    raise ValueError("Expected ')' after variable in input")
                tokens.pop(0)
                node = ASTNode(Token(TokenType.INPUT, "input", None, 0))
                node.left = ASTNode(var_token)
                return node
            # Braces
            elif tokens and tokens[0].type in {TokenType.LEFT_BRACE, TokenType.RIGHT_BRACE}:
                tokens.pop(0)
                return ASTNode(Token(TokenType.LEFT_BRACE, "brace", None, 0))
            # Otherwise, parse as expression
            else:
                return parse_expression()

        # Parse expressions with correct precedence
        def parse_expression(precedence=0):
            if not tokens:
                raise ValueError("Unexpected end of input")
            token = tokens.pop(0)
            # Unary minus
            if token.type == TokenType.MINUS:
                node = ASTNode(token)
                node.left = parse_expression(100)
                node.right = None
                left = node
            # Logical not
            elif token.type == TokenType.BANG or token.type == TokenType.NOT:
                node = ASTNode(token)
                node.left = parse_expression(100)
                left = node
            # Parentheses
            elif token.type == TokenType.LEFT_PAREN:
                left = parse_expression()
                if not tokens or tokens[0].type != TokenType.RIGHT_PAREN:
                    raise ValueError("Mismatched parentheses")
                tokens.pop(0)
            # Literal or identifier
            else:
                left = ASTNode(token)
            # Parse binary operators
            while tokens and precedence < get_precedence(tokens[0]):
                op = tokens.pop(0)
                node = ASTNode(op)
                node.left = left
                node.right = parse_expression(get_precedence(op))
                left = node
            return left

        # Operator precedence
        def get_precedence(token):
            if token.type in (TokenType.STAR, TokenType.SLASH):
                return 60
            if token.type in (TokenType.PLUS, TokenType.MINUS):
                return 50
            if token.type in (TokenType.LESS, TokenType.LESS_EQUAL, TokenType.GREATER, TokenType.GREATER_EQUAL):
                return 40
            if token.type in (TokenType.EQUAL_EQUAL, TokenType.BANG_EQUAL):
                return 30
            if token.type in (TokenType.AND,):
                return 20
            if token.type in (TokenType.OR,):
                return 10
            return 0

        if not tokens:
            raise ValueError("No tokens provided for analysis.")

        return parse_statement()
    except Exception as e:
        raise ValueError(f"Expression analysis failed: {e}")