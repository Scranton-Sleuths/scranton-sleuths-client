import Phaser from "phaser";
import { Room, Client } from "colyseus.js";

//const SERVER_URL = 'ws://scranton-sleuths-server-99a94c66225e.herokuapp.com/';
const SERVER_URL = 'ws://localhost:3000';

export class Game extends Phaser.Scene {

    playerEntities = {};
    locations = [];
    selectedPerson = null;
    selectedPlace = null;
    selectedWeapon = null;
    myturn = false;
    gameStatusMessage = null;
    myname = "";
    sideways_halls = ["Conference Room_Michael's Office", "Michael's Office_Bathroom",
    "Kitchen_Break Room", "Break Room_Warehouse",
    "Annex_Reception", "Reception_Jim's Office"];
    selectedCard = "";
    suggestion = null;
    
    constructor() {
        super({key: 'game'});
    }

    init() {

    }

    preload() {
        // Load in images
        this.load.image('cat', require('../assets/cat.png'));
        // Room images
        this.load.image('Conference Room', require('../assets/rooms/ConferenceRoom.png'));
        this.load.image("Michael's Office", require('../assets/rooms/MichaelOffice.png'));
        this.load.image('Bathroom', require('../assets/rooms/Bathroom.png'));
        this.load.image('Kitchen', require('../assets/rooms/Kitchen.png'));
        this.load.image('Break Room', require('../assets/rooms/BreakRoom.png'));
        this.load.image('Warehouse', require('../assets/rooms/Warehouse2.png'));
        this.load.image('Annex', require('../assets/rooms/Annex.png'));
        this.load.image('Reception', require('../assets/rooms/Reception.png'));
        this.load.image("Jim's Office", require('../assets/rooms/JimOffice.png'));
        this.load.image('Hallway', require('../assets/rooms/hallway2.png'));
        // Character Images
        this.load.image('Characters', require('../assets/characters/Chars.png'));
        this.load.image('Michael Scott', require('../assets/characters/Michael.png'));
        this.load.image('Dwight Schrutte', require('../assets/characters/Dwight.png'));
        this.load.image('Jim Halpert', require('../assets/characters/Jim.png'));
        this.load.image('Pam Beesly', require('../assets/characters/Pam.png'));
        this.load.image('Angela Martin', require('../assets/characters/Angela.png'));
        this.load.image('Andy Bernard', require('../assets/characters/Andy.png'));
        // Button Images
        this.load.image('Start Game', require('../assets/buttons/startgame.png'));
        this.load.image('End Turn', require('../assets/buttons/endturn.png'));
        this.load.image('Suggestion Btn', require('../assets/buttons/suggestionbtn.png'));
        this.load.image('Accusation Btn', require('../assets/buttons/accusationbtn.png'));
        this.load.image('Respond Btn', require('../assets/buttons/respondbtn.png'));
        this.load.image('Game Over', require('../assets/buttons/gameover.png'));
        this.load.image('New Game', require('../assets/buttons/newgame.png'));
        // Card Images
        this.load.image('Your Cards', require('../assets/cards/yourcards.png'));
        this.load.image('Conference Room Card', require('../assets/cards/ConferenceRoom.png'));
        this.load.image("Michael's Office Card", require('../assets/cards/MichaelsOffice.png'));
        this.load.image('Bathroom Card', require('../assets/cards/Bathroom.png'));
        this.load.image('Kitchen Card', require('../assets/cards/Kitchen.png'));
        this.load.image('Break Room Card', require('../assets/cards/BreakRoom.png'));
        this.load.image('Warehouse Card', require('../assets/cards/Warehouse.png'));
        this.load.image('Annex Card', require('../assets/cards/Annex.png'));
        this.load.image('Reception Card', require('../assets/cards/Reception.png'));
        this.load.image("Jim's Office Card", require('../assets/cards/JimsOffice.png'));
        this.load.image('Michael Scott Card', require('../assets/cards/MichaelScott.png'));
        this.load.image('Dwight Schrutte Card', require('../assets/cards/DwightSchrute.png'));
        this.load.image('Jim Halpert Card', require('../assets/cards/JimHalpert.png'));
        this.load.image('Pam Beesly Card', require('../assets/cards/PamBeesly.png'));
        this.load.image('Angela Martin Card', require('../assets/cards/AngelaMartin.png'));
        this.load.image('Andy Bernard Card', require('../assets/cards/AndyBernard.png'));
        this.load.image('Stapler Card', require('../assets/cards/Stapler.png'));
        this.load.image('Scissors Card', require('../assets/cards/Scissors.png'));
        this.load.image('Calculator Card', require('../assets/cards/Calculator.png'));
        this.load.image('Pencil Card', require('../assets/cards/Pencil.png'));
        this.load.image("Dwight's Nunchucks Card", require('../assets/cards/Nunchucks.png'));
        this.load.image('Mug Card', require('../assets/cards/Mug.png'));        
        this.load.image('None Card', require('../assets/cards/None.png'));
        this.load.image('Selected Card', require('../assets/cards/selected.png'));
    }

