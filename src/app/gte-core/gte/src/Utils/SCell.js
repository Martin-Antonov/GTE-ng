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
///<reference path="../../lib/phaser.d.ts"/>
var GTE;
(function (GTE) {
    var SCell = /** @class */ (function (_super) {
        __extends(SCell, _super);
        function SCell(game, x, y, p1Payoff, p2Payoff, group) {
            var _this = _super.call(this, game, x, y, game.cache.getBitmapData("cell")) || this;
            group.add(_this);
            _this.game = game;
            _this.anchor.set(0, 0);
            _this.p1Text = _this.game.add.text(_this.position.x + _this.width * 0.1, _this.position.y + _this.width * 0.9, p1Payoff, null);
            _this.p1Text.anchor.set(0, 1);
            _this.p1Text.fontSize = _this.width * GTE.CELL_NUMBER_SIZE;
            _this.p1Text.fontWeight = 100;
            _this.p1Text.fill = Phaser.Color.getWebRGB(GTE.PLAYER_COLORS[0]);
            _this.p2Text = _this.game.add.text(_this.position.x + _this.width * 0.9, _this.position.y + _this.width * 0.1, p2Payoff, null);
            _this.p2Text.anchor.set(1, 0);
            _this.p2Text.fontSize = _this.width * GTE.CELL_NUMBER_SIZE;
            _this.p2Text.fontWeight = 100;
            _this.p2Text.fill = Phaser.Color.getWebRGB(GTE.PLAYER_COLORS[1]);
            group.addMultiple([_this.p1Text, _this.p2Text]);
            return _this;
        }
        return SCell;
    }(Phaser.Sprite));
    GTE.SCell = SCell;
})(GTE || (GTE = {}));
//# sourceMappingURL=SCell.js.map