class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");

        this.score = 0;
        my.scoreTxt;
    }

    init() {
        // variables and settings
        this.ACCELERATION = 1200;
        this.DRAG = 2400;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 1800;
        this.JUMP_VELOCITY = -650;
        this.MAX_SPEED = 1200;

        this.inAir = false;
        this.wasInAir = this.inAir;
        this.walkCounter = 0;
    }

    create() {
        // SFX
        this.jump1 = this.sound.add("jump", {volume: 0.8});
        this.jump2 = this.sound.add("up", {volume: 0.8});
        this.gem1 = this.sound.add("gemUp", {volume: 0.6});
        this.gem2 = this.sound.add("gemTone", {volume: 0.6});
        
        this.snowsteps = [
            this.sound.add("snowstep_0"),
            this.sound.add("snowstep_1"),
            this.sound.add("snowstep_2"),
            this.sound.add("snowstep_3"),
            this.sound.add("snowstep_4")
        ];

        this.hardstep = this.sound.add("hardstep_0", {volume: 0.8});
        this.softstep = this.sound.add("softstep_0", {volume: 1});

        // VFX
        if(!this.anims.get("puffs")){
            this.anims.create({
                key: "puffs",
                frames: [
                    {key: "puff_0"},
                    {key: "puff_1"},
                    {key: "puff_2"},
                    {key: "puff_3"},
                    {key: "puff_4"}
                ],
                frameRate: 30,
                hideOnComplete: true
            });
        }

        if(!this.anims.get("smoke")){
            this.anims.create({
                key: "smoke",
                frames: [
                    {key: "smoke_0"},
                    {key: "smoke_1"},
                    {key: "puff_0"},
                    {key: "puff_1"},
                ],
                frameRate: 30,
                hideOnComplete: true
            });
        }

        // BACKGROUND
        this.add.image(0, 0, "sky");
        this.background = this.add.tileSprite(0, 200, 1440, 396, "sky").setScale(8).setScrollFactor(0.2);

        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        // 45 tiles wide and 25 tiles tall.
        this.map = this.add.tilemap("platformer-level-1", 18, 18, 45, 25);

        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("kenny_tilemap_packed", "tilemap_tiles");

        // Create a layer
        this.groundLayer = this.map.createLayer("Ground-n-Platforms", this.tileset, 0, 0);
        this.treesLayer = this.map.createLayer("Trees", this.tileset, 0, 0);
        this.environsLayer = this.map.createLayer("Environmental-Details", this.tileset, 0, 0);

        this.gemTiles = this.map.addTilesetImage("gem");
        this.gemLayer = this.map.createLayer("Gems", this.gemTiles, 0, 0);

        this.groundLayer.setScale(SCALE);
        this.treesLayer.setScale(SCALE);
        this.environsLayer.setScale(SCALE);
        this.gemLayer.setScale(SCALE);

        /* collectibles by object layer
        this.collectiblesLayer = this.map.getObjectLayer("Collectibles");
        */

        // Make it collidable
        this.groundLayer.setCollisionByProperty({
            collides: true
        });

        this.physics.world.setBounds(0, 0, this.groundLayer.width*SCALE, this.groundLayer.height*SCALE);

        // set up player avatar
        my.sprite.player = this.physics.add.sprite(game.config.width/4, game.config.height/2, "platformer_characters", "tile_0000.png");

        my.sprite.player.spawnX = game.config.width/4, my.sprite.player.spawnY = game.config.height/2;
        my.sprite.player.lives = 3;
        my.sprite.player.setScale(SCALE);
        my.sprite.player.setCollideWorldBounds(true, 1);
        my.sprite.player.body.setMaxVelocity(300, -this.JUMP_VELOCITY);

        // Enable collision handling
        this.physics.add.collider(my.sprite.player, this.groundLayer);

        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        // debug key listener (assigned to D key)
        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
        }, this);

        this.gemLayer.setTileIndexCallback(181, this.collectGem, this);
        this.physics.add.overlap(my.sprite.player, this.gemLayer);

        /* water debug
        this.groundLayer.setTileIndexCallback([33, 34, 35], this.hazard, this);
        this.physics.add.overlap(my.sprite.player, this.groundLayer);

        console.log(this.gemLayer);
        console.log(this.groundLayer);
        console.log(this.groundLayer.layer.tilemapLayer.tileset[0].tileProperties);
        */

        // TEXT
        my.scoreTxt = this.add.text(20, 20, "Gems Collected: 0",{
            fontFamily: "'Consolas'",
            style: "normal",
            fontSize: '24px',
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 2
        }).setScrollFactor(0);
        my.scoreTxt.fixedToCamera = true;

        // CAMERAS
        let camMain = this.cameras.main;
        camMain.setBounds(0, 0, this.map.widthInPixels*SCALE, this.map.heightInPixels*SCALE);
        camMain.setBackgroundColor("#dff6f5");
        camMain.startFollow(my.sprite.player);
    }

    update() {
        if(cursors.left.isDown) {
            // TODO: have the player accelerate to the left
            my.sprite.player.body.setAccelerationX(-this.ACCELERATION);
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);

            if(my.sprite.player.body.blocked.down && this.walkCounter-- % 6 == 0){
                if(this.walkCounter < 0){
                    this.walkCounter = 15;
                    this.snowsteps[Math.round(Math.random()*4)].play({volume: 0.2});
                }

                let puff = this.add.sprite(my.sprite.player.x, my.sprite.player.y + my.sprite.player.displayHeight/2).setScale(0.05).play("puffs");

                this.tweens.add({
                    targets: puff,
                    scaleX: {from: 0.05, to: 0},
                    scaleY: {from: 0.05, to: 0},
                    duration: 800
                });
            }

        } else if(cursors.right.isDown) {
            // TODO: have the player accelerate to the right
            my.sprite.player.body.setAccelerationX(this.ACCELERATION);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);

            if(my.sprite.player.body.blocked.down && this.walkCounter-- % 6 == 0){
                if(this.walkCounter < 0){
                    this.walkCounter = 15;
                    this.snowsteps[Math.round(Math.random()*4)].play({volume: 0.2});
                }

                let puff = this.add.sprite(my.sprite.player.x, my.sprite.player.y + my.sprite.player.displayHeight/2).setScale(0.05).play("puffs");

                this.tweens.add({
                    targets: puff,
                    scaleX: {from: 0.05, to: 0},
                    scaleY: {from: 0.05, to: 0},
                    duration: 800
                });
            }
        } else {
            // TODO: set acceleration to 0 and have DRAG take over
            my.sprite.player.body.setAccelerationX(0);
            my.sprite.player.body.setDragX(this.DRAG);
            my.sprite.player.anims.play('idle');
        }

        // player jump
        // note that we need body.blocked rather than body.touching b/c the former applies to tilemap tiles and the latter to the "ground"
        if(!my.sprite.player.body.blocked.down) {
            my.sprite.player.anims.play('jump');
            this.walkCounter = 0;

            this.wasInAir = this.inAir;
            this.inAir = true;
        }else{
            this.wasInAir = this.inAir;
            this.inAir = false;
        }
        
        if(my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up)){            
            // TODO: set a Y velocity to have the player "jump" upwards (negative Y direction)
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);

            this.jump1.play();
            this.jump2.play();
            

            let puff = this.add.sprite(my.sprite.player.x, my.sprite.player.y + my.sprite.player.displayHeight/2).setScale(0.2).play("puffs");

            this.tweens.add({
                targets: puff,
                scaleX: {from: 0.1, to: 0},
                scaleY: {from: 0.1, to: 0},
                duration: 800
            });
        }

        // Landing effects
        if(this.inAir === false && this.wasInAir === true){
            let smoke = this.add.sprite(my.sprite.player.x, my.sprite.player.y + my.sprite.player.displayHeight/2).setScale(0.1).play("smoke");

            this.tweens.add({
                targets: smoke,
                scaleX: {from: 0.1, to: 0},
                scaleY: {from: 0.1, to: 0},
                duration: 800
            });

            this.hardstep.play();
            this.softstep.play();
        }
    }
/* water debug
    hazard(sprite, tile){
        console.log("callback");

        //if(sprite.lives > 0){
            respawn(sprite);
        //}

        return;
    }

    respawn(sprite){
        sprite.lives--;
        sprite.x = sprite.spawnX;
        sprite.y = sprite.spawnY;
    }
*/
    collectGem(sprite, tile){
        this.gemLayer.removeTileAt(tile.x, tile.y);
        my.scoreTxt.setText("Gems Collected: " + ++this.score);

        this.gem1.play();
        this.gem2.play();

        return;
    }
}