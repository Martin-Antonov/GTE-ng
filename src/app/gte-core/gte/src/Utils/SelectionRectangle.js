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
///<reference path="Constants.ts"/>
var GTE;
(function (GTE) {
    /** A class representing the rectangle which selects vertices*/
    var SelectionRectangle = /** @class */ (function (_super) {
        __extends(SelectionRectangle, _super);
        function SelectionRectangle(game) {
            var _this = _super.call(this, game, 0, 0) || this;
            _this.loadTexture(_this.game.cache.getBitmapData("line"));
            _this.start = new Phaser.Point();
            _this.tint = GTE.SELECTION_INNER_COLOR;
            _this.alpha = 0;
            _this.active = true;
            //when we click and hold, we reset the rectangle.
            _this.game.input.onDown.add(function () {
                if (_this.active) {
                    _this.game.canvas.style.cursor = "crosshair";
                    _this.width = 0;
                    _this.height = 0;
                    _this.start.x = _this.game.input.activePointer.position.x;
                    _this.start.y = _this.game.input.activePointer.position.y;
                    _this.position = _this.start;
                    _this.alpha = 0.3;
                }
            }, _this);
            //When we release, reset the rectangle
            _this.game.input.onUp.add(function () {
                _this.game.canvas.style.cursor = "default";
                if (_this.active) {
                    _this.alpha = 0;
                    _this.width = 0;
                    _this.height = 0;
                }
            });
            //On dragging, update the transform of the rectangle*/
            _this.game.input.addMoveCallback(_this.onDrag, _this);
            _this.game.add.existing(_this);
            return _this;
        }
        /** The method which resizes the rectangle as we drag*/
        SelectionRectangle.prototype.onDrag = function () {
            if (this.game.input.activePointer.isDown && this.active) {
                this.height = this.game.input.activePointer.y - this.start.y;
                this.width = this.game.input.activePointer.x - this.start.x;
            }
        };
        return SelectionRectangle;
    }(Phaser.Sprite));
    GTE.SelectionRectangle = SelectionRectangle;
})(GTE || (GTE = {}));
//# sourceMappingURL=SelectionRectangle.js.map