spritelives.onLifeZero(SpriteKind.Enemy, function (sprite) {
    info.changeScoreBy(1)
    sprite.destroy()
})
sprites.onOverlap(SpriteKind.Player, SpriteKind.Enemy, function (sprite, otherSprite) {
    spritelives.changeLifeBy(otherSprite, -1)
})
let mySprite = sprites.create(img`
    . . . . . . . . . . b 5 b . . .
    . . . . . . . . . b 5 b . . . .
    . . . . . . b b b b b b . . . .
    . . . . . b b 5 5 5 5 5 b . . .
    . . . . b b 5 d 1 f 5 d 4 c . .
    . . . . b 5 5 1 f f d d 4 4 4 b
    . . . . b 5 5 d f b 4 4 4 4 b .
    . . . b d 5 5 5 5 4 4 4 4 b . .
    . b b d d d 5 5 5 5 5 5 5 b . .
    b d d d b b b 5 5 5 5 5 5 5 b .
    c d d b 5 5 d c 5 5 5 5 5 5 b .
    c b b d 5 d c d 5 5 5 5 5 5 b .
    c b 5 5 b c d d 5 5 5 5 5 5 b .
    b b c c c d d d 5 5 5 5 5 d b .
    . . . . c c d d d 5 5 5 b b . .
    . . . . . . c c c c c b b . . .
`, SpriteKind.Player)
let mySprite2 = sprites.create(img`
    . . . . . . . . . . . . . . . . . . . . . . . .
    . . . . . . f f f f . . . . . . . . . . . . . .
    . . . . f f f 2 2 f f f . . . . . . . . . . . .
    . . . f f f 2 2 2 2 f f f . . . . . . . . . . .
    . . f f f e e e e e e f f f . . . . . . . . . .
    . . f f e 2 2 2 2 2 2 e e f . . . . . . . . . .
    . . f e 2 f f f f f f 2 e f . . . . . . . . . .
    . . f f f f e e e e f f f f . . . . . . . . . .
    . f f e f b f 4 4 f b f e f f . . . . . . . . .
    . f e e 4 1 f d d f 1 4 e e f . . . . . . . . .
    f d f e e d d d d d 4 e f f . . . . . . . . . .
    f b f f e e 4 4 4 e d d 4 e . . . . . . . . . .
    f b f 4 f 2 2 2 2 e d d e . . . . . . . . . . .
    f c f . f 2 2 c c c e e . . . . . . . . . . . .
    . f f . f 4 4 c d c 4 f . . . . . . . . . . . .
    . . . . f f f d d c f f . . . . . . . . . . . .
    . . . . . f d d c f f . . . . . . . . . . . . .
    . . . . c d d c . . . . . . . . . . . . . . . .
    . . . . c d c . . . . . . . . . . . . . . . . .
    . . . . c c . . . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . . . . . . . . . .
`, SpriteKind.Enemy)
spritelives.setSpriteLife(mySprite2, 3)
