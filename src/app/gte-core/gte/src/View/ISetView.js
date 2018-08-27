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
///<reference path="../Model/ISet.ts"/>
///<reference path="NodeView.ts"/>
///<reference path="../../lib/phaser.d.ts"/>
///<reference path="../Utils/Constants.ts"/>
var GTE;
(function (GTE) {
    /**A class for drawing the iSet */
    var ISetView = /** @class */ (function (_super) {
        __extends(ISetView, _super);
        function ISetView(game, iSet, nodes) {
            var _this = _super.call(this, game, 0, 0, "") || this;
            _this.game = game;
            _this.iSet = iSet;
            _this.nodes = nodes;
            _this.bmd = _this.game.make.bitmapData(_this.game.width, _this.game.height);
            _this.sortNodesLeftToRight();
            _this.createISetBMD();
            _this.createLabel();
            _this.inputEnabled = true;
            _this.input.priorityID = 100;
            _this.input.pixelPerfectClick = true;
            _this.input.pixelPerfectOver = true;
            return _this;
        }
        ISetView.prototype.removeNode = function (nodeV) {
            if (this.nodes.indexOf(nodeV) !== -1) {
                this.nodes.splice(this.nodes.indexOf(nodeV), 1);
            }
        };
        ISetView.prototype.resetISet = function () {
            this.sortNodesLeftToRight();
            this.createISetBMD();
            var rightNodePosition = this.nodes[Math.floor(this.nodes.length / 2)].position;
            var leftNodePosition = this.nodes[Math.floor(this.nodes.length / 2) - 1].position;
            this.label.position.set((rightNodePosition.x + leftNodePosition.x) * 0.5, (rightNodePosition.y + leftNodePosition.y) * 0.5);
            if (this.nodes[0].node.player) {
                this.label.setText(this.nodes[0].node.player.label);
            }
            if (!this.iSet.player) {
                this.label.alpha = 0;
            }
            else {
                this.label.alpha = 1;
                this.label.fill = Phaser.Color.getWebRGB(this.iSet.player.color);
            }
            this.nodes.forEach(function (n) {
                n.ownerLabel.alpha = 0;
            });
            this.game.add.tween(this)
                .from({ alpha: 0 }, 300, Phaser.Easing.Default, true);
        };
        /**Sorts the nodes left to right before drawing*/
        ISetView.prototype.sortNodesLeftToRight = function () {
            this.nodes.sort(function (n1, n2) {
                return n1.x <= n2.x ? -1 : 1;
            });
        };
        /**Create e very thick line that goes through all the points*/
        ISetView.prototype.createISetBMD = function () {
            this.bmd.clear();
            this.bmd.ctx.lineWidth = this.game.height * GTE.ISET_LINE_WIDTH;
            this.bmd.ctx.lineCap = "round";
            this.bmd.ctx.lineJoin = "round";
            this.bmd.ctx.strokeStyle = "#ffffff";
            this.bmd.ctx.beginPath();
            this.bmd.ctx.moveTo(this.nodes[0].x, this.nodes[0].y);
            for (var i = 1; i < this.nodes.length; i++) {
                this.bmd.ctx.lineTo(this.nodes[i].x, this.nodes[i].y);
            }
            this.bmd.ctx.stroke();
            this.loadTexture(this.bmd);
            this.game.add.existing(this);
            if (this.iSet.player) {
                this.tint = this.iSet.player.color;
            }
            else {
                this.tint = 0x000000;
            }
            this.alpha = 0.15;
        };
        ISetView.prototype.createLabel = function () {
            var rightNodePosition = this.nodes[Math.floor(this.nodes.length / 2)].position;
            var leftNodePosition = this.nodes[Math.floor(this.nodes.length / 2) - 1].position;
            this.label = this.game.add.text((rightNodePosition.x + leftNodePosition.x) * 0.5, (rightNodePosition.y + leftNodePosition.y) * 0.5, "", null);
            if (this.nodes[0].node.player) {
                this.label.setText(this.nodes[0].node.player.label);
            }
            this.label.fontSize = this.nodes[0].width * GTE.LABEL_SIZE / GTE.OVERLAY_SCALE;
            this.label.anchor.set(0.5, 0.5);
            if (!this.iSet.player) {
                this.label.alpha = 0;
            }
            else {
                this.label.fill = Phaser.Color.getWebRGB(this.iSet.player.color);
            }
        };
        ISetView.prototype.destroy = function () {
            this.bmd.destroy();
            this.bmd = null;
            this.nodes = [];
            this.nodes = null;
            this.label.destroy();
            if (this.iSet && this.iSet.nodes) {
                this.iSet.destroy();
                this.iSet = null;
            }
            _super.prototype.destroy.call(this, true);
        };
        return ISetView;
    }(Phaser.Sprite));
    GTE.ISetView = ISetView;
})(GTE || (GTE = {}));
//# sourceMappingURL=ISetView.js.map