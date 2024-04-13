const Colyseus = require("colyseus.js");
const Phaser = require("phaser");
var MultiClientTest = require("./multi-client-test");
var TextBasedClient = require("./text-based-client");
import { Lobby } from "./scenes/Lobby";
import { Game } from "./scenes/Game";

const config = {
    type: Phaser.AUTO,
	parent: 'phaser',
    width: 1000,
    height: 600,
	pixelArt: true, /* these settings make it so it isn't blurry */
	antialias: false, /* ditto */
	roundPixels: true, /* if your pixel art seems 'warped' make sure this is true! */
    physics: {
        default: "arcade"
    },
    dom: {
        createContainer: true
    },
	scene: [Lobby,Game], /* this tells it what scenes to include */
}

/*  If you want to run the client on localhost, comment out the line below for the webserver and uncomment the one for localhost. Vice-versa for running on webserver.
    ONLY ONE OF THE LINES BELOW SHOULD BE ACTIVE!!!!
*/

//var client = new Colyseus.Client('ws://scranton-sleuths-server-99a94c66225e.herokuapp.com/'); //Use this for connecting to webserver
//var client = new Colyseus.Client('ws://localhost:3000'); //Use this for connecting to localhost

// Note: uncomment the first line if you wish to test the actual server; the second to test your local server
//const SERVER_URL = 'ws://scranton-sleuths-server-99a94c66225e.herokuapp.com/';
const SERVER_URL = 'ws://localhost:3000';

// --------------------------------------------------------------------------------------------------------------------------------------------

console.log("Hello, Detective.");

/**
//MultiClientTest.test_n_clients(6);
var client = new TextBasedClient(SERVER_URL);
client.playGame();

*/

const game = new Phaser.Game(config);