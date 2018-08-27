/// <reference path="../../../../../../node_modules/phaser-ce/typescript/phaser.d.ts" />"/>
namespace GameTheoryExplorer {
    export class HoverButton extends Phaser.Sprite {
        private circle: Phaser.Sprite;
        private icon: Phaser.Sprite;
        active: boolean;
        buttonKey: string;
        hovered:boolean;

        constructor(game: Phaser.Game, group:Phaser.Group, key: string, circleColor: number, iconColor?: number) {
            super(game, 0, 0,"");
            this.anchor.set(0.5,0.5);
            this.width = 330;
            this.height = 330;

            this.active = false;
            this.hovered = false;
            this.buttonKey = key;
            this.inputEnabled = true;
            this.circle = this.game.add.sprite(0, 0, this.game.cache.getBitmapData("hover-circle"));

            this.circle.position=this.position;
            this.circle.tint = circleColor;
            this.circle.anchor.set(0.5,0.5);
            this.icon = this.game.add.sprite(0, 0, key);

            this.icon.anchor.set(0.5, 0.5);
            this.icon.position = this.position;
            if (iconColor) {
                this.icon.tint = iconColor;
            }
            this.events.onInputOver.add(()=>{
                this.hovered = true;
            });
            this.events.onInputOut.add(()=>{
                this.hovered = false;
            });

            this.input.priorityID = 200;
            // this.setHidden();
            group.add(this);
            group.add(this.circle);
            group.add(this.icon);
            this.bringToTop();
        }

        setInactive() {
            this.active = false;
            this.circle.alpha = 0.2;
            this.icon.alpha = 1;
            if(this.icon.tint!==0xffffff){
                this.icon.alpha = 0.2;
            }
            this.inputEnabled=false;
        }

        setActive() {
            this.active = true;
            this.circle.alpha = 1;
            this.icon.alpha = 1;
            this.inputEnabled = true;
            this.input.priorityID = 200;
        }

        setHidden(){
            this.active = false;
            this.circle.alpha = 0;
            this.icon.alpha = 0;
            this.inputEnabled = false;
        }

        destroy(){
            this.circle.destroy();
            this.circle = null;
            this.icon.destroy();
            this.icon = null;
            super.destroy();
        }
    }
}
