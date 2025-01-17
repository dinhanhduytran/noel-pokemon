class Sprite {
    constructor({position, velocity, image, frames = {max: 1, hold: 10}, sprites, animate = false, rotation = 0}) {
        this.position = position
        this.image = new Image()
        this.frames = {...frames, val: 0, elapsed: 0}
        this.image.onload = () => {
            // for the player image (4 frames)
            this.width = this.image.width / this.frames.max
            this.height = this.image.height
        }
        this.image.src = image.src
        this.animate = animate
        this.sprites = sprites
        this.opacity = 1
        this.rotation = rotation // for attack sprites
    }

    draw() {
        c.save()
        c.translate(
            this.position.x + this.width/2, 
            this.position.y + this.height/2
        )
        c.rotate(this.rotation)
        c.translate(
            -this.position.x - this.width/2, 
            -this.position.y - this.height/2
        )
        c.globalAlpha = this.opacity
        c.drawImage(
            this.image, 
            //sx and sy, the x and i coordinates from where to start cropping the source image
            this.frames.val * this.width,
            0,
            //sWidth and sHeight, the w and h of the cropped section from the source image
            this.image.width / this.frames.max,
            this.image.height,
            //dx and dy, the x and y coordinates on the canvas where the image will be drawn
            this.position.x,
            this.position.y,
            //dWidth and dHeight, the w and h of the drawn image
            this.image.width / this.frames.max,
            this.image.height
        );
        c.restore()
        if (!this.animate) return
        // animate
        if (this.frames.max > 1) {
            this.frames.elapsed++
        } 
        
        if (this.frames.elapsed % this.frames.hold === 0) {
            if (this.frames.val < this.frames.max - 1) this.frames.val++
            else this.frames.val = 0
        }
        
    }

    
}

class Monster extends Sprite {
    constructor({isEnemy = false, name, attacks, ...args}) {
        super(args)
        this.isEnemy = isEnemy
        this.name = name
        this.health = 100
        this.attacks = attacks
    }

    faint() {
        
        const dialogue = document.querySelector('#dialogueBox')
        dialogue.style.display = 'block'
        dialogue.innerHTML = this.name + ' fainted!'

        gsap.to(this.position, {
            y: this.position.y + 20
        })
        gsap.to(this, {
            opacity: 0
        })
        audio.battle.stop()
        audio.victory.play()
    }

    attack({attack, recipient, renderedSprites}) {
        const dialogue = document.querySelector('#dialogueBox')
        dialogue.style.display = 'block'
        dialogue.innerHTML = this.name + ' used ' + attack.name + ' on ' + recipient.name


        let healthBar = '#enemyHealthBar'
        if (this.isEnemy) healthBar = '#playerHealthBar'
        recipient.health -= attack.damage
        let rotation = 1
        if (this.isEnemy) rotation = -2.2
        switch (attack.name) {
            case 'Fireball':
                audio.initFireball.play()
                const fireballImg = new Image()
                fireballImg.src = './img/fireball.png'
                const fireball = new Sprite ({
                    position: {
                        x: this.position.x,
                        y: this.position.y
                    },
                    image: fireballImg,
                    frames: {
                        max: 4,
                        hold: 10
                    },
                    animate: true,
                    rotation
                })
                renderedSprites.splice(1, 0, fireball)
                gsap.to(fireball.position, {
                    x: recipient.position.x,
                    y: recipient.position.y,
                    onComplete: () => {
                        audio.fireballHit.play()
                        gsap.to(healthBar, {
                            width: recipient.health + '%'
                        })
                        gsap.to(recipient.position, {
                            x: recipient.position.x + 10,  // Slight move for effect
                            yoyo: true,
                            repeat: 5,
                            duration: 0.08
                        })
        
                        gsap.to(recipient, {
                            opacity: 0,
                            yoyo: true,
                            repeat: 5,
                            duration: 0.08
                        })
                        renderedSprites.splice(1, 1)
                    }
                })
                break
            case 'Tackle':
                const tl = gsap.timeline()
                let movementDistance = 20
                if (this.isEnemy) movementDistance = - 20
                tl.to(this.position, {
                    x: this.position.x - movementDistance
                }).to(this.position, {
                    x: this.position.x + 40,
                    duration: 0.1,
                    onComplete: () => {  // Use arrow function to capture the outer scope
                        // when enemy actually gets hit
                        audio.tackleHit.play()
                        gsap.to(healthBar, {
                            width: recipient.health + '%'
                        })
                        gsap.to(recipient.position, {
                            x: recipient.position.x + 10,  // Slight move for effect
                            yoyo: true,
                            repeat: 5,
                            duration: 0.08
                        })
        
                        gsap.to(recipient, {
                            opacity: 0,
                            yoyo: true,
                            repeat: 5,
                            duration: 0.08
                        })
                    }
                }).to(this.position, {
                    x: this.position.x,
                });
                break
        }
    }

    
}

class Boundary {
    //12x12 pixel, zoom 400%
    static width = 48
    static height = 48
    constructor({position}) {
        this.position = position
        
        //use static so this one is unnecessary
        this.width = 48
        this.height = 48
    }

    draw() {
        c.fillStyle = 'rgba(255, 0, 0, 0)'
        c.fillRect(this.position.x, this.position.y, this.width, this.height)
    }
}
