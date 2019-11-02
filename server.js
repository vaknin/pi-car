//#region Variables

// Consts
const cmd = require('child_process').exec;
const port = process.env.port || 3000;
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const opencv = require('opencv4nodejs');
const cam = new opencv.VideoCapture(0);
const FPS = 8;

// GPIO
const gpio = require('onoff').Gpio;
const input1 = new gpio(4, 'out'); 
const input2 = new gpio(17, 'out');
const input3 = new gpio(27, 'out');
const input4 = new gpio(22, 'out');

//#endregion

//#region Connectivity

// Serve the webpage
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

    // Public website
    server.listen(port);

    // Send a picture every second
    setInterval(() => {
        const frame = cam.read();
        const image = opencv.imencode('.jpg', frame).toString('base64');
        io.emit('image', image);
    }, 1000 / FPS);
    
    // Notify that the server is running
    console.log(`Server is running on port ${port}...`);
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