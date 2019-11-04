const client = io();
let mobile = isMobileDevice();

// Check if mobile or desktop
function isMobileDevice(){
    return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
};

// Get events

let image = document.querySelector('#image');
image.style.width = window.innerWidth * 0.7 + 'px';
image.style.height = window.innerHeight * 0.7 + 'px';

// Mobile
if (mobile){

    // Set screen size
    image.style.width = window.innerWidth + 'px';
    image.style.height = window.innerHeight + 'px';

    const joystick = nipplejs.create({
        zone: document.getElementById('joystick'),
        mode: 'static',
        position: {left: '50%', top: '50%'},
        color: 'white',
        size: 225,
        threshold: 0.65
    });
    
    joystick.on('move', (e,d) => {
    
        if (d.direction == undefined) return client.emit('drive', 'stop');
    
        switch(d.direction.angle){
            case 'up':
                client.emit('drive', 'forward');      
            break;
            case 'down':
                client.emit('drive', 'reverse');      
            break;
            case 'right':
                client.emit('drive', 'right');      
            break;
            case 'left':
                client.emit('drive', 'left');      
            break;
        }
    });
    
    joystick.on('end', () => client.emit('drive', 'stop'));
}

// Desktop
else{

    document.addEventListener('keydown', e => {

        drive(e.which, true);
    });
    
    document.addEventListener('keyup', e => {
    
        drive(e.which, false);
    });
    
}

// Drive
function drive(input, state){

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
        client.emit('drive', 'stop');
    }

    // Drive the car
    else{
        client.emit('drive', direction);
    }
}

client.on('image', data => {
    document.querySelector('#image').src = `data:image/jpeg;base64,${data}`;
});
