//% weight=99 color="#6d5ba5" icon="\uf004"
namespace spritelives {
    const SPRITE_LIVES_EXTENSION_LIFE_DATA = "SPRITE_LIVES_EXTENSION_LIFE_DATA"
    let lifeZeroHandlers: { [key: number]: (sprite: Sprite) => void } = {}

    /**
     * set sprite lives
     * @param sprite
     * @param lives
     */
    //% lives.defl=3
    //% blockId="set_sprite_life" block="set %sprite=variables_get(mySprite) life to %lives"
    export function setSpriteLife(sprite: Sprite, lives: number) {
        sprite.data[SPRITE_LIVES_EXTENSION_LIFE_DATA] = lives
    }

    /**
     * get sprite lives
     * @param sprite
     */
    //% blockId="get_sprite_life" block="%sprite=variables_get(mySprite) life"
    export function lifeOf(sprite: Sprite) {
        return sprite.data[SPRITE_LIVES_EXTENSION_LIFE_DATA]
    }

    /**
     * change sprite lives
     * @param sprite
     * @param delta
     */
    //% delta.defl=-1
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

    class GhostHandler {
        originalHandler: (sprite: Sprite, otherSprite: Sprite) => void;
        sprite: Sprite;

        constructor(sprite: Sprite, originalHandler: (sprite: Sprite, otherSprite: Sprite) => void) {
            this.sprite = sprite
            this.originalHandler = originalHandler
        }

        wrapper(): (sprite: Sprite, otherSprite: Sprite) => void {
            return function (sprite: Sprite, otherSprite: Sprite) {
                // ignore overlap event during ghost peroid
                if (sprite === sprite || otherSprite === sprite) {
                    return
                }

                return this.originalHanlder(sprite, otherSprite)
            }
        }

        unwrap(): (sprite: Sprite, otherSprite: Sprite) => void {
            return this.originalHandler;
        }

    }

    function wrap(sprite: Sprite, originalHandler: (sprite: Sprite, otherSprite: Sprite) => void) {
        return new GhostHandler(sprite, originalHandler)
    }

   /**
    * Set 'Ghost Mode' for Sprite for period of time(ms)
    * @param sprite
    * @param period
    */
    //% blockId="set_ghost_mode_for" block="set $sprite into sprite ghost mode (overlap with othersprite, but NOT tiles) for $period of time(ms)"
    export function ghostModeFor(sprite: Sprite, period: number) {
        let overlapHandlers = game.currentScene().overlapHandlers;

        // todo dictionary implementation
        let wrappedHandlers:scene.OverlapHandler[] = [];
        let ghostHandlers:GhostHandler[] = [];
        
        for (let overlapHandler of overlapHandlers) {
            if (overlapHandler.kind == sprite.kind()
                || overlapHandler.otherKind == sprite.kind()) {
                    let ghostHandler = wrap(sprite, overlapHandler.handler)
                overlapHandler.handler = ghostHandler.wrapper() 
                
                wrappedHandlers.push(overlapHandler)
                ghostHandlers.push(ghostHandler)
            }
        }
        // todo 
        control.runInParallel(function () {
            loops.pause(period)

            for (let i = 0; i < wrappedHandlers.length; i++) {
                wrappedHandlers[i].handler = ghostHandlers[i].unwrap()
            }

        })

    }

}
