//#region Variables

// Consts
const cmd = require('child_process').exec;
const port = process.env.port || 3000;
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

// GPIO
const gpio = require('onoff').Gpio;
const input1 = new gpio(4, 'out'); 
const input2 = new gpio(17, 'out');
const input3 = new gpio(27, 'out');
const input4 = new gpio(22, 'out');

//#endregion

//#region Connectivity

// Listen on port
server.listen(port);

// Send index.html
app.use(express.static('public'));
app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/public/index.html`);
});

// Receving instructions from the client
io.on('connection', socket => {
    socket.on('drive', direction => {

        // Drive
        drive(direction);
    });
});

//#endregion

//#region Tools

// Await a certain period of time
function sleep(seconds){

    return new Promise(resolve => {
        setTimeout(resolve, seconds * 1000);
    });
}

//#endregion

//#region Functions

// Main method
function main(){

    // Stop the car
    input1.write(0);
    input2.write(0);
    input3.write(0);
    input4.write(0);

    console.log('Server is ready.');
}

// Drive to a certain direction
function drive(direction){

    switch(direction){

        case 'stop':
            input1.write(0);
            input2.write(0);
            input3.write(0);
            input4.write(0);
        break;
        case 'forward':
            input1.write(1);
            input2.write(0);
            input3.write(1);
            input4.write(0);
        break;
        case 'reverse':
            input1.write(0);
            input2.write(1);
            input3.write(0);
            input4.write(1);
        break;
        case 'right':
            input1.write(1);
            input2.write(0);
            input3.write(0);
            input4.write(1);
        break;
        case 'left':
            input1.write(0);
            input2.write(1);
            input3.write(1);
            input4.write(0);
        break;
    }
}

//#endregion

main();
