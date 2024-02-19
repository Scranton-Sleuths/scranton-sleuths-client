const Colyseus = require("colyseus.js");

var client = new Colyseus.Client('ws://scranton-sleuths-server-99a94c66225e.herokuapp.com/');

client.joinOrCreate("my_room").then(room => {
    console.log(room.sessionId, "joined", room.name);
}).catch(e => {
    console.log("JOIN ERROR", e);
});