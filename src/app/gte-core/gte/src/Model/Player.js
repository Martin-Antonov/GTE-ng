var GTE;
(function (GTE) {
    /**The class Player that stores the id, label and colour of the player */
    var Player = /** @class */ (function () {
        function Player(id, label, color) {
            this.id = id || 0;
            this.label = label || "";
            this.color = color || 0x000000;
        }
        Player.prototype.destroy = function () {
            this.label = null;
            this.id = null;
        };
        return Player;
    }());
    GTE.Player = Player;
})(GTE || (GTE = {}));
//# sourceMappingURL=Player.js.map