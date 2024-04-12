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
    
    constructor() {
        super({key: 'game'});
    }

    init() {

    }

    preload() {
        // Load in images
        this.load.image('cat', require('../assets/cat.png'));
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
                temp = this.add.text(value.x, value.y, value.name);
            }
            else {
                temp = this.add.text(value.x, value.y, "| |");
            }
            temp.setInteractive();
            temp.on('pointerdown', () => {
                console.log("Location:", value.name, "Type:", value.type);
                this.room.send("move", value.name);
            });
            this.locations.push(temp);
            
        });
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
        const gameStatusMessage = this.add.text(0, 0, "");
        const gameOverButton = this.add.text(550, 10, "Game Over");
        gameOverButton.setVisible(false);
        gameOverButton.setInteractive();
        gameOverButton.on('pointerdown', () => {
            gameOverButton.setVisible(false);
            gameStatusMessage.setText("");
            this.game.scene.switch("game", "lobby");
        });

        const personOption = this.add.dom(100, 550, "#optPerson");
        personOption.setVisible(false);
        personOption.addListener('change');
        personOption.on('change', (event) => {
            this.selectedPerson = event.target.value;
        });
        
        const placeOption = this.add.dom(300, 550, "#optPlace");
        placeOption.setVisible(false);
        placeOption.addListener('change');
        placeOption.on('change', (event) => {
            this.selectedPlace = event.target.value;
        });
        
        const weaponOption = this.add.dom(500, 550, "#optWeapon");
        weaponOption.setVisible(false);
        weaponOption.addListener('change');
        weaponOption.on('change', (event) => {
            this.selectedWeapon = event.target.value;
        });
        
        const accusationBtn = this.add.text(100, 500, 'Make an Accusation', { fill: '#0f0' });
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

        const startButton = this.add.text(100, 100, 'Start Game', { fill: '#0f0' });
        startButton.setInteractive();
        startButton.on('pointerdown', () => {
            console.log('Starting game with ' + this.room.state.clientPlayers.size + ' players!');
            this.room.send("startGame", this.room.state.clientPlayers.size);
            this.drawBoard(); // This method will create all of the images for the board
            startButton.removeFromDisplayList();

            accusationBtn.setVisible(true);
            personOption.setVisible(true);
            placeOption.setVisible(true);
            weaponOption.setVisible(true);
        });

                
        this.room.onMessage("drawboard", (client, message) => {
            this.drawBoard();
            startButton.removeFromDisplayList();
        });

        this.room.onMessage("correctAccusation", (message) => {
            gameStatusMessage.setText("Your accusation is correct! Congratulations, you win!");
            gameOverButton.setVisible(true);
        });

        this.room.onMessage("wrongAccusation", (message) => {
            gameStatusMessage.setText(
`Incorrect! The answer was:
Person: ${message.person}, Place: ${message.place}, Weapon: ${message.weapon} 
You have been eliminated from the game. 
Continue to Respond to Suggestions until the game is over.`);
            accusationBtn.setVisible(false);
        });

        this.room.state.clientPlayers.onAdd((player, sessionId) => {
            // let playerImage = blah
            // Will also need to set the starting x/y cooridates

            // When the player joins, they will be put into the correct position. This will happen before the board is loaded, thats okay
            //const entity = this.physics.add.image(300, 300, 'cat'); // The image loaded and x/y will have to be based on whatever the server says for the player

            // For now, just add text for the players
            const entity = this.add.text(player.startX, player.startY, player.name, { fill: '#0f0' });
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

    }

}