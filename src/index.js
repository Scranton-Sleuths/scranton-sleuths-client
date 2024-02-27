const Colyseus = require("colyseus.js");
var MultiClientTest = require("./multi-client-test");

/*  If you want to run the client on localhost, comment out the line below for the webserver and uncomment the one for localhost. Vice-versa for running on webserver.
    ONLY ONE OF THE LINES BELOW SHOULD BE ACTIVE!!!!
*/

//var client = new Colyseus.Client('ws://scranton-sleuths-server-99a94c66225e.herokuapp.com/'); //Use this for connecting to webserver
var client = new Colyseus.Client('ws://localhost:3000'); //Use this for connecting to localhost

// --------------------------------------------------------------------------------------------------------------------------------------------

console.log("Hello, Detective.");

MultiClientTest.test_n_clients(6);