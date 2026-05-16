class Player {
    constructor(scene, x, y) {
        this.scene = scene;

        // Velocidades
        this.speed = 260;
        this.verticalSpeed = 180;

        // Escalas
        this.idleScale = 0.3;
        this.runScale = 0.3;
        this.shieldScale = 0.3;
        this.shootScale = 0.3;

        // Sprite inicial
        this.sprite = scene.physics.add.sprite(x, y, 'playerIdle', 0);

        // El punto Y representa los pies del personaje
        this.sprite.setOrigin(0.5, 1);
        this.sprite.setScale(this.idleScale);

        // Quitamos gravedad porque el movimiento vertical lo controlamos manualmente
        this.sprite.body.allowGravity = false;

        // Los límites los manejamos manualmente
        this.sprite.setCollideWorldBounds(false);

        // Estado inicial
        this.currentState = 'idle';

        // Posición base del personaje dentro del piso
        this.baseY = y;

        // Control del salto visual
        this.isJumping = false;
        this.jumpOffset = 0;
        this.jumpHeight = 90;
        this.jumpDuration = 350;

        // Estados especiales
        this.isShielding = false;
        this.isShooting = false;

        this.setIdleBody();
        this.createAnimations();

        this.sprite.anims.play('player-idle', true);
    }

    setIdleBody() {
        // Frame idle: 266 x 533
        this.sprite.body.setSize(120, 455);
        this.sprite.body.setOffset(73, 78);
    }

    setRunBody() {
        // Frame run: 400 x 533
        this.sprite.body.setSize(150, 455);
        this.sprite.body.setOffset(125, 78);
    }

    setShieldBody() {
        // Frame shield: 369 x 533
        this.sprite.body.setSize(150, 455);
        this.sprite.body.setOffset(110, 78);
    }

    setShootBody() {
        // Frame shoot: 362 x 533
        this.sprite.body.setSize(150, 455);
        this.sprite.body.setOffset(106, 78);
    }

    createAnimations() {
        if (!this.scene.anims.exists('player-idle')) {
            this.scene.anims.create({
                key: 'player-idle',
                frames: this.scene.anims.generateFrameNumbers('playerIdle', {
                    start: 0,
                    end: 5
                }),
                frameRate: 1,
                repeat: -1
            });
        }

        if (!this.scene.anims.exists('player-run')) {
            this.scene.anims.create({
                key: 'player-run',
                frames: this.scene.anims.generateFrameNumbers('playerRun', {
                    start: 0,
                    end: 5
                }),
                frameRate: 7,
                repeat: -1
            });
        }

        if (!this.scene.anims.exists('player-shield')) {
            this.scene.anims.create({
                key: 'player-shield',
                frames: this.scene.anims.generateFrameNumbers('playerShield', {
                    start: 0,
                    end: 4
                }),
                frameRate: 5,
                repeat: 0
            });
        }

        if (!this.scene.anims.exists('player-shoot')) {
            this.scene.anims.create({
                key: 'player-shoot',
                frames: this.scene.anims.generateFrameNumbers('playerShoot', {
                    start: 0,
                    end: 3
                }),
                frameRate: 6,
                repeat: 0
            });
        }
    }

    playIdle() {
        if (this.currentState === 'idle') return;

        this.sprite.setTexture('playerIdle');
        this.sprite.setFrame(0);
        this.sprite.setOrigin(0.5, 1);
        this.sprite.setScale(this.idleScale);

        this.setIdleBody();

        this.sprite.anims.play('player-idle', true);
        this.currentState = 'idle';
    }

    playRun() {
        if (this.currentState === 'run') return;

        this.sprite.setTexture('playerRun');
        this.sprite.setFrame(0);
        this.sprite.setOrigin(0.5, 1);
        this.sprite.setScale(this.runScale);

        this.setRunBody();

        this.sprite.anims.play('player-run', true);
        this.currentState = 'run';
    }

    playShield() {
        if (this.currentState === 'shield' || this.currentState === 'shieldHold') return;

        this.sprite.setTexture('playerShield');
        this.sprite.setFrame(0);
        this.sprite.setOrigin(0.5, 1);
        this.sprite.setScale(this.shieldScale);

        this.setShieldBody();

        this.currentState = 'shield';

        this.sprite.anims.play('player-shield', true);

        // Cuando termina la animación, mantiene el último frame mientras X siga presionada
        this.sprite.once('animationcomplete-player-shield', () => {
            if (this.isShielding) {
                this.sprite.anims.stop();
                this.sprite.setFrame(4);
                this.currentState = 'shieldHold';
            }
        });
    }

    playShoot() {
        if (this.isShooting) return;

        this.isShooting = true;
        this.currentState = 'shoot';

        this.sprite.setTexture('playerShoot');
        this.sprite.setFrame(0);
        this.sprite.setOrigin(0.5, 1);
        this.sprite.setScale(this.shootScale);

        this.setShootBody();

        this.sprite.anims.play('player-shoot', true);

        // Cuando termina el disparo, vuelve a idle
        this.sprite.once('animationcomplete-player-shoot', () => {
            this.createBullet();
            this.isShooting = false;
            this.currentState = 'idle';
            this.playIdle();
        });
    }

    createBullet() {
        const direction = this.sprite.flipX ? -1 : 1;

        // Posición desde donde nace la bala
        const bulletX = this.sprite.x + (direction * 58);
        const bulletY = this.sprite.y - 105;

        const bullet = this.scene.physics.add.sprite(bulletX, bulletY, 'playerBullet');

        bullet.setOrigin(0.5);

        // Tamaño visual de la bala
        bullet.setScale(0.2);

        bullet.setFlipX(direction < 0);
        bullet.setDepth(this.sprite.depth + 1);
        bullet.body.allowGravity = false;

        // Tamaño del cuerpo de colisión
        bullet.body.setSize(bullet.width, bullet.height);

        // Velocidad de la bala
        bullet.setVelocityX(direction * 700);

        this.scene.time.delayedCall(1800, () => {
            if (bullet.active) {
                bullet.destroy();
            }
        });
    }

    jump() {
        if (this.isJumping) return;

        this.isJumping = true;
        this.jumpOffset = 0;

        this.scene.tweens.add({
            targets: this,
            jumpOffset: this.jumpHeight,
            duration: this.jumpDuration,
            ease: 'Quad.easeOut',
            yoyo: true,
            onComplete: () => {
                this.jumpOffset = 0;
                this.isJumping = false;
            }
        });
    }

    update(cursors, spaceKey, shieldKey, shootKey) {
        const delta = this.scene.game.loop.delta / 1000;

        let nextX = this.sprite.x;
        let nextBaseY = this.baseY;

        let isMovingHorizontal = false;

        // Disparar con Z
        if (Phaser.Input.Keyboard.JustDown(shootKey) && !this.isShielding && !this.isShooting) {
            this.playShoot();
        }

        // Mientras dispara, no cambia a run ni idle hasta terminar la animación
        if (this.isShooting) {
            this.sprite.y = this.baseY - this.jumpOffset;
            this.sprite.body.updateFromGameObject();
            return;
        }

        // Activar escudo con X
        this.isShielding = shieldKey.isDown;

        // Si mantiene presionada X, activa escudo
        if (this.isShielding) {
            this.playShield();

            // Mantener posición actual
            this.sprite.y = this.baseY - this.jumpOffset;
            this.sprite.body.updateFromGameObject();

            return;
        }

        // Movimiento izquierda
        if (cursors.left.isDown) {
            nextX -= this.speed * delta;
            this.sprite.flipX = true;
            isMovingHorizontal = true;
        }

        // Movimiento derecha
        else if (cursors.right.isDown) {
            nextX += this.speed * delta;
            this.sprite.flipX = false;
            isMovingHorizontal = true;
        }

        // Movimiento arriba dentro del piso
        if (cursors.up.isDown) {
            nextBaseY -= this.verticalSpeed * delta;
        }

        // Movimiento abajo dentro del piso
        else if (cursors.down.isDown) {
            nextBaseY += this.verticalSpeed * delta;
        }

        // Límites izquierda / derecha del escenario
        nextX = Phaser.Math.Clamp(
            nextX,
            this.scene.limiteIzquierda,
            this.scene.limiteDerecha
        );

        // Límites arriba / abajo del piso
        this.baseY = Phaser.Math.Clamp(
            nextBaseY,
            this.scene.limiteArriba,
            this.scene.limiteAbajo
        );

        // Saltar con espacio
        if (Phaser.Input.Keyboard.JustDown(spaceKey)) {
            this.jump();
        }

        // Aplicar posición final
        this.sprite.x = nextX;
        this.sprite.y = this.baseY - this.jumpOffset;

        this.sprite.body.updateFromGameObject();

        // Animaciones
        if (isMovingHorizontal) {
            this.playRun();
        } else {
            // Arriba, abajo o quieto usan idle
            this.playIdle();
        }
    }
}
