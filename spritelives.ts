namespace spritelives {

    let spriteLives: { [key: number]: number } = {}
    let lifeZeroHandlers: { [key: number]: (sprite: Sprite) => void } = {}

    /**
     * 
     */
    //% blockId="set_sprite_life" block="set %sprite life to %lives"
    export function setSpriteLife(sprite: Sprite, lives: number) {
        spriteLives[sprite.id] = lives
    }

    //% blockId="get_sprite_life" block="%sprite life"
    export function lifeOf(sprite: Sprite) {
        return spriteLives[sprite.id]
    }

    //% blockId="change_sprite_life" block="change %sprite life by $delta"
    export function changeLifeBy(sprite: Sprite, delta: number) {
        let life = spriteLives[sprite.id]
        if (!life) {
            return
        }
        life += delta
        spriteLives[sprite.id] = life
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