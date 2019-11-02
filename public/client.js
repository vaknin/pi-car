//#region Variables

const client = io();
let pressed = false;

//#endregion

//#region Events

document.addEventListener('keydown', e => {

    if (pressed) return;
    pressed = true;
    drive(e.which, true);
});

document.addEventListener('keyup', e => {

    pressed = false;
    drive(e.which, false);
});

//#endregion

//#region Functions

function drive(input, state){

    // The direction to transmit
    let direction;

    // Check which direction was entered
    switch(input){

        // Forward
        case 38:
        case 87:
            direction = 'forward';
        break;

        // Reverse
        case 40:
        case 83:
            direction = 'reverse';
        break;

        // Left
        case 37:
        case 65:
            direction = 'left';
        break;

        // Right
        case 39:
        case 68:
            direction = 'right';
        break;
    }

    // If not a proper direction was entered, return
    if (direction == undefined) return;

    // Stop the car
    if (state == false){
        document.querySelector(`#${direction}`).style.backgroundColor = 'black';
        return client.emit('drive', 'stop');
    }

    // Drive the car
    else{
        client.emit('drive', direction);
        document.querySelector(`#${direction}`).style.backgroundColor = 'red';
    }
}

//#endregion

//#region Connectivity

client.on('video', data => {
});

//#endregion