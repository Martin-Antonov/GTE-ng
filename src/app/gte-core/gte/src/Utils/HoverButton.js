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
/// <reference path = "../../lib/phaser.d.ts"/>"/>
var GTE;
(function (GTE) {
    var HoverButton = /** @class */ (function (_super) {
        __extends(HoverButton, _super);
        function HoverButton(game, group, key, circleColor, iconColor) {
            var _this = _super.call(this, game, 0, 0, "") || this;
            _this.anchor.set(0.5, 0.5);
            _this.width = 330;
            _this.height = 330;
            _this.active = false;
            _this.hovered = false;
            _this.buttonKey = key;
            _this.inputEnabled = true;
            _this.circle = _this.game.add.sprite(0, 0, _this.game.cache.getBitmapData("hover-circle"));
            _this.circle.position = _this.position;
            _this.circle.tint = circleColor;
            _this.circle.anchor.set(0.5, 0.5);
            _this.icon = _this.game.add.sprite(0, 0, key);
            _this.icon.anchor.set(0.5, 0.5);
            _this.icon.position = _this.position;
            if (iconColor) {
                _this.icon.tint = iconColor;
            }
            _this.events.onInputOver.add(function () {
                _this.hovered = true;
            });
            _this.events.onInputOut.add(function () {
                _this.hovered = false;
            });
            _this.input.priorityID = 200;
            // this.setHidden();
            group.add(_this);
            group.add(_this.circle);
            group.add(_this.icon);
            _this.bringToTop();
            return _this;
        }
        HoverButton.prototype.setInactive = function () {
            this.active = false;
            this.circle.alpha = 0.2;
            this.icon.alpha = 1;
            if (this.icon.tint !== 0xffffff) {
                this.icon.alpha = 0.2;
            }
            this.inputEnabled = false;
        };
        HoverButton.prototype.setActive = function () {
            this.active = true;
            this.circle.alpha = 1;
            this.icon.alpha = 1;
            this.inputEnabled = true;
            this.input.priorityID = 200;
        };
        HoverButton.prototype.setHidden = function () {
            this.active = false;
            this.circle.alpha = 0;
            this.icon.alpha = 0;
            this.inputEnabled = false;
        };
        HoverButton.prototype.destroy = function () {
            this.circle.destroy();
            this.circle = null;
            this.icon.destroy();
            this.icon = null;
            _super.prototype.destroy.call(this);
        };
        return HoverButton;
    }(Phaser.Sprite));
    GTE.HoverButton = HoverButton;
})(GTE || (GTE = {}));
//# sourceMappingURL=HoverButton.js.map