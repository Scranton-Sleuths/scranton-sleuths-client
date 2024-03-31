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
    }

    update() {
        
    }

    async create() {
        this.test = this.add.text(100, 200, `Players in lobby: 0`, { fill: '#0f0' });
        console.log('Starting');
        
        // Connect to the lobby
        await this.connect();


        // Respond to player clicking buttons
        
        const joinButton = this.add.text(100, 100, 'Join Game', { fill: '#0f0' });
        joinButton.setInteractive();
        joinButton.on('pointerdown', () => {
            console.log('Joining game')
            this.game.scene.switch("lobby", "game");
            // The code to switch to the server game room will be in the Game.js file/scene
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