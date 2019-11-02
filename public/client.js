//#region Variables

const client = io();

//#endregion

//#region Joystick

const joystick = nipplejs.create({
    zone: document.getElementById('joystick'),
    mode: 'static',
    position: {left: '50%', top: '50%'},
    color: 'black',
    size: 225,
    threshold: 0.75
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

//#endregion

//#region Camera

client.on('image', data => {
    document.querySelector('#image').src = `data:image/jpeg;base64,${data}`;
});

//#endregion
