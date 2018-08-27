/// <reference path="../../../../../../../node_modules/phaser-ce/typescript/phaser.d.ts" />

namespace GameTheoryExplorer {
    export class LabelInput {

        game: Phaser.Game;
        active: boolean;
        shouldRecalculateOrder: boolean;
        currentlySelected: Phaser.Sprite;
        // labelOverlay: JQuery;
        // inputField: JQuery;

        constructor(game: Phaser.Game) {
            this.game = game;
            this.shouldRecalculateOrder = true;
            this.active = false;
            // this.labelOverlay = $('#label-overlay');
            // this.inputField = $("#input-label");
            this.inputHandler();
        }

        show(label: Phaser.Text, sprite: Phaser.Sprite) {
            this.currentlySelected = sprite;
            // this.inputField.val(label.text.replace(/\n/g, " "));
            // this.inputField.click();
            if (!this.active) {
                // this.labelOverlay.addClass("show-overlay");
                // this.inputField.addClass("show-label");
                this.shouldRecalculateOrder = true;
            }
            else {
                this.shouldRecalculateOrder = false;
            }

            // this.inputField.css({
            //     "left": label.x,
            //     "top": label.y,
            // });
            // setTimeout(() => {
            //     this.inputField.select();
            // }, 100);

            this.active = true;
        }

        hide() {
            // if (this.labelOverlay.hasClass("show-overlay")) {
            //     this.labelOverlay.removeClass("show-overlay");
            // }
            // if (this.inputField.hasClass("show-label")) {
            //     this.inputField.removeClass("show-label");
            // }
            this.shouldRecalculateOrder = true;
            this.active = false;
        }

        inputHandler() {
            // this.labelOverlay.on("click", () => {
            //     this.hide();
            // });
        }
    }
}
