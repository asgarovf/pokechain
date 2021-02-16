import socket
import pyautogui
import threading

# Currently only plays the game from Twitch chat, we dont need that
# Instead get the info from the API

# credentials
SERVER = "irc.twitch.tv"
PORT = 6667
PASS = "oauth:4hl7eubwdid2lh7cuchht73vumapxd"
BOT = "TwitchPokeBot"
CHANNEL = "epixxar"
OWNER = "epixxar"

message = ""

irc = socket.socket()
irc.connect((SERVER, PORT))
irc.send(("PASS " + PASS + "\n" +
          "NICK " + BOT + "\n" +
          "JOIN #" + CHANNEL + "\n" ).encode()) 
          #twitch requires a bytes-like object, encode is used for that

BINDINGS = {
    'up': 'up',
    'down': 'down',
    'left': 'left',
    'right': 'right',
    'abut': 'x',
    'bbut': 'z',
    'ltrig': 'a',
    'rtrig': 's',
    'start': 'return',
    'select': 'backspace'
}

def game_control():
    global message
    while True:
        for key in BINDINGS:
            if message == key:
                print(f"Simulating ${BINDINGS[key]}")
                pyautogui.keyDown(BINDINGS[key])
                message = ''
                pyautogui.keyUp(BINDINGS[key])
            else:
                pass


def twitch():
    def join_chat():
        loading = True
        while loading:
            readbuffer_join = irc.recv(1024)
            readbuffer_join = readbuffer_join.decode()
            for line in readbuffer_join.split("\n")[0:-1]:
                print(line)
                loading = loading_complete(line)

    def loading_complete(line):
        if("End of /NAMES list" in line):
            print("Bot has joined " + CHANNEL + "'s channel")
            send_message(irc, "Joined to chat room")
            return False
        else:
            return True

    def send_message(irc, message):
        message_temp = "PRIVMSG #" + CHANNEL + " :" + message
        irc.send((message_temp + "\n").encode())

    def get_user(line):
        separate = line.split(":", 2)
        user = separate[1].split("!", 1)[0]
        return user

    def get_message(line):
        global message
        try:
            message = line.split(":", 2)[2]
        except:
            message = ""
        return message

    def console(line):
        if "PRIVMSG" in line:
            return False
        else:
            return True

    join_chat()

    while True:
        try:
            read_buffer = irc.recv(1024).decode()
        except:
            read_buffer = ""
        for line in read_buffer.split("\r\n"):
            if line == "":
                continue
            elif "PING" in line and console(line):
                msg = "PONG tmi.twitch.tv\r\n".encode()
                irc.send(msg)
                print(msg)
                continue
            else:
                user = get_user(line)
                message = get_message(line)
                print(user + ": "+ message)

if __name__ == "__main__":
    t1 = threading.Thread(target = twitch)
    t1.start()
    t2 = threading.Thread(target = game_control)
    t2.start()