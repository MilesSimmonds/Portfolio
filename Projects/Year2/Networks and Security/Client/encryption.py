

class Diffie_Hellman:
    def __init__(self, prime, generator):
        """
        Initializes the Diffie_Hellman object with prime and generator values.

        Parameters:
        - prime (int): A prime number used in the key exchange.
        - generator (int): A generator used in the key exchange.
        """
        self.prime = prime
        self.generator = generator

    def generate_shared(self, exponent):
        """
        Generates the shared key using the specified exponent.

        Parameters:
        - exponent (int): The exponent used in the key generation.

        Returns:
        - int: The generated shared key.
        """
        shared_key = self.prime ** exponent % self.generator
        return shared_key

    def calculate_key(self, shared, exponent):
        """
        Calculates the final key using the received shared key and the local exponent.

        Parameters:
        - shared (int): The received shared key.
        - exponent (int): The local exponent.

        Returns:
        - int: The calculated final key.
        """
        key = shared ** exponent % self.generator
        return key

class Encryption:
    def __init__(self, shift):
        """
        Initializes the Encryption object with a specified shift value.

        Parameters:
        - shift (int): The shift value used for encryption and decryption.
        """
        self.alphabet = "abcdefghijklmnopqrstuvwxyz"
        self.digits = "0123456789"
        self.shift = shift

    def encrypt(self, text):
        """
        Encrypts the given text using a simple substitution cipher.

        Parameters:
        - text (str): The text to be encrypted.

        Returns:
        - str: The encrypted text.
        """
        encrypted_text = ""
        for char in text:
            if char.isalpha():
                if char.isupper():
                    # Encrypt uppercase alphabetic characters
                    index = (self.alphabet.index(char.lower()) + self.shift) % 26
                    encrypted_char = self.alphabet[index].upper()
                else:
                    # Encrypt lowercase alphabetic characters
                    index = (self.alphabet.index(char) + self.shift) % 26
                    encrypted_char = self.alphabet[index]
            elif char.isdigit():
                # Encrypt digits
                index = (self.digits.index(char) + self.shift) % 10
                encrypted_char = self.digits[index]
            else:
                # Keep non-alphabetic and non-digit characters unchanged
                encrypted_char = char
            encrypted_text += encrypted_char
        return encrypted_text

    def decrypt(self, text):
        """
        Decrypts the given text that was encrypted using the same shift value.

        Parameters:
        - text (str): The text to be decrypted.

        Returns:
        - str: The decrypted text.
        """
        decrypted_text = ""
        for char in text:
            if char.isalpha():
                if char.isupper():
                    # Decrypt uppercase alphabetic characters
                    index = (self.alphabet.index(char.lower()) - self.shift) % 26
                    decrypted_char = self.alphabet[index].upper()
                else:
                    # Decrypt lowercase alphabetic characters
                    index = (self.alphabet.index(char) - self.shift) % 26
                    decrypted_char = self.alphabet[index]
            elif char.isdigit():
                # Decrypt digits
                index = (self.digits.index(char) - self.shift) % 10
                decrypted_char = self.digits[index]
            else:
                # Keep non-alphabetic and non-digit characters unchanged
                decrypted_char = char
            decrypted_text += decrypted_char
        return decrypted_text