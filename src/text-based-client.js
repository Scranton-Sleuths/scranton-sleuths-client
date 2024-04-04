const readline = require('node:readline');
const { stdin: input, stdout: output } = require('node:process');
const Colyseus = require("colyseus.js");

class TextBasedClient {

    constructor(server) {
        this.name = null;
        this.client = new Colyseus.Client(server);
        this.room = null;
        this.answer = null;
        this.ready = true;
        this.state = "input";
    }

    playGame() {

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        const game = async() => {
            if (this.state=="input")
                console.log("What do you wish to do? Enter 'join' to join the lobby.");

            for await (const line of rl) {
                this.processInput(line);

                if (this.state=="quit") 
                    break;
                if (this.state=="input")
                    console.log("What do you wish to do?");
            }
        }
        game();
    }

    processInput(input) {

        switch(this.state) {
            case "input":
                switch(input) {
                    case "join":
                        this.state="join";
                        this.client.joinOrCreate("lobby").then(room => {
                            console.log(room.sessionId, "joined", room.name);
                            this.room = room;
                            this.room.onMessage("test", (message) => {
                                console.log(`Test message received from server: ${message}`);
                            });
                            this.room.onMessage("switchRoom", (message) => {
                                console.log(`Starting the Game!`);
                                this.client.joinOrCreate(message.room, {num_players: message.num_players});
                            });
                        }).catch(e => {
                            console.log("JOIN ERROR", e);
                        });
                        //await new Promise(r => setTimeout(r, 2000));
                        this.state="input";
                        break;
                    case "message":
                        if (this.room == null) {
                            console.log("Uh oh! You aren't connected to the server. Choose 'join' to connect.");
                            this.state="input";
                        }
                        else { 
                            console.log("What message do you wish to send?");
                            this.state="message";
                        }
                        break;
                    case "menu":
                    case "help":
                        this.printMenu();
                        this.state="input";
                        break;
                    case "quit":
                        console.log("Goodbye.");
                        this.state="quit";
                        return;
                    case "start":
                        this.room.send("start"); // This line requires that server handle messages of this type
                        // May want to change this to state 'awaiting server' or some such to indicate we should wait for server feedback
                        this.state="input";
                        break;
                    default:
                        console.log("I'm not sure what you mean. Type 'menu' to see your options.");
                        this.state="input";
                        break;
                }           
                break;
            case "message":
                this.room.send("test", input); // This line requires that server handle messages of this type
                this.state="input";
                break;
            default:
                console.log("Invalid state. Going back to input.", this.state);
                this.state="input";
                break;

        }
    }

    printMenu() {
        console.log("join: join the server");
        console.log("help: print the help menu");
        console.log("quit: quit the game");
        console.log("message: send message to the server");
        console.log("start: start the game of Clue");
    }

}

module.exports = TextBasedClient;


