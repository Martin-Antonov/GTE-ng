///<reference path="Node.ts"/>
///<reference path="../../lib/mathjs.d.ts"/>
var GTE;
(function (GTE) {
    /**The class Move which has from, to, label and probability */
    var Move = /** @class */ (function () {
        function Move(from, to) {
            this.from = from;
            this.to = to;
            this.label = "";
        }
        /**Converts the Move to a labeled Move */
        Move.prototype.convertToLabeled = function (label) {
            this.label = label || null;
            this.probability = null;
        };
        /**Converts to a chance move with given probabilities */
        Move.prototype.convertToChance = function (probability) {
            this.probability = probability || 0;
            this.label = null;
        };
        /**Resets the move */
        Move.prototype.convertToDefault = function () {
            this.probability = null;
            this.label = null;
        };
        /**Returns the text of the probability, depending on the current mode*/
        Move.prototype.getProbabilityText = function (fractional) {
            if (fractional && this.probability !== 1 && this.probability !== 0) {
                return math.format(math.fraction(this.probability));
            }
            else {
                return math.format(math.round(math.number(this.probability), 2));
            }
        };
        /**Destroy method ensures there are no memory-leaks */
        Move.prototype.destroy = function () {
            this.from.childrenMoves.splice(this.from.childrenMoves.indexOf(this), 1);
            this.label = null;
            this.probability = null;
        };
        return Move;
    }());
    GTE.Move = Move;
})(GTE || (GTE = {}));
//# sourceMappingURL=Move.js.map