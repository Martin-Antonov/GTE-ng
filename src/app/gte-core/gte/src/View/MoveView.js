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
/// <reference path = "../../lib/phaser.d.ts"/>
///<reference path="NodeView.ts"/>
///<reference path="../Model/Move.ts"/>
var GTE;
(function (GTE) {
    /** A class which represents how the move looks like, it has a reference to the start and end points and the label text*/
    var MoveView = /** @class */ (function (_super) {
        __extends(MoveView, _super);
        function MoveView(game, from, to) {
            var _this = _super.call(this, game, from.x, from.y, game.cache.getBitmapData("move-line")) || this;
            _this.from = from;
            _this.to = to;
            _this.move = _this.to.node.parentMove;
            _this.position = _this.from.position;
            _this.tint = 0x000000;
            _this.anchor.set(0.5, 0);
            _this.rotation = Phaser.Point.angle(_this.from.position, _this.to.position) + Math.PI / 2;
            _this.height = Phaser.Point.distance(_this.from.position, _this.to.position);
            _this.label = _this.game.add.text(0, 0, _this.move.label, null);
            _this.label.anchor.set(0.5, 0.5);
            _this.label.padding.x = 3;
            _this.label.align = "center";
            _this.label.fontWeight = 200;
            _this.label.inputEnabled = true;
            _this.game.add.existing(_this);
            _this.game.world.sendToBack(_this);
            return _this;
        }
        /** A method for repositioning the Move, once we have changed the position of the start or finish node */
        MoveView.prototype.updateMovePosition = function () {
            this.rotation = Phaser.Point.angle(this.from.position, this.to.position) + Math.PI / 2;
            this.height = Phaser.Point.distance(this.from.position, this.to.position);
        };
        MoveView.prototype.updateLabel = function (fractionOn) {
            var levelHeight = this.to.y - this.from.y;
            if (this.move.from.type === GTE.NodeType.CHANCE && this.move.probability !== null) {
                this.label.text = this.move.getProbabilityText(fractionOn);
            }
            else if (this.move.from.type === GTE.NodeType.OWNED && this.move.label) {
                this.label.text = this.move.label;
            }
            else {
                this.label.text = "";
                this.label.alpha = 0;
            }
            var labelPosition = this.from.position.clone();
            var direction = new Phaser.Point(this.to.position.x - this.from.position.x, this.to.position.y - this.from.position.y);
            direction.normalize();
            direction.setMagnitude(levelHeight * 0.6);
            labelPosition.add(direction.x, direction.y);
            if (this.rotation > 0) {
                labelPosition.x = labelPosition.x - this.label.width * 0.6;
            }
            else {
                labelPosition.x = labelPosition.x + this.label.width * 0.6 + this.label.padding.x;
            }
            this.label.x = labelPosition.x;
            this.label.y = labelPosition.y - this.label.height * 0.3;
            if (this.move.from.type === GTE.NodeType.OWNED) {
                var colorRGB = Phaser.Color.getRGB(this.from.node.player.color);
                this.label.fill = Phaser.Color.RGBtoString(colorRGB.r, colorRGB.g, colorRGB.b);
                this.label.fontStyle = "italic";
                this.label.fontSize = this.from.width * 0.42;
            }
            else if (this.move.from.type === GTE.NodeType.CHANCE) {
                this.label.fill = "#000";
                this.label.fontStyle = "normal";
                this.label.fontSize = this.from.width * 0.35;
            }
        };
        MoveView.prototype.destroy = function () {
            this.from = null;
            this.to = null;
            this.label.destroy();
            _super.prototype.destroy.call(this);
        };
        return MoveView;
    }(Phaser.Sprite));
    GTE.MoveView = MoveView;
})(GTE || (GTE = {}));
//# sourceMappingURL=MoveView.js.map