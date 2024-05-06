import Phaser from "phaser";
import { Room, Client } from "colyseus.js";

//const SERVER_URL = 'ws://scranton-sleuths-server-99a94c66225e.herokuapp.com/';
const SERVER_URL = 'ws://localhost:3000';
export class Lobby extends Phaser.Scene {

    playerEntities = {};
    room;
    test;
    numPlayers = 0;
    
    constructor() {
        super({key: 'lobby'});
    }

    init() {
        
    }

    preload() {
        this.load.html("form");
        this.load.image('cat', require('../assets/cat.png'));
        this.load.image('Join Game', require('../assets/buttons/joingame.png'));
        this.load.image('Logo', require('../assets/scranton-sleuths.png'));
    }

    update() {
        
    }

    async create() {
        this.test = this.add.text(100, 200, `Players in lobby: 0`, { fill: '#0f0' });
        console.log('Starting');
        
        // Connect to the lobby
        await this.connect();

        // display logo
        this.add.image(600, 100, 'Logo');

        // hide input form
        const hiddenForm = this.add.dom(100, 550, "#myForm");
        hiddenForm.setVisible(false);

        // Respond to player clicking buttons
        
        const joinButton = this.add.image(600, 500, 'Join Game');
        joinButton.setScale(0.75);
        joinButton.setInteractive();
        joinButton.on('pointerdown', () => {
            console.log('Joining game');
            this.game.scene.switch("lobby", "game");
            // The code to switch to the server game room will be in the Game.js file/scene
        });

        /**
         * This is an example of how the game is going to work.
         * There will be a background image of the board, but the rooms/hallways will be images overlayed on top so we can register when people click on them
         * This is MUCH EASIER than trying to process what room was clicked based on the mouse x/y coordiates
         * The locations will be pre-loaded in their correct locations
         * When a player clicks on a room, a message is sent to the server saying what room was clicked
         * The server receives that, along with who sent it
         * The server can then process if it is a valid move, etc
         * The client doesn't do ANY game logic. It only visualizes the game state
         */

        // We can add a bunch of cats at once
        let cats = [];
        for (let index = 0; index < 5; index++) {
            cats[index] = this.add.image(100 + (index*100), 300, 'cat');
            cats[index].setScale(.2);
            cats[index].setInteractive();
            cats[index].on('pointerdown', () => {
                console.log('Meow', index);
            });
        }
        // Or one at a time
        const catImg = this.add.image(100, 400, 'cat');
        catImg.setScale(.2)
        catImg.setInteractive();
        catImg.on('pointerdown', () => {
            console.log('Meow')
        });


        this.room.state.clientPlayers.onAdd((player, sessionId) => {
            this.test.text = `Players in lobby: ${this.room.state.numPlayers}`;
            this.playerEntities[sessionId] = player.test;
            console.log(player.test);
            this.numPlayers++;
        });

        // remove local reference when entity is removed from the server
        this.room.state.clientPlayers.onRemove((player, sessionId) => {
            this.test.text = `Players in lobby: ${this.room.state.numPlayers}`;
            const entity = this.playerEntities[sessionId];
            if (entity) {
                delete this.playerEntities[sessionId]
                this.numPlayers--;
            }
        });

    }

    async connect () {
        // add connection status text
        const connectionStatusText = this.add
            .text(0, 0, "Trying to connect with the server...")
            .setStyle({ color: "#ff0000" })
            .setPadding(4)

        const client = new Client(SERVER_URL);

        try {
            this.room = await client.joinOrCreate("lobby");
            // connection successful!
            connectionStatusText.destroy();

        } catch (e) {
            // couldn't connect
            console.log('Error connecting to lobby.');
        }
    }

    test() {
        console.log('hello');
    }

}