#import statements
import socket
import threading
import random
from encryption import Encryption,Diffie_Hellman

# Define states
MENU_STATE = 1
GAME_STATE = 2

# Dictionary to store the state for each client
client_states = {}

# Generate a random number for the game
secret_number = random.randint(1, 10)

# Lock for thread safety
lock = threading.Lock()

# Counter for the number of games
games_counter = 0

#instance of diffie-hellman key exchange
diffie = Diffie_Hellman(3, 17)
x = random.randint(1, 100)


def display_menu(client_socket,key):
    enc = Encryption(key)
    client_socket.send(enc.encrypt("1. Play Game\n2. Quit\n").encode())


def handle_client(client_socket):
    global games_counter

    try:

        # Initial state for each client is set to MENU_STATE
        client_states[client_socket] = MENU_STATE

        # Perform Diffie-Hellman key exchange
        shared_key = diffie.generate_shared(x)
        #send server half of key
        client_socket.send(str(shared_key).encode())
        #recieve client half of key
        client_shared_key = int(client_socket.recv(1024).decode())
        #calculate shared key using both halves
        key = diffie.calculate_key(client_shared_key, x)
        #encryption instance for client
        enc = Encryption(key)

       #while connected run
        while True:
            #set the current state
            current_state = client_states[client_socket]

            if current_state == MENU_STATE:
                display_menu(client_socket, key)
                user_input = enc.decrypt(client_socket.recv(1024).decode())

                if user_input == "1":
                    with lock:
                        current_state = GAME_STATE
                        client_states[client_socket] = current_state
                    client_socket.send(enc.encrypt("\nSwitching to Game State...\n\nNUMBER GUESSING GAME\nGuess a number Between 1 & 10:\n").encode())
                    games_counter += 1
                elif user_input == "2":
                    client_socket.send(enc.encrypt("\nGoodbye! You left the game.\n").encode())
                    break
                else:
                    client_socket.send(enc.encrypt("\nInvalid choice. Please enter 1 to play or 2 to quit.\n").encode())

            elif current_state == GAME_STATE:
                # Receive the user's input
                user_input = enc.decrypt(client_socket.recv(1024).decode())
                print(user_input)

                # Check if the user wants to quit
                if user_input.lower() == "quit":
                    client_socket.send(enc.encrypt("\nGoodbye! You left the game. ").encode())
                    break

                # Check if the input is a valid number
                if not user_input.isdigit():
                    client_socket.send(enc.encrypt("\nInvalid input. Please enter a number or type 'quit' to leave.\n").encode())
                    continue

                guess = int(user_input)

                # Check the user's guess
                with lock:
                    if guess == secret_number:
                        client_socket.send(enc.encrypt("\n**CONGRATULATIONS! You guessed the correct number!**\n\nLEAVING SERVER\n").encode())
                        break
                    elif guess < secret_number:
                        client_socket.send(enc.encrypt("\nToo low! Try again.\n").encode())
                    else:
                        client_socket.send(enc.encrypt("\nToo high! Try again.\n").encode())

    except Exception as e_inner:
        print(f"[EXCEPTION] An error occurred with {client_socket}: {e_inner}")

    finally:
        with lock:
            games_counter -= 1
            if games_counter <= 0:
                games_counter = 0
            print(f"\n{client_socket} has left the server.\n\n")
            del client_states[client_socket]  # Remove the client's state
            print(f"Currently playing {games_counter} games.\n")

        # Close the connection
        client_socket.close()

def main():
    # Create server socket
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.bind((HOST, PORT))
    server.listen()

    print(f"Server listening on {HOST}:{PORT}")

    try:
        while True:
            # Accept incoming connections
            client, address = server.accept()
            print(f"Accepted connection from {address}")

            # Start a new thread to handle the client
            client_thread = threading.Thread(target=handle_client, args=(client,))
            client_thread.start()

    except KeyboardInterrupt:
        print("Server shutting down.")
        server.close()

if __name__ == "__main__":
    HOST = input(" input server IP - (127.0.0.1 for local):\n")
    PORT = int(input(("input server port - (12345 recommended):\n")))
    main()
