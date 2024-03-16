const Colyseus = require("colyseus.js");

// Note: uncomment the first line if you wish to test the actual server; the second to test your local server
//const SERVER_URL = 'ws://scranton-sleuths-server-99a94c66225e.herokuapp.com/';
const SERVER_URL = 'ws://localhost:3000';

const MultiClientTest = {
    test_n_clients: function(n) {
        for (var i = 0; i < n; i++) {
            var client_i = new Colyseus.Client(SERVER_URL);
            client_i.joinOrCreate("lobby").then(room => {
                console.log(room.sessionId, "joined", room.name);
            }).catch(e => {
                console.log("JOIN ERROR", e);
            });
        }
    }
}

module.exports = MultiClientTest;