import socket
import  random
from encryption import Encryption,Diffie_Hellman

# Server configuration
#HOST = socket.gethostbyname(socket.gethostname())
#PORT = 12345

#instance of diffie-hellman
diffie = Diffie_Hellman(3, 17)
x = random.randint(1, 100)

def main():
    try:
        # Create client socket
        client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        client.connect((HOST, PORT))

        shared = diffie.generate_shared(x)
        client.send(str(shared).encode())

        shared_key = int(client.recv(1024).decode())
        key = diffie.calculate_key(shared_key, x)
        enc = Encryption(key)


        while True:

            # Receive and decrypt server messages
            encrypted_message = (client.recv(1024).decode())
            decrypted_message = enc.decrypt(encrypted_message)

            print(decrypted_message)

            # Check if the game is won or if the user wants to quit
            if "CONGRATULATIONS" in decrypted_message or "You left the game" in decrypted_message:
                break

            # Get user's input
            user_input = input("Message ¦ Type 'quit' to leave\nInput: ")

            client.send(enc.encrypt(user_input).encode())

    except (socket.error, ConnectionResetError, ConnectionAbortedError) as e:
        print(f"Error: {e}. The connection to the server was unexpectedly closed.")
    except KeyboardInterrupt:
        print("\nClient closing.")
    finally:
        client.close()

if __name__ == "__main__":
    HOST = input(" input server IP - (127.0.0.1 for local):\n")
    PORT = int(input(("input server port - (12345 recommended):\n")))
    main()
