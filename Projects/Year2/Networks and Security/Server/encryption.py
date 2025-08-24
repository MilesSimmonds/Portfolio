

class Diffie_Hellman:
    def __init__(self,prime,generator):
        self.prime = prime
        self.generator = generator

    def generate_shared(self, int):

        shared = self.prime ** int % self.generator
        return shared

    def calculate_key(self,shared, int):
        key = shared ** int % self.generator
        return key

class Encryption:
    def __init__(self, shift):
        self.alphabet = "abcdefghijklmnopqrstuvwxyz"
        self.digits = "0123456789"
        self.shift = shift

    def encrypt(self, text):
        encrypted_text = ""
        for char in text:
            if char.isalpha():
                if char.isupper():
                    index = (self.alphabet.index(char.lower()) + self.shift) % 26
                    encrypted_char = self.alphabet[index].upper()
                else:
                    index = (self.alphabet.index(char) + self.shift) % 26
                    encrypted_char = self.alphabet[index]
            elif char.isdigit():
                index = (self.digits.index(char) + self.shift) % 10
                encrypted_char = self.digits[index]
            else:
                encrypted_char = char
            encrypted_text += encrypted_char
        return encrypted_text

    def decrypt(self, text):
        decrypted_text = ""
        for char in text:
            if char.isalpha():
                if char.isupper():
                    index = (self.alphabet.index(char.lower()) - self.shift) % 26
                    decrypted_char = self.alphabet[index].upper()
                else:
                    index = (self.alphabet.index(char) - self.shift) % 26
                    decrypted_char = self.alphabet[index]
            elif char.isdigit():
                index = (self.digits.index(char) - self.shift) % 10
                decrypted_char = self.digits[index]
            else:
                decrypted_char = char
            decrypted_text += decrypted_char
        return decrypted_text