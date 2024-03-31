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
        this.load.image("cat", "./imgs/cat.png") // why no work

        // https://stackoverflow.com/questions/58124236/add-sprite-in-function-in-phaser-3
        // Maybe we can use sprites?
        // We could set the background image of the scene to the board, and then add sprites for each room and character
        // That way, we can easily set onclick (pointerdown) methods for each room/character
    }

    update() {
        
    }

    async connect() {
        // TODO: Join game room
        this.room = null;
    }

    async create() {
        console.log('Starting');
        await this.connect();
        // Receive updates from server
        this.room.state.clientPlayers.onAdd((player, sessionId) => {
            const entity = this.physics.add.image(player.x, player.y, 'cat'); // The image loaded will have to be based on whatever the server says for the player
            this.playerEntities[sessionId] = entity;

            // listening for server updates
            player.onChange(() => {
                // This is where we will update player location
                /**
                 * entity.x = player.x
                 * That is just an example. We will have to figure out how we store positions
                 */
                
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