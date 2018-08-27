/// <reference path = "../../lib/phaser.d.ts"/>
///<reference path="../Utils/Constants.ts"/>
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var GTE;
(function (GTE) {
    /** A class for the initial animation of the GTE software
     * This class shows a very simple usage of the Phaser Engine - sprites, colours, bitmaps, repositioning and tweens
     * Here we also preload all sprites that will be used*/
    var Boot = /** @class */ (function (_super) {
        __extends(Boot, _super);
        function Boot() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Boot.prototype.preload = function () {
            this.game.load.image("link", "src/Assets/Images/HoverMenu/Link.png");
            this.game.load.image("minus", "src/Assets/Images/HoverMenu/Minus.png");
            this.game.load.image("player", "src/Assets/Images/HoverMenu/Player.png");
            this.game.load.image("plus", "src/Assets/Images/HoverMenu/Plus.png");
            this.game.load.image("scissors", "src/Assets/Images/HoverMenu/Scissors.png");
            this.game.load.image("unlink", "src/Assets/Images/HoverMenu/Unlink.png");
            this.game.load.image("chance", "src/Assets/Images/HoverMenu/Chance.png");
            this.game.load.image("zoomIn", "src/Assets/Images/Misc/zoom-in.png");
            this.game.load.image("zoomIn", "src/Assets/Images/Misc/zoom-out.png");
            this.game.load.image("zoomOut", "src/Assets/Images/Misc/zoom-out.png");
            this.game.load.image("close", "src/Assets/Images/TopMenu/close-info.png");
        };
        Boot.prototype.create = function () {
            var _this = this;
            this.appendHTMLandCSS();
            this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            this.createTextures();
            this.radius = this.game.height * GTE.INTRO_RADIUS;
            this.distance = this.game.height * GTE.INTRO_DISTANCE;
            this.createBitmapPoint();
            this.createBitmapLine();
            this.game.stage.backgroundColor = "#fff";
            this.logoGroup = this.game.add.group();
            this.logoGroup.x = this.game.width / 2 - 3 * this.distance;
            this.logoGroup.y = this.game.height / 2 - this.distance;
            this.createPoints();
            this.createLines();
            this.createText();
            this.createHoverCircle();
            this.createCell();
            this.game.time.events.add(1200, function () {
                _this.game.state.start("MainScene");
            });
        };
        Boot.prototype.appendHTMLandCSS = function () {
            $.get("src/Menus/TopMenu/top-menu.html", function (data) {
                $('body').append(data);
            });
            var css1 = "<link rel=\"stylesheet\" href=\"src/Menus/TopMenu/top-menu.css\" type=\"text/css\"/>";
            $('head').append(css1);
            $.get("src/Menus/LabelInput/label-input.html", function (data) {
                $('body').append(data);
            });
            var css2 = "<link rel=\"stylesheet\" href=\"src/Menus/LabelInput/label-input.css\" type=\"text/css\"/>";
            $('head').append(css2);
        };
        Boot.prototype.createText = function () {
            this.text = this.game.add.text(this.point1.x + this.distance * 3, this.point1.y + this.distance / 2, "GTE", { font: "26px Arial" }, this.logoGroup);
            this.text.addColor("#f00", 1);
            this.text.addColor("#00f", 2);
            this.text.fontWeight = "bolder";
            this.text.fontSize = this.game.height * GTE.INTRO_TEXT_SIZE;
            this.text.anchor.set(0.5, 0.5);
            this.text.alpha = 0;
            this.game.add.tween(this.text).to({ alpha: 1 }, GTE.INTRO_TWEEN_DURATION, Phaser.Easing.Default, true);
        };
        Boot.prototype.createLines = function () {
            this.line1 = this.game.add.sprite(this.point2.x, this.point2.y, this.game.cache.getBitmapData("line"), null, this.logoGroup);
            this.line1.anchor.set(0, 0.5);
            this.line2 = this.game.add.sprite(this.point1.x, this.point1.y, this.game.cache.getBitmapData("line"), null, this.logoGroup);
            this.line2.anchor.set(0, 0.5);
            this.line1.scale.set(0, 5);
            this.line2.scale.set(0, 5);
            this.line1.rotation = -Math.PI * 0.25;
            this.line2.rotation = Math.PI * 0.25;
            this.line1.tint = 0x000000;
            this.line2.tint = 0x000000;
            this.game.add.tween(this.line1.scale).to({ x: this.distance * 1.44 }, GTE.INTRO_TWEEN_DURATION, Phaser.Easing.Default, true, GTE.INTRO_TWEEN_DURATION * 2 + 200);
            this.game.add.tween(this.line2.scale).to({ x: this.distance * 1.44 }, GTE.INTRO_TWEEN_DURATION, Phaser.Easing.Default, true, GTE.INTRO_TWEEN_DURATION * 3 + 200);
        };
        Boot.prototype.createPoints = function () {
            this.point1 = this.game.add.sprite(this.distance + this.radius, this.radius, this.game.cache.getBitmapData("point"), null, this.logoGroup);
            this.point2 = this.game.add.sprite(this.point1.x - this.distance, this.point1.y + this.distance, this.game.cache.getBitmapData("point"), null, this.logoGroup);
            this.point3 = this.game.add.sprite(this.point1.x + this.distance, this.point1.y + this.distance, this.game.cache.getBitmapData("point"), null, this.logoGroup);
            this.point1.anchor.set(0.5, 0.5);
            this.point2.anchor.set(0.5, 0.5);
            this.point3.anchor.set(0.5, 0.5);
            this.point1.scale.set(0, 0);
            this.point2.scale.set(0, 0);
            this.point3.scale.set(0, 0);
            this.game.add.tween(this.point1.scale).to({
                x: 1,
                y: 1
            }, GTE.INTRO_TWEEN_DURATION, Phaser.Easing.Back.Out, true, GTE.INTRO_TWEEN_DURATION + Math.random() * GTE.INTRO_TWEEN_DURATION);
            this.game.add.tween(this.point2.scale).to({
                x: 1,
                y: 1
            }, GTE.INTRO_TWEEN_DURATION, Phaser.Easing.Back.Out, true, GTE.INTRO_TWEEN_DURATION + Math.random() * GTE.INTRO_TWEEN_DURATION);
            this.game.add.tween(this.point3.scale).to({
                x: 1,
                y: 1
            }, GTE.INTRO_TWEEN_DURATION, Phaser.Easing.Back.Out, true, GTE.INTRO_TWEEN_DURATION + Math.random() * GTE.INTRO_TWEEN_DURATION);
        };
        Boot.prototype.createBitmapPoint = function () {
            this.bmd = this.game.make.bitmapData(this.game.height * 0.04, this.game.height * 0.04, "point", true);
            this.bmd.ctx.fillStyle = "#000000";
            this.bmd.ctx.arc(this.bmd.width / 2, this.bmd.height / 2, this.radius, 0, Math.PI * 2);
            this.bmd.ctx.fill();
        };
        Boot.prototype.createBitmapLine = function () {
            this.bmd = this.game.make.bitmapData(1, 1, "line", true);
            this.bmd.ctx.fillStyle = "#ffffff";
            this.bmd.ctx.fillRect(0, 0, 1, 1);
        };
        Boot.prototype.createTextures = function () {
            this.bmd = this.game.make.bitmapData(this.game.height * GTE.NODE_RADIUS * GTE.NODE_SCALE, this.game.height * GTE.NODE_RADIUS * GTE.NODE_SCALE, "node-square", true);
            this.bmd.ctx.fillStyle = "#fff";
            this.bmd.ctx.fillRect(0, 0, this.game.height * GTE.NODE_RADIUS * GTE.NODE_SCALE, this.game.height * GTE.NODE_RADIUS * GTE.NODE_SCALE);
            this.bmd = this.game.make.bitmapData(Math.round(this.game.height * GTE.LINE_WIDTH), Math.round(this.game.height * GTE.LINE_WIDTH), "move-line", true);
            this.bmd.ctx.fillStyle = "#fff";
            this.bmd.ctx.fillRect(0, 0, this.bmd.height, this.bmd.height);
        };
        Boot.prototype.createHoverCircle = function () {
            this.bmd = this.game.make.bitmapData(300, 300, "hover-circle", true);
            this.bmd.ctx.fillStyle = "#ffffff";
            this.bmd.ctx.arc(this.bmd.width / 2, this.bmd.height / 2, 150, 0, Math.PI * 2);
            this.bmd.ctx.fill();
        };
        Boot.prototype.createCell = function () {
            var cellWidth = GTE.CELL_WIDTH * this.game.width;
            this.bmd = this.game.make.bitmapData(cellWidth, cellWidth, "cell", true);
            this.bmd.ctx.strokeStyle = "#000000";
            this.bmd.ctx.lineWidth = cellWidth * GTE.CELL_STROKE_WIDTH;
            this.bmd.ctx.strokeRect(0, 0, cellWidth, cellWidth);
        };
        return Boot;
    }(Phaser.State));
    GTE.Boot = Boot;
})(GTE || (GTE = {}));
//# sourceMappingURL=Boot.js.map