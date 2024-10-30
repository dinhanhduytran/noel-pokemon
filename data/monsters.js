const monsters = {
    Emby: {
        image: {
            src: './img/embySprite.png'
        },
        name: 'Emby',
        position: {
            x: 280,
            y: 325
        },
        frames: {max: 4, hold: 48},
        animate: true,
        attacks: [attacks.Fireball, attacks.Tackle]
    },
    Draggle: {
        image: {
            src: './img/draggleSprite.png'
        },
        name: 'Draggle',
        position: {
            x: 800,
            y: 100
        },
        frames: {max: 4, hold: 48},
        animate: true ,
        isEnemy: true,
        attacks: [attacks.Fireball, attacks.Tackle]
    }
}

