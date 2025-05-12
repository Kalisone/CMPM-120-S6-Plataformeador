class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/");

        // Load characters spritesheet
        this.load.atlas("platformer_characters", "tilemap-characters-packed.png", "tilemap-characters-packed.json");

        // Load tilemap information
        this.load.image("tilemap_tiles", "tilemap_packed.png");                         // Packed tilemap
        this.load.tilemapTiledJSON("platformer-level-1", "platformer-level-1.tmj");   // Tilemap in JSON

        this.load.image("gem", "gem.png");
        this.load.image("sky", "platformer-level-1_background.png");

        this.load.image("puff_0", "whitePuff00.png");
        this.load.image("puff_1", "whitePuff01.png");
        this.load.image("puff_2", "whitePuff02.png");
        this.load.image("puff_3", "whitePuff03.png");
        this.load.image("puff_4", "whitePuff04.png");

        this.load.image("smoke_0", "blackSmoke00.png");
        this.load.image("smoke_1", "blackSmoke01.png");

        this.load.audio("jump", "phaseJump3.ogg");
        this.load.audio("up", "phaserUp4.ogg");

        this.load.audio("gemUp", "powerUp8.ogg");
        this.load.audio("gemTone", "zapThreeToneUp.ogg");

        this.load.audio("snowstep_0", "footstep_snow_000.ogg");
        this.load.audio("snowstep_1", "footstep_snow_001.ogg");
        this.load.audio("snowstep_2", "footstep_snow_002.ogg");
        this.load.audio("snowstep_3", "footstep_snow_003.ogg");
        this.load.audio("snowstep_4", "footstep_snow_004.ogg");

        this.load.audio("hardstep_0", "footstep_concrete_001.ogg");
        this.load.audio("softstep_0", "footstep_carpet_003.ogg");
    }

    create() {
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNames('platformer_characters', {
                prefix: "tile_",
                start: 0,
                end: 1,
                suffix: ".png",
                zeroPad: 4
            }),
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: 'idle',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0000.png" }
            ],
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0001.png" }
            ],
        });

         // ...and pass to the next Scene
         this.scene.start("platformerScene");
    }

    // Never get here since a new scene is started in create()
    update() {
    }
}