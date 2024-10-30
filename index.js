const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = 1024;
canvas.height = 576;

const collisionsMap = []
for (let i = 0; i < collisions.length; i += 70) {
    collisionsMap.push(collisions.slice(i, 70 + i));
}

const battleZonesMap = []
for (let i = 0; i < battleZonesData.length; i += 70) {
    battleZonesMap.push(battleZonesData.slice(i, 70 + i));
}

const boundaries = []
const offset = {x: -835, y: -300}

collisionsMap.forEach((row, i) => {
    row.forEach((el, j) => {
        if (el === 1025) 
            boundaries.push(
                new Boundary({
                    position: {
                        x: j * Boundary.width + offset.x,
                        y: i * Boundary.height + offset.y
                    }
                })
            )   
    })
})

const battleZones = []

battleZonesMap.forEach((row, i) => {
    row.forEach((el, j) => {
        if (el === 1025) 
            battleZones.push(
                new Boundary({
                    position: {
                        x: j * Boundary.width + offset.x,
                        y: i * Boundary.height + offset.y
                    }
                })
            )   
    })
})

// c.fillStyle = '#FFFBDB'
// c.fillRect(0, 0, canvas.width, canvas.height);

const image = new Image();
image.src = './img/Map.png';

const foregroundImage = new Image;
foregroundImage.src = './img/foreground.png';

const playerDownImage = new Image();
playerDownImage.src = './img/playerDown.png';

const playerUpImage = new Image();
playerUpImage.src = './img/playerUp.png';

const playerLeftImage = new Image();
playerLeftImage.src = './img/playerLeft.png';

const playerRightImage = new Image();
playerRightImage.src = './img/playerRight.png';

//background of the game (map)
const background = new Sprite({
    position: {x: offset.x, y: offset.y},
    image: image
});

//forground layer
const foreground = new Sprite({
    position: {x: offset.x, y: offset.y},
    image: foregroundImage
});

//player
const player = new Sprite({
    position: {
        //image size
        x: canvas.width / 2 - 192 / 4 / 2,  
        y: canvas.height / 2 - 68 / 2
    },
    image: playerDownImage,
    frames: {max:4, hold: 30},
    sprites: {
        up: playerUpImage,
        down: playerDownImage,
        left: playerLeftImage,
        right: playerRightImage
    }
})

const keys = {
    w: {
        pressed: false
    },
    a: {
        pressed: false
    },
    s: {
        pressed: false
    },
    d: {
        pressed: false
    }
}
// const testBoundary = new Boundary({
//     position: {
//         x: 400,
//         y: 400
//     }
// })
const movables = [background, ...boundaries, foreground, ...battleZones]

//Function to check if 2 rectangle (objects) touch each other
//Return True if touched
function rectangularCollision({rectangle1, rectangle2}) {
    return (
        rectangle1.position.x + rectangle1.width >= rectangle2.position.x && 
        rectangle1.position.x <= rectangle2.position.x + rectangle2.width && 
        rectangle1.position.y <= rectangle2.position.y + rectangle2.height && 
        rectangle1.position.y + rectangle1.height >= rectangle2.position.y
    )
}

const battle = {
    initiated: false
}

