class PreloadScene extends Phaser.Scene {
    constructor() {
        super('PreloadScene');
    }

    preload() {
        this.load.image('fondoNivel1', 'assets/backgrounds/fondo_nivel1.png');

        // Sprite quieto del personaje
        this.load.spritesheet('playerIdle', 'assets/sprites/player/player_idle.png', {
            frameWidth: 266,
            frameHeight: 533
        });
        
        // Sprite corriendo del personaje
        this.load.spritesheet('playerRun', 'assets/sprites/player/player_run.png', {
            frameWidth: 400,
            frameHeight: 533
        });

        // Sprite del escudo del personaje
        this.load.spritesheet('playerShield', 'assets/sprites/player/player_shield.png', {
            frameWidth: 369,
            frameHeight: 533
        });

        // Sprite disparando
        this.load.spritesheet('playerShoot', 'assets/sprites/player/player_shoot.png', {
            frameWidth: 400,
            frameHeight: 533
        });

        // Bala del personaje
        this.load.image('playerBullet', 'assets/sprites/player/bullets/player_bullet.png');

        // Música de fondo del nivel 1
        this.load.audio('musica', 'assets/audio/music/background.mp3');
    }
    

    create() {
        this.scene.start('Level1Scene');
    }
}
