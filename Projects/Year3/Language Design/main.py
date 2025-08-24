from token_converter import tokenise
from expression_analyser import analyse
from tokens import TokenType
import os

# Color codes for output
class Bcolors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

# Print the AST in a readable way
def print_ast(node, indent=""):
    if node is None:
        print(indent + "None")
        return

    # Print IF and WHILE nodes specially
    token = node.token
    label = token.text if token.text is not None else str(token.type)

    if hasattr(node, "condition"):
        if token.type == TokenType.IF:
            print(indent + "IF")
            print(indent + "├── CONDITION:")
            print_ast(node.condition, indent + "│   ")
            print(indent + "├── THEN:")
            print_ast(node.true_branch, indent + "│   ")
            print(indent + "└── ELSE:")
            print_ast(node.false_branch, indent + "    ")
        elif token.type == TokenType.WHILE:
            print(indent + "WHILE")
            print(indent + "├── CONDITION:")
            print_ast(node.condition, indent + "│   ")
            print(indent + "└── BODY:")
            print_ast(node.true_branch, indent + "    ")
    else:
        print(indent + f"{label}")
        if node.left or node.right:
            if node.left:
                print(indent + "├── left:")
                print_ast(node.left, indent + "│   ")
            if node.right:
                print(indent + "└── right:")
                print_ast(node.right, indent + "    ")

# Read and process each line from a source file
def readSourceFile(filepath):
    with open(filepath, "r") as file:
        lines = file.readlines()

    for line_number, line in enumerate(lines, start=1):
        line = line.strip()
        if not line:
            continue

        # Print comments in the file
        if line.startswith("["):
            print(Bcolors.HEADER + f"Comment: {line[1:-1]}" + Bcolors.ENDC)
            continue 

        # Split expected result and expression if present
        if ":=:" in line:
            expected, expression = line.split(":=:")
            expected = expected.strip()
            expression = expression.strip()
        else:
            expected = None
            expression = line

        print(Bcolors.BOLD + f"\nLine {line_number} > {expression}" + Bcolors.ENDC)

        try:
            # Tokenise the expression
            tokens = tokenise(expression)
            print(Bcolors.OKBLUE + f"TOKENS: {tokens}" + Bcolors.ENDC)

            # Parse tokens into an AST
            tree = analyse(tokens)
            print(Bcolors.OKCYAN + "AST:" + Bcolors.ENDC)
            print_ast(tree)

            # Evaluate the AST
            result = tree.evaluate()

            # Check result if expected value is given
            if expected is not None:
                if str(result) == expected:
                    print(Bcolors.OKGREEN + f"Success! --- Expected: {expected}" + Bcolors.ENDC)
                else:
                    print(Bcolors.FAIL + f"Failed --- Expected: {expected}, Got: {result}" + Bcolors.ENDC)
            else:
                print(Bcolors.BOLD + f"Result: {result}" + Bcolors.ENDC)

        except Exception as e:
            print(Bcolors.FAIL + f"Error on line {line_number}: {e}" + Bcolors.ENDC)

# Run the interpreter on the test file
if __name__ == '__main__':
    current_dir = os.path.dirname(__file__)
    test_file_path = os.path.join(current_dir, "test.src")
    readSourceFile(test_file_path)