function animate() {
    const animationID = window.requestAnimationFrame(animate);
    background.draw();
    // testBoundary.draw();
    boundaries.forEach(boundary => {
        boundary.draw()
    })
    battleZones.forEach(battleZone => {
        battleZone.draw()
    })
    player.draw();
    foreground.draw();

    let moving = true
    player.animate = false

    // Do not listen to any key when activate battle so return
    if (battle.initiated) return
    //Activate Battle
    if (keys.w.pressed || keys.a.pressed || keys.s.pressed || keys.d.pressed) {
        for (let i = 0; i < battleZones.length; i++) {
            const battleZone = battleZones[i]
            const overlappingArea = 
                (Math.min(
                    player.position.x + player.width, 
                    battleZone.position.x + battleZone.width) - 
                Math.max(player.position.x, battleZone.position.x)) 
                * 
                (Math.min(
                    player.position.y + player.height, 
                    battleZone.position.y + battleZone.height) - 
                Math.max(player.position.y, battleZone.position.y))
            if (
                rectangularCollision({
                    rectangle1: player, 
                    rectangle2: battleZone
                }) &&
                overlappingArea > (player.width * player.height) / 2 &&
                Math.random() < 0.01
                ) {
                battle.initiated = true
                // Deactivate a new animation loop
                window.cancelAnimationFrame(animationID)

                //flash overlapping layer transition to battle
                audio.Map.stop()
                audio.initBattle.play()
                audio.battle.play()
                gsap.to('#overlappingDiv', { 
                    opacity: 1,
                    repeat: 3,
                    yoyo: true,
                    duration: 0.4,
                    onComplete() {
                        gsap.to('#overlappingDiv', {
                            opacity: 1,
                            duration: 0.4,
                            onComplete() {
                                // Activate a new animation loop

                                initBattle()
                                animateBattle()
                                gsap.to('#overlappingDiv', {
                                    opacity: 0,
                                    duration: 0.4     
                                })
                            }
                        })

                        
                        
                        
                        
                    }
                })
                break
            }
        }
    }

    if (keys.w.pressed && lastKey === 'w') {
        player.animate = true
        player.image = player.sprites.up
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (
                rectangularCollision({
                    rectangle1: player, 
                    rectangle2: {...boundary, 
                        position: {
                            x: boundary.position.x,
                            y: boundary.position.y + 3
                        }
                    }
                })
                ) {
                moving = false
                break
            }
        }
        if (moving)
            movables.forEach(movable => {
                movable.position.y += 3
            })
    } else if (keys.a.pressed && lastKey === 'a') {
        player.animate = true
        player.image = player.sprites.left
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (
                rectangularCollision({
                    rectangle1: player, 
                    rectangle2: {...boundary, 
                        position: {
                            x: boundary.position.x + 3,
                            y: boundary.position.y
                        }
                    }
                })
                ) {
                moving = false
                break
            }
        }
        if (moving)
            movables.forEach(movable => {
                movable.position.x += 3
            })
    } else if (keys.s.pressed && lastKey === 's') {
        player.animate = true
        player.image = player.sprites.down
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (
                rectangularCollision({
                    rectangle1: player, 
                    rectangle2: {...boundary, 
                        position: {
                            x: boundary.position.x,
                            y: boundary.position.y - 3
                        }
                    }
                })
                ) {
                moving = false
                break
            }
        }
        if (moving)
            movables.forEach(movable => {
                movable.position.y -= 3
            })
    } else if (keys.d.pressed && lastKey === 'd') {
        player.animate = true
        player.image = player.sprites.right
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (
                rectangularCollision({
                    rectangle1: player, 
                    rectangle2: {...boundary, 
                        position: {
                            x: boundary.position.x -3,
                            y: boundary.position.y,
                        }
                    }
                })
                ) {
                moving = false
                break
            }
        }
        if (moving)
            movables.forEach(movable => {
                movable.position.x -= 3
            })
    } 
    

}

let lastKey = ''
window.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'w':
            keys.w.pressed = true;
            lastKey = 'w';
            break;
        case 'a':
            keys.a.pressed = true;
            lastKey = 'a';
            break;
        case 's':
            keys.s.pressed = true;
            lastKey = 's';
            break;
        case 'd':
            keys.d.pressed = true;
            lastKey = 'd';
            break;
    }
});

window.addEventListener('keyup', (e) => {
    switch (e.key) {
        case 'w':
            keys.w.pressed = false;
            break;
        case 'a':
            keys.a.pressed = false;
            break;
        case 's':
            keys.s.pressed = false;
            break;
        case 'd':
            keys.d.pressed = false;
            break;
    }
});

let clicked = false
addEventListener('click', () => {
    if (!clicked) {
        clicked = true
        audio.Map.play()
    }
})



