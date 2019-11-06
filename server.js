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
const FPS = 5;

// Direction consts
const FORWARD = 'forward';
const REVERSE = 'reverse';
const RIGHT = 'right';
const LEFT = 'left';
const STOP = 'stop';

// GPIO
const { Gpio } = require('onoff');
const input1 = new Gpio(4, 'out'); 
const input2 = new Gpio(17, 'out');
const input3 = new Gpio(27, 'out');
const input4 = new Gpio(22, 'out');

//#endregion

//#region Connectivity

// Serve the webpage
app.use(express.static('public'));
app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/public/index.html`);
});

// Receving instructions from the client
io.on('connection', socket => {

    // Drive
    socket.on('drive', direction => { drive(direction) });

    // Start patroling
    socket.on('patrol', () => patrol);
});

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
function drive(direction, duration){

    return new Promise(resolve => {

        // Translate direction string to GPIO action
        switch(direction){

            case STOP:
                input1.write(0);
                input2.write(0);
                input3.write(0);
                input4.write(0);
            break;

            case FORWARD:
                input1.write(1);
                input2.write(0);
                input3.write(1);
                input4.write(0);
            break;

            case REVERSE:
                input1.write(0);
                input2.write(1);
                input3.write(0);
                input4.write(1);
            break;

            case RIGHT:
                input1.write(1);
                input2.write(0);
                input3.write(0);
                input4.write(1);
            break;

            case LEFT:
                input1.write(0);
                input2.write(1);
                input3.write(1);
                input4.write(0);
            break;
        }

        // A duration was specified
        if (duration){
            setTimeout(() => {
                drive(STOP);
                resolve();
            }, duration * 1000);
        }

        // No duration specified, return TODO: is this line needed?
        else resolve();
    });
}

// The car will patrol
async function patrol(){

    // Loop forever
    while (true){
        await drive(FORWARD, 2.3);
        await drive(LEFT, 0.2);
        await drive(FORWARD, 0.1);
        await drive(LEFT, 0.2);
        await drive(FORWARD, 0.1);
        await drive(LEFT, 0.2);
    }
}

// Scan the house
async function scan(){

    // Update the house array
    function map(distance, direction){
        
        // Round down the distance traveled
        distance = Math.floor(distance);

        // Axis consts
        const X = 'x';
        const Y = 'x';
        
        // Fetch the current position
        let x = position.x;
        let y = position.y;

        let axis, delta;

        // Travel along the y-axis
        if (direction == FORWARD || direction == REVERSE){

            axis = Y;

            // Travel forward
            if (direction == FORWARD){
                position.y -= distanceTraveled;
                delta = -1;
            }

            // Reverse
            else{
                position.y += distanceTraveled;
                delta = 1;
            }
        }

        // Travel along the x-axis
        else{

            axis = Y;

            // Travel forward
            if (direction == LEFT){
                position.x -= distanceTraveled;
                delta = -1;
            }

            // Right
            else{
                position.x += distanceTraveled;
                delta = 1;
            }
        }

        // Add the path to the house array
        for (let i = 0; i < distance; i++){

            // X-axis
            if (axis == X) x += delta;

            // Y-axis
            else y += delta;

            // Map the position
            if (!house.includes([x,y])){
                house.push([x, y]);
            }
        }

    }

    let house = [];
    let position = {
        x: 0,
        y: 0
    };

    // The direction to drive
    let direction = FORWARD;

    // Scan loop
    while(true){

        // Keep driving until you hit an obstacle, once you reach one, the distance traveled returns
        const distanceTraveled = await drive(direction);

        // Travel along the y-axis
        if (direction == FORWARD || REVERSE){
            direction == FORWARD ? position.y -= distanceTraveled : position.y += distanceTraveled;
        }

        // Travel along the x-axis
        else{
            direction == LEFT ? position.x -= distanceTraveled : position.x += distanceTraveled;
        }

        map(distanceTraveled, direction);

        // Change driving direction

    }
}

//#endregion

main();