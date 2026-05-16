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
        this.limiteArriba = this.scale.height - 100;
        this.limiteAbajo = this.scale.height - 50;

        // Crear personaje
        this.player = new Player(
            this,
            440,
            this.scale.height - 120
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
    }

    update() {
        this.player.update(
            this.cursors,
            this.spaceKey,
            this.shieldKey,
            this.shootKey
        );

        // Evita que la cámara suba o baje
        this.cameras.main.scrollY = 0;
    }
}