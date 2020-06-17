//% weight=99 color="#6d5ba5" icon="\uf004"
namespace spritelives {
    const SPRITE_LIVES_EXTENSION_LIFE_DATA = "SPRITE_LIVES_EXTENSION_LIFE_DATA"
    const SPRITE_LIVES_EXTENSION_MAX_LIFE_DATA = "SPRITE_LIVES_EXTENSION_MAX_LIFE_DATA"

    const SPRITE_HP_BAR_BG_COLOR = 1
    const SPRITE_HP_BAR_FG_COLOR = 2


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
        if (sprite.data[SPRITE_LIVES_EXTENSION_MAX_LIFE_DATA] == undefined) {
            setSpriteMaxLife(sprite, lives)
        }
    }

    /**
     * set max lives of sprite
     * @param sprite
     * @param maxLives
     */
    //% lives.defl=3
    //% blockId="set_sprite_life" block="set %sprite=variables_get(mySprite) max life to %maxLives"
    export function setSpriteMaxLife(sprite: Sprite, maxLives: number) {
        sprite.data[SPRITE_LIVES_EXTENSION_MAX_LIFE_DATA] = maxLives
    }

    function maxLivesOf(sprite:Sprite) :number{
        return sprite.data[SPRITE_LIVES_EXTENSION_MAX_LIFE_DATA] || 0
    }


    /**
     * get sprite lives
     * @param sprite
     */
    //% blockId="get_sprite_life" block="%sprite=variables_get(mySprite) life"
    export function lifeOf(sprite: Sprite):number {
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


    class SpriteHpBarDrawer {
        private hpManagedSprites: Sprite[];    
        constructor() {
            this.hpManagedSprites = []
            game.onShade(() => {
                this.drawHpBar()
            })
        }

        drawHpBar() {
            for (let hpManagedSprite of this.hpManagedSprites) {
                let maxLives = maxLivesOf(hpManagedSprite)
                let lives = lifeOf(hpManagedSprite)
                this.drawSpriteHpBar(hpManagedSprite, lives, maxLives)
            }
        }

        remove(sprite:Sprite) {
            this.hpManagedSprites.removeElement(sprite)
        }

        add(sprite:Sprite) {
            if(this.hpManagedSprites.find(value => value == sprite)) {
                return 
            }
            this.hpManagedSprites.push(sprite)
            sprite.onDestroyed(()=>{
                this.hpManagedSprites.removeElement(sprite)
            })
        }

        drawSpriteHpBar(sprite:Sprite, lives:number, maxLives:number){
            let height = sprite.image.height 
            let width = sprite.image.width
            let barWidth = (width-2) * lives / maxLives

            console.log(maxLives)
            screen.fillRect(sprite.x - width / 2 + 1, sprite.y - height / 2 - 2, width - 2, 1, SPRITE_HP_BAR_BG_COLOR)
            screen.fillRect(sprite.x - width / 2 + 1, sprite.y - height / 2 - 2, barWidth, 1, SPRITE_HP_BAR_FG_COLOR)
        }
    }
    
    let spriteHpBarDrawer = new SpriteHpBarDrawer()

    //% blockId="show_hp_bar" block="toggle hp bar of %sprite=variables_get(mySprite) %show=toggleOnOff"
    export function showHpBar(sprite: Sprite, show:boolean) {
        // remove managed sprite if not show;
        if (!show) {
            spriteHpBarDrawer.remove(sprite)
            return
        }

        spriteHpBarDrawer.add(sprite)
    }


    /**
     * Set 'Sprite Ghost Mode'(overlap with othersprite, but NOT tiles) for Sprite for period of time(ms)
     * eats all onOverlaps event
     * @param sprite
     * @param period
     */
    //% blockId="set_ghost_mode_for" block="set %sprite=variables_get(mySprite) into sprite ghost mode for $period of time(ms)"
    export function ghostModeFor(sprite: Sprite, period: number) {
        let overlapHandlers = game.currentScene().overlapHandlers;

        // todo dictionary implementation
        let wrappedHandlers: scene.OverlapHandler[] = [];
        let ghostHandlers: GhostHandler[] = [];

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
