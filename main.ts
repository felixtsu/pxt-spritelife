namespace spritelives {
    const SPRITE_LIVES_EXTENSION_LIFE_DATA = "SPRITE_LIVES_EXTENSION_LIFE_DATA"
    let lifeZeroHandlers: { [key: number]: (sprite: Sprite) => void } = {}

    /**
     * 
     */
    //% blockId="set_sprite_life" block="set %sprite=variables_get(mySprite) life to %lives"
    export function setSpriteLife(sprite: Sprite, lives: number) {
        sprite.data[SPRITE_LIVES_EXTENSION_LIFE_DATA] = lives
    }

    //% blockId="get_sprite_life" block="%sprite=variables_get(mySprite) life"
    export function lifeOf(sprite: Sprite) {
        return sprite.data[SPRITE_LIVES_EXTENSION_LIFE_DATA]
    }

    //% blockId="change_sprite_life" block="change %sprite=variables_get(mySprite) life by $delta"
    export function changeLifeBy(sprite: Sprite, delta: number) {
        let life = lifeOf(sprite)
        if (!life) {
            return
        }
        life += delta
        setSpriteLife(sprite, life)
        if (life <= 0) {
            let handler = lifeZeroHandlers[sprite.kind()]
            if (handler) {
                control.runInParallel(
                    () => handler(sprite)
                )
            }

        }
    }


    /**
    * life zero callback
    * @param spriteKind 
    * @param handler
    */
    //% draggableParameters="reporter"
    //% blockId="on_sprite_life_zero" block="on $sprite of kind $spriteKind=spritekind life zero"
    export function onLifeZero(spriteKind: number, handler: (sprite: Sprite) => void) {
        if (!handler || spriteKind == undefined) {
            return;
        }

        lifeZeroHandlers[spriteKind] = handler
    }

}