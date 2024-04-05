import Phaser from "phaser";
import { Room, Client } from "colyseus.js";

//const SERVER_URL = 'ws://scranton-sleuths-server-99a94c66225e.herokuapp.com/';
const SERVER_URL = 'ws://localhost:3000';

export class Game extends Phaser.Scene {

    playerEntities = {};
    
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

        const startButton = this.add.text(100, 100, 'Start Game', { fill: '#0f0' });
        startButton.setInteractive();
        startButton.on('pointerdown', () => {
            console.log('Starting game with ' + this.room.state.clientPlayers.size + ' players!');
            this.room.send("startGame", 2);
            startButton.removeFromDisplayList();
        });

        this.room.state.clientPlayers.onAdd((player, sessionId) => {
            // let playerImage = blah
            // Will also need to set the starting x/y cooridates
            const entity = this.physics.add.image(300, 300, 'cat'); // The image loaded will have to be based on whatever the server says for the player
            this.playerEntities[sessionId] = entity;

            // listening for server updates
            player.onChange(() => {
                // This is where we will update player location
                // TODO: write a function that moves the player's sprite to the room (i.e., setting the x/y of the player to that of the room)
                // Then it will be:
                // entity.x = roomX;
                // entity.y = roomY;
                
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