class Level1Scene extends Phaser.Scene {
    constructor() {
        super('Level1Scene');
    }

    create() {
        // Fondo del nivel
        this.fondo = this.add.image(0, 0, 'fondoNivel1');
        this.fondo.setOrigin(0, 0);

        // Escala el fondo para cubrir toda la pantalla
        const escalaBase = Math.max(
            this.scale.width / this.fondo.width,
            this.scale.height / this.fondo.height
        );

        // Aumenta el fondo para que quede escenario fuera de la pantalla
        const zoomFondo = 1.08;

        this.fondo.setScale(escalaBase * zoomFondo);

        // Tamaño real del mundo según el fondo escalado
        const worldWidth = this.fondo.displayWidth;
        const worldHeight = this.scale.height;

        // Límites del mundo físico
        this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

        // Límites de cámara
        this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);

        // Música de fondo
        this.musicaFondo = this.sound.add('musica', {
            loop: true,
            volume: 0.7
        });

        this.musicaFondo.play();

        this.input.once('pointerdown', () => {
            if (!this.musicaFondo.isPlaying) {
                this.musicaFondo.play();
            }
        });

        this.input.keyboard.once('keydown', () => {
            if (!this.musicaFondo.isPlaying) {
                this.musicaFondo.play();
            }
        });

        // Límites izquierda y derecha del escenario
        this.limiteIzquierda = 80;
        this.limiteDerecha = worldWidth - 80;

        // Límites visuales del piso por donde puede caminar el personaje
        this.limiteArriba = this.scale.height - 80;
        this.limiteAbajo = this.scale.height - 30;

        // Crear personaje
        this.player = new Player(
            this,
            440,
            this.scale.height - 50
        );

        // Cámara siguiendo al personaje solo en horizontal
        this.cameras.main.startFollow(this.player.sprite, true, 0.18, 0);

        // Zona muerta horizontal
        this.cameras.main.setDeadzone(250, this.scale.height);

        // Controles con flechas
        this.cursors = this.input.keyboard.createCursorKeys();

        // Tecla espacio para saltar
        this.spaceKey = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.SPACE
        );

        // Tecla X para activar escudo
        this.shieldKey = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.X
        );

        // Tecla Z para disparar
        this.shootKey = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.Z
        );

        this.controlsHelpVisible = false;

        if (!this.registry.get('level1ControlsHelpSeen')) {
            this.createControlsHelp();
        }
    }

    update() {
        if (this.controlsHelpVisible && this.hasPlayerUsedControls()) {
            this.hideControlsHelp();
        }

        this.player.update(
            this.cursors,
            this.spaceKey,
            this.shieldKey,
            this.shootKey
        );

        // Evita que la cámara suba o baje
        this.cameras.main.scrollY = 0;
    }
    createControlsHelp() {
        this.controlsHelp = this.add.container(76, 96);
        this.controlsHelp.setScrollFactor(0);
        this.controlsHelp.setDepth(1000);
        this.controlsHelp.setAlpha(0);

        const title = this.add.text(0, 0, 'Controles', {
            fontFamily: 'Arial',
            fontSize: '26px',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        title.setOrigin(0, 0);
        title.setStroke('#000000', 5);
        title.setShadow(0, 3, '#000000', 5);

        const descriptionStyle = {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#f2f5ff'
        };

        const createKey = (x, y, label, width = 34, height = 28) => {
            const key = this.add.container(x, y);
            const background = this.add.graphics();
            background.fillStyle(0x121820, 0.76);
            background.lineStyle(2, 0xffffff, 0.58);
            background.fillRoundedRect(0, 0, width, height, 6);
            background.strokeRoundedRect(0, 0, width, height, 6);

            const text = this.add.text(width / 2, height / 2, label, {
                fontFamily: 'Arial',
                fontSize: '18px',
                color: '#ffffff',
                fontStyle: 'bold'
            });
            text.setOrigin(0.5);
            text.setStroke('#000000', 3);

            key.add([background, text]);
            return key;
        };

        const createDescription = (x, y, text) => {
            const description = this.add.text(x, y, text, descriptionStyle);
            description.setOrigin(0, 0.5);
            description.setStroke('#000000', 5);
            description.setShadow(0, 2, '#000000', 4);
            return description;
        };

        const arrowKeys = this.add.container(0, 44);
        arrowKeys.add([
            createKey(39, 0, '\u2191'),
            createKey(0, 30, '\u2190'),
            createKey(39, 30, '\u2193'),
            createKey(78, 30, '\u2192')
        ]);

        const rows = [
            arrowKeys,
            createDescription(132, 88, 'para moverse'),
            createKey(0, 124, 'Espacio', 92),
            createDescription(132, 138, 'para saltar'),
            createKey(29, 164, 'X'),
            createDescription(132, 178, 'mantener presionado para activar escudo'),
            createKey(29, 204, 'Z'),
            createDescription(132, 218, 'para disparar')
        ];

        this.controlsHelp.add([title, ...rows]);
        this.controlsHelpVisible = true;

        this.tweens.add({
            targets: this.controlsHelp,
            alpha: 1,
            duration: 250,
            ease: 'Quad.easeOut'
        });
    }

    hasPlayerUsedControls() {
        return (
            this.cursors.left.isDown ||
            this.cursors.right.isDown ||
            this.cursors.up.isDown ||
            this.cursors.down.isDown ||
            this.spaceKey.isDown ||
            this.shieldKey.isDown ||
            this.shootKey.isDown
        );
    }

    hideControlsHelp() {
        if (!this.controlsHelp) return;

        this.controlsHelpVisible = false;
        this.registry.set('level1ControlsHelpSeen', true);

        this.tweens.add({
            targets: this.controlsHelp,
            alpha: 0,
            duration: 180,
            ease: 'Quad.easeIn',
            onComplete: () => {
                this.controlsHelp.destroy();
                this.controlsHelp = null;
            }
        });
    }
}
