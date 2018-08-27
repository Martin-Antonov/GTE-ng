/// <reference path = "../../lib/phaser.d.ts"/>
///<reference path="../Model/Node.ts"/>
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
    /** A class for the graphical representation of the Node. The inherited sprite from Phaser.Sprite will not be visible
     * and will only detect input on the node. The private fields circle and square are the visible ones, depending on whether
     * the node (of type Node) is chance or not. */
    var NodeView = /** @class */ (function (_super) {
        __extends(NodeView, _super);
        function NodeView(game, node, x, y) {
            var _this = _super.call(this, game, x, y, game.cache.getBitmapData("node-circle")) || this;
            _this.alpha = 0;
            _this.renderable = false;
            _this.isSelected = false;
            _this.anchor.set(0.5, 0.5);
            _this.scale.set(GTE.OVERLAY_SCALE, GTE.OVERLAY_SCALE);
            _this.inputEnabled = true;
            _this.node = node;
            _this.level = _this.node.depth;
            if (_this.node.player) {
                _this.tint = node.player.color;
            }
            else {
                _this.tint = 0x000000;
            }
            _this.labelHorizontalOffset = 1;
            _this.createSprites();
            _this.createLabels();
            _this.input.priorityID = 1;
            _this.ownerLabel.input.priorityID = 199;
            _this.payoffsLabel.input.priorityID = 199;
            _this.game.add.existing(_this);
            return _this;
        }
        /** A method which creates the circle and square sprites*/
        NodeView.prototype.createSprites = function () {
            this.circle = this.game.add.sprite(this.x, this.y, this.game.cache.getBitmapData("node-circle"));
            this.circle.anchor.set(0.5, 0.5);
            this.circle.position = this.position;
            this.circle.tint = this.tint;
            this.square = this.game.add.sprite(this.x, this.y, this.game.cache.getBitmapData("line"));
            this.square.position = this.position;
            this.square.tint = 0x000000;
            this.square.width = this.circle.width;
            this.square.height = this.circle.height;
            this.square.alpha = 0;
            this.square.anchor.set(0.5, 0.5);
            this.previewSelected = this.game.add.sprite(this.x, this.y, this.game.cache.getBitmapData("node-circle"));
            this.previewSelected.scale.set(1.8, 1.8);
            this.previewSelected.tint = GTE.SELECTION_INNER_COLOR;
            this.previewSelected.position = this.position;
            this.previewSelected.alpha = 0;
            this.previewSelected.anchor.set(0.5, 0.5);
        };
        /** A method which creates the label for the Node*/
        NodeView.prototype.createLabels = function () {
            this.ownerLabel = this.game.add.text(this.x + this.labelHorizontalOffset * this.circle.width, this.y - this.circle.width, "", null);
            if (this.node.player) {
                this.ownerLabel.setText(this.node.player.label, true);
            }
            else {
                this.ownerLabel.text = "";
            }
            // this.label.position = this.position.add(this.labelHorizontalOffset*this.circle.width,this.y-this.circle.width);
            this.ownerLabel.fontSize = this.circle.width * GTE.LABEL_SIZE;
            this.ownerLabel.fill = this.tint;
            this.ownerLabel.anchor.set(0.5, 0.5);
            this.ownerLabel.inputEnabled = true;
            // this.ownerLabel.fontWeight = 100;
            this.payoffsLabel = this.game.add.text(this.x, this.y + this.width, "", null);
            this.payoffsLabel.position = this.position;
            this.payoffsLabel.fontSize = this.circle.width * GTE.PAYOFF_SIZE;
            this.payoffsLabel.anchor.set(0.5, 0);
            this.payoffsLabel.fontWeight = 100;
            this.payoffsLabel.inputEnabled = true;
            this.payoffsLabel.lineSpacing = -10;
            this.payoffsLabel.align = "right";
        };
        NodeView.prototype.updateLabelPosition = function () {
            if (this.node.parent && this.node.parent.children.indexOf(this.node) < this.node.parent.children.length / 2) {
                this.labelHorizontalOffset = -1;
            }
            else {
                this.labelHorizontalOffset = 1;
            }
            this.ownerLabel.position.set(this.x + this.labelHorizontalOffset * this.circle.width, this.y - this.circle.width);
        };
        /** A method which converts the node, depending on whether it is a chance, owned or default.*/
        NodeView.prototype.resetNodeDrawing = function () {
            // this.setLabelText();
            //Selected and not Chance
            if (this.isSelected && this.node.type !== GTE.NodeType.CHANCE) {
                this.circle.alpha = 1;
                this.circle.tint = GTE.NODE_SELECTED_COLOR;
                this.square.alpha = 0;
                this.previewSelected.alpha = 0.3;
            }
            // Selected and Chance
            else if (this.isSelected && this.node.type === GTE.NodeType.CHANCE) {
                this.circle.alpha = 0;
                this.square.alpha = 1;
                this.square.tint = GTE.NODE_SELECTED_COLOR;
                this.previewSelected.alpha = 0.3;
            }
            // Not Selected, owned and not Chance
            else if (this.node.player && this.node.type !== GTE.NodeType.CHANCE) {
                this.circle.tint = this.node.player.color;
                this.circle.alpha = 1;
                this.square.alpha = 0;
                this.previewSelected.alpha = 0;
            }
            // Not selected, owned and chance
            else if (this.node.player && this.node.type === GTE.NodeType.CHANCE) {
                this.square.tint = 0x000000;
                this.square.alpha = 1;
                this.circle.alpha = 0;
                this.previewSelected.alpha = 0;
            }
            // If leaf
            else if (this.node.type === GTE.NodeType.LEAF) {
                this.circle.alpha = 0;
                this.square.alpha = 0;
                this.previewSelected.alpha = 0;
            }
            // All other cases
            else {
                this.circle.tint = 0x000000;
                this.square.alpha = 0;
                this.circle.alpha = 1;
                this.previewSelected.alpha = 0;
            }
            this.updateLabelPosition();
        };
        /** A method which sets the label text as the player label*/
        NodeView.prototype.resetLabelText = function (zeroSumOn) {
            if (this.node.player && !this.node.iSet) {
                this.ownerLabel.alpha = 1;
                this.ownerLabel.setText(this.node.player.label, true);
                var colorRGB = Phaser.Color.getRGB(this.node.player.color);
                this.ownerLabel.fill = Phaser.Color.RGBtoString(colorRGB.r, colorRGB.g, colorRGB.b);
                this.ownerLabel.scale.set(1);
            }
            else {
                this.ownerLabel.alpha = 0;
            }
            if (this.node.player && this.node.type === GTE.NodeType.CHANCE) {
                this.ownerLabel.scale.set(0.5);
            }
            if (this.node.children.length === 0) {
                if (zeroSumOn) {
                    this.node.payoffs.convertToZeroSum();
                }
                var payoffsString = this.node.payoffs.toString();
                var labelsArray = payoffsString.split(" ");
                this.payoffsLabel.text = "";
                this.payoffsLabel.clearColors();
                for (var i = 0; i < labelsArray.length; i++) {
                    this.payoffsLabel.text += labelsArray[i] + "\n";
                    this.payoffsLabel.addColor(Phaser.Color.getWebRGB(GTE.PLAYER_COLORS[i]), (this.payoffsLabel.text.length - labelsArray[i].length - i - 1));
                }
                this.payoffsLabel.text = this.payoffsLabel.text.slice(0, -1);
                this.payoffsLabel.alpha = 1;
            }
            else {
                this.payoffsLabel.alpha = 0;
            }
        };
        /** The destroy method of the node which prevents memory-leaks*/
        NodeView.prototype.destroy = function () {
            this.node = null;
            this.circle.destroy();
            this.circle = null;
            this.square.destroy();
            this.square = null;
            this.previewSelected.destroy();
            this.previewSelected = null;
            this.ownerLabel.destroy();
            this.ownerLabel = null;
            this.payoffsLabel.destroy();
            this.payoffsLabel = null;
            this.tint = null;
            this.scale = null;
            this.labelHorizontalOffset = null;
            _super.prototype.destroy.call(this);
        };
        return NodeView;
    }(Phaser.Sprite));
    GTE.NodeView = NodeView;
})(GTE || (GTE = {}));
//# sourceMappingURL=NodeView.js.map