    update() {
        
    }

    drawBoard() {
        console.log('drawing board!!')
        console.log(this.room.state.board.size);
        this.room.state.board.forEach((value, key) => {
            // For now, just add text instead of image
            let temp;
            if (value.type == "room") {
                temp = this.add.image(value.x, value.y, value.name);
                temp.setDepth(0.1);
                temp.setInteractive();
                temp.on('pointerdown', () => {
                    console.log("Location:", value.name, "Type:", value.type);
                    this.room.send("move", value.name);
                });
                this.locations.push(temp);
            }
            else if (value.type == "hallway") {
                temp = this.add.image(value.x, value.y, "Hallway");
                temp.setScale(0.9);
                temp.setDepth(0);
                if (this.sideways_halls.includes(value.name)) {
                    temp.setAngle(90);
                }
                temp.setInteractive();
                temp.on('pointerdown', () => {
                    console.log("Location:", value.name, "Type:", value.type);
                    this.room.send("move", value.name);
                });
                this.locations.push(temp);
            }
        });
        let characters = this.add.image(500, 850, 'Characters');
        characters.setScale(.5);
        this.myname = this.room.state.clientPlayers.get(this.room.sessionId).name;
        let message = `Welcome! You are ${this.myname}. `;
        if (this.myturn) {
            message = message + `It's your turn!`;
        }
        this.gameStatusMessage.setText(message);
    }

    async connect() {
        // add connection status text
        const connectionStatusText = this.add
            .text(0, 0, "Trying to connect with the server...")
            .setStyle({ color: "#ff0000" })
            .setPadding(4)

        const client = new Client(SERVER_URL);

        try {
            this.room = await client.joinOrCreate("game");
            // connection successful!
            connectionStatusText.destroy();

        } catch (e) {
            // couldn't connect
            console.log('Error connecting to game.');
        }
    }

