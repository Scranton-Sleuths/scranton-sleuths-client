const readline = require('node:readline');
const { stdin: input, stdout: output } = require('node:process');
const Colyseus = require("colyseus.js");

class TextBasedClient {

    constructor(server) {
        this.name = null;
        this.client = new Colyseus.Client(server);

        // Join the lobby when you create a new client
        this.client.joinOrCreate("lobby").then(room => {
            console.log(room.sessionId, "joined", room.name);
            this.room = room;
        }).catch(e => {
            console.log("JOIN ERROR", e);
        });

        this.answer = null;
        this.ready = true;
        this.state = "input";
    }

    playGame() {
        // while (true) {
        //     switch(this.state) {
        //         case "input":
        //             console.log(this.waitForInput("helpme"));
        //         default:
        //             continue;
        //     }
        //     // if (this.ready) {
        //     //     this.ready = false;
                
        //     //     this.waitForInput(">>What should I do?  ", this.processInput);
        //     // //console.log(answer);
        //     // //this.processInput(answer);
        //     // }
        // }
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        const game = async() => {
            for await (const line of rl) {
                this.room.send("test", line); // This line requires that server handle messages of this type
            }
        }
        game();
    }

    processInput(input) {
        console.log("Processing " + input);
        switch(input) {
            case "join":
                this.client.joinOrCreate("my_room").then(room => {
                    console.log(room.sessionId, "joined", room.name);
                }).catch(e => {
                    console.log("JOIN ERROR", e);
                });
                //await new Promise(r => setTimeout(r, 2000));
                break;
            case "menu":
            case "help":
                console.log("join: join the server");
                break;
            case "quit":
                console.log("Goodbye.");
                return;
            default:
                console.log("I'm not sure what you mean. Type 'menu' to see your options.");
                break;
        }
        this.ready = true;
        //this.waitForInput(">>What should I do?  ", this.processInput);
    }

    waitForInput(question) {
        this.state="inputting";
        const rl = readline.createInterface({ input, output });
        var ans = "";
       // rl.setPrompt(question);
        //rl.prompt();
        rl.question(question, (answer) => {
            console.log(`received by the user: ${answer}`);
            ans = answer;
            rl.close();
        });
        rl.on('close', () => {
            return;
        });
        return ans;
    }

    waitForInput(question, callback) {
        const rl = readline.createInterface({ input, output });
        var ans = "";
        rl.setPrompt(question);
        rl.prompt();
        rl.on('line', (answer) => {
            console.log(`received by the user: ${answer}`);
            callback(answer);
            ans = answer;
            rl.close();
        });
        rl.on('close', () => {
            return callback(ans);
        });
    }

}

// const TextBasedClient = {
//     client: null,

//     waitForInput: function(question) {
//         console.log(question);
//         var ans = readline.readline();
//         return ans;
//     },
    
//     processInput: async function(input) {
//         console.log("Processing " + input);
//         switch(input) {
//             case "join":
//                 client.joinOrCreate("my_room").then(room => {
//                     console.log(room.sessionId, "joined", room.name);
//                 }).catch(e => {
//                     console.log("JOIN ERROR", e);
//                 });
//                 await new Promise(r => setTimeout(r, 2000));
//                 break;
//             case "menu":
//             case "help":
//                 console.log("join: join the server");
//                 break;
//             case "quit":
//                 console.log("Goodbye.");
//                 return;
//             default:
//                 console.log("I'm not sure what you mean. Type 'menu' to see your options.");
//                 break;
//         }
//         this.processInput(this.waitForInput(">>What should I do?  "));
//     }
    
//     // getUserId: function() {
//     //     if (!this.has("name")) {
//     //         this.name = this.waitForInput("What is your name? ");
//     //     }
//     //     return this.name;
//     // }
// }

module.exports = TextBasedClient;


