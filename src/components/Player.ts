import Phaser from 'phaser'

export default class Player {
    private readonly scene: Phaser.Scene;
    private readonly sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody

    public static loadAssets (scene: Phaser.Scene) {
        scene.load.spritesheet('dude',
            'assets/sprites/dude.png',
            {frameWidth: 32, frameHeight: 48}
        )
    }

    public constructor (scene: Phaser.Scene, spawnPosition?: {x: number, y: number}) {
        this.scene = scene

        if (spawnPosition === undefined) {
            this.sprite = scene.physics.add.sprite(0, 0, 'dude')
        } else {
            this.sprite = scene.physics.add.sprite(spawnPosition.x, spawnPosition.y, 'dude')
        }

        this.sprite.setBounce(0.1)

        this.scene.anims.create({
            key: 'left',
            frames: this.scene.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        })

        this.scene.anims.create({
            key: 'turn',
            frames: [ { key: 'dude', frame: 4 } ],
            frameRate: 20
        })

        this.scene.anims.create({
            key: 'right',
            frames: this.scene.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        })
    }

    public update () {
        this.move()
    }

    private move () {
        const keyboard = this.scene.input.keyboard
        if (keyboard === null) {
            throw 'keyboard plugin is null'
        }
        const cursors = keyboard.createCursorKeys();

        if (cursors.left.isDown)
        {
            this.sprite.setVelocityX(-160)
            this.sprite.anims.play('left', true)
        }
        else if (cursors.right.isDown)
        {
            this.sprite.setVelocityX(160)
            this.sprite.anims.play('right', true)
        }
        else
        {
            this.sprite.setVelocityX(0)
            this.sprite.anims.play('turn')
        }

        if (cursors.up.isDown /*&& this.sprite.body.onFloor()*/)
        {
            this.sprite.setVelocityY(-300)
        }
    }

    public setCollideWithLayer (layer: Phaser.Types.Physics.Arcade.ArcadeColliderType) {
        this.scene.physics.add.collider(this.sprite, layer)
    }

    public attachToCamera (camera:  Phaser.Cameras.Scene2D.Camera) {
        camera.startFollow(this.sprite)
    }
}