    async create() {
        console.log('Starting');
        await this.connect();
        // Receive updates from server
        // onAdd may not work as we intend. Might be better if we loop through clientPlayers instead (once they've all been added). Can try what we have now first though

        // TODO: this message should be updated to reflect the current player's turn,
        // as well as any suggestions, accusations that get made
        this.gameStatusMessage = this.add.text(0, 0, "");
        const gameOverButton = this.add.image(750, 20, "New Game");

        gameOverButton.setScale(0.75);
        gameOverButton.setVisible(false);
        gameOverButton.setInteractive();
        gameOverButton.on('pointerdown', () => {
            gameOverButton.setVisible(false);
            this.gameStatusMessage.setText("");
            
            this.room.send("resetGame","");

        });
        const endTurnButton = this.add.image(950, 700, "End Turn");
        endTurnButton.setScale(0.75);
        endTurnButton.setVisible(false);
        endTurnButton.setInteractive();
        endTurnButton.on('pointerdown', () => {
            this.room.send("endTurn", "");
        });

        const personOption = this.add.dom(200, 700, "#optPerson");
        personOption.setVisible(false);
        personOption.addListener('change');
        personOption.on('change', (event) => {
            this.selectedPerson = event.target.value;
        });
        
        const placeOption = this.add.dom(450, 700, "#optPlace");
        placeOption.setVisible(false);
        placeOption.addListener('change');
        placeOption.on('change', (event) => {
            this.selectedPlace = event.target.value;
        });
        
        const weaponOption = this.add.dom(700, 700, "#optWeapon");
        weaponOption.setVisible(false);
        weaponOption.addListener('change');
        weaponOption.on('change', (event) => {
            this.selectedWeapon = event.target.value;
        });
   
        const suggestionBtn = this.add.image(300, 625, 'Suggestion Btn');
        suggestionBtn.setScale(0.75);
        suggestionBtn.setInteractive();
        suggestionBtn.setVisible(false);
        suggestionBtn.on('pointerdown', () => {
            let suggestionMes = {
                accuser: this.myname,
                person: this.selectedPerson,
                place: this.selectedPlace,
                weapon: this.selectedWeapon
            };
            this.room.send("suggestion", suggestionMes);
        });

        const accusationBtn = this.add.image(600, 625, 'Accusation Btn');
        accusationBtn.setScale(0.75);
        accusationBtn.setInteractive();
        accusationBtn.setVisible(false);
        accusationBtn.on('pointerdown', () => {
            let accusationMessage = {
                person: this.selectedPerson,
                place: this.selectedPlace,
                weapon: this.selectedWeapon
            };
            this.room.send("accusation", accusationMessage);
        });

        let noneCard = null;
        const respondBtn = this.add.image(900, 625, 'Respond Btn');
        respondBtn.setScale(0.75);
        respondBtn.setInteractive();
        respondBtn.setVisible(false);
        respondBtn.on('pointerdown', () => {
            let responseMes = {
                card: this.selectedCard,
                sug: this.suggestion
            };
            this.room.send("response", responseMes);
            respondBtn.setVisible(false);
            noneCard.setVisible(false);
        });
        
        const startButton = this.add.image(600, 500, 'Start Game');
        startButton.setScale(0.75);
        startButton.setInteractive();
        startButton.on('pointerdown', () => {
            console.log('Starting game with ' + this.room.state.clientPlayers.size + ' players!');
            this.room.send("startGame", this.room.state.clientPlayers.size);
        });

        const selectedCircle = this.add.image(0, 0, 'Selected Card');
        selectedCircle.setScale(0.5);
        selectedCircle.setVisible(false);
        selectedCircle.setDepth(1);

        this.room.onMessage("dealCards", (message) => {
            let card_header = this.add.image(1020, 25, "Your Cards");
            card_header.setScale(0.7);
            var cards_json = JSON.parse(message);
            cards_json[Object.keys(cards_json).length] = "None";
            let i = 0;
            for(var key in cards_json) {
                let x = 900 + 85 * (i % 4); // x
                let y = 100 + 110 * Math.floor(i / 4); // y
                let card_name = cards_json[key];
                var card_img = 
                    this.add.image(x, y, card_name + " Card");
                card_img.setScale(0.6);
                card_img.setInteractive();
                card_img.setDepth(0);
                card_img.on('pointerdown', () => {
                    this.selectedCard = card_name;
                    selectedCircle.setX(x);
                    selectedCircle.setY(y);
                    selectedCircle.setVisible(true);
                });
                if (card_name == "None") {
                    noneCard = card_img;
                    noneCard.setVisible(false);
                }
                i++;
            }
        });

        this.room.onMessage("reset", (message) => {
            console.log("Resetting!");
            gameOverButton.setVisible(false);
            accusationBtn.setVisible(true);
            suggestionBtn.setVisible(true);
            this.cards.destroy();
        });
                
        this.room.onMessage("drawboard", (client, message) => {
            this.drawBoard();// This method will create all of the images for the board
            startButton.removeFromDisplayList();
            
            accusationBtn.setVisible(true);
            suggestionBtn.setVisible(true);
            personOption.setVisible(true);
            placeOption.setVisible(true);
            weaponOption.setVisible(true);
        });

        this.room.onMessage("newTurn", (message) => {
            if (message.id == this.room.sessionId) {
                // it's your turn!
                this.myturn = true;
                this.gameStatusMessage.setText("It's your turn!");
                endTurnButton.setVisible(true);
            }
            else {
                const turnName = message.name;
                this.myturn = false;
                this.gameStatusMessage.setText("It's " + turnName + "'s turn!");
                endTurnButton.setVisible(false);
            }
        });

        
        this.room.onMessage("illegalAction", (message) => {
            // update the game status message if the server
            // rejects a certain action
            this.gameStatusMessage.setText(message);
        });
        
        this.room.onMessage("illegalResponse", (message) => {
            // update the game status message if the server
            // rejects a certain action
            this.gameStatusMessage.setText(message);
            respondBtn.setVisible(true);
            noneCard.setVisible(true);
        });

        this.room.onMessage("correctAccusation", (message) => {
            if (this.room.sessionId == message.id) {
                this.gameStatusMessage.setText("Your accusation is correct! Congratulations, you win!");
            }
            else {
                this.gameStatusMessage.setText(
`${message.accuser} solved the case! The answer was:
Person: ${message.person}, Place: ${message.place}, Weapon: ${message.weapon} 
The game is now over. 
Click the button to exit to the lobby and begin again!`
                );
            }
            gameOverButton.setVisible(true);
        });

        this.room.onMessage("wrongAccusation", (message) => {
            this.gameStatusMessage.setText(
`Incorrect! The answer was:
Person: ${message.person}, Place: ${message.place}, Weapon: ${message.weapon} 
You have been eliminated from the game. 
Continue to Respond to Suggestions until the game is over.`);
            accusationBtn.setVisible(false);
            suggestionBtn.setVisible(false);
        });

        this.room.onMessage("playerOut", (message) => {
            this.gameStatusMessage.setText(
`Oh no! ${message} made an incorrect accusation!
They are no longer able to move or make suggestions, 
but will continue to respond to suggestions.`);
        });

        this.room.onMessage("gameOver", (message) => {
            this.gameStatusMessage.setText(
`Rats! All players have guessed incorrectly. The answer was:
Person: ${message.person}, Place: ${message.place}, Weapon: ${message.weapon} 
The game is now over. Click to start a new game.`);
            gameOverButton.setVisible(true);
        });

        this.room.onMessage("suggestionMade", (message) => {
            this.gameStatusMessage.setText(`${message.accuser} has made a suggestion!
            Person: ${message.person}, Place: ${message.place}, Weapon: ${message.weapon}`);
            this.suggestion = message;
            //respondBtn.setVisible(true)
        });

        this.room.onMessage("respondToSuggestion", (message) => {
            this.gameStatusMessage.setText(`${message.accuser} has made a suggestion! Can you respond?
            Person: ${message.person}, Place: ${message.place}, Weapon: ${message.weapon}`);
            this.suggestion = message;
            respondBtn.setVisible(true);
            noneCard.setVisible(true);
        });
        
        this.room.onMessage("respondMessageValid", (message) => {

            if (message.id == this.room.sessionId) {
                this.gameStatusMessage.setText(`${message.name} has responded to your suggestion!
                The card is: ${message.card}`)
            }
            else {
                this.gameStatusMessage.setText(`${message.name} has responded to the suggestion!`)
            }
            respondBtn.setVisible(false);
            noneCard.setVisible(false);
        });

        this.room.onMessage("respondMessageInvalid", (message) => { 
            this.gameStatusMessage.setText(`${message.name} cannot respond to the suggestion!`);
            respondBtn.setVisible(false);
            noneCard.setVisible(false);
        });
        
        this.room.onMessage("noResponses", (message) => { 
            this.gameStatusMessage.setText(`There are no responses to the suggestion!`);
            respondBtn.setVisible(false);
            noneCard.setVisible(false);
        })


        this.room.state.clientPlayers.onAdd((player, sessionId) => {
            // let playerImage = blah
            // Will also need to set the starting x/y cooridates

            // When the player joins, they will be put into the correct position. This will happen before the board is loaded, thats okay
            //const entity = this.physics.add.image(300, 300, 'cat'); // The image loaded and x/y will have to be based on whatever the server says for the player

            // Add images for the players
            const entity = this.add.image(player.startX, player.startY, player.name);
            entity.setScale(.3);
            entity.setDepth(1);
            this.playerEntities[sessionId] = entity;

            // listening for server updates
            player.onChange(() => {
                // This is where we will update player location
                // TODO: write a function that moves the player's sprite to the room (i.e., setting the x/y of the player to that of the room)
                // Then it will be:
                // entity.x = roomX;
                // entity.y = roomY;
                console.log(player.name, "player updated! New location:", player.currentLocation); // Example of it working
                let curRoom = this.room.state.board.get(player.currentLocation);
                let newX = curRoom.x;
                let newY = curRoom.y - 10;
                entity.x = newX;
                entity.y = newY;
            });
        });

        // remove local reference when entity is removed from the server
        this.room.state.clientPlayers.onRemove((player, sessionId) => {
            const entity = this.playerEntities[sessionId];
            if (entity) {
                delete this.playerEntities[sessionId]
            }
        });

        // Here, we would also define any functions that respond to player input (ex, clicking on the board)
        // Similar to the "Join Game" button on Lobby scene

    } // end create()

}