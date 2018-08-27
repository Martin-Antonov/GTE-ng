///<reference path="../Utils/Constants.ts"/>
var GTE;
(function (GTE) {
    /**The class Payoff which is an array of numbers*/
    var Payoffs = /** @class */ (function () {
        function Payoffs(payoffs) {
            this.playersCount = 2;
            if (payoffs) {
                this.outcomes = payoffs.slice(0);
            }
            else {
                this.outcomes = [0, 0, 0, 0];
            }
        }
        /**A method converting text payoffs from the input field, and placing them to the corresponding leaves*/
        Payoffs.prototype.saveFromString = function (payoffs) {
            var payoffsAsStringArray = payoffs.split(" ");
            for (var i = 0; i < payoffsAsStringArray.length; i++) {
                if (i > 3) {
                    return;
                }
                var currentPayoff = parseFloat(payoffsAsStringArray[i]);
                if (currentPayoff) {
                    this.outcomes[i] = currentPayoff;
                }
            }
        };
        /**A method for setting random payoffs to leaves*/
        Payoffs.prototype.setRandomPayoffs = function () {
            for (var i = 0; i < this.outcomes.length; i++) {
                this.outcomes[i] = Math.floor(Math.random() * GTE.MAX_RANDOM_PAYOFFS);
            }
        };
        /**A method for changing the number of players in the game*/
        Payoffs.prototype.setPlayersCount = function (playersCount) {
            this.playersCount = playersCount;
        };
        /**A method for converting the game into a zero-sum game*/
        Payoffs.prototype.convertToZeroSum = function () {
            if (this.playersCount === 2) {
                this.outcomes[1] = -this.outcomes[0];
            }
        };
        /**A helper method for the functionality of the strategic form*/
        Payoffs.prototype.add = function (payoffsToAdd) {
            for (var i = 0; i < this.outcomes.length; i++) {
                this.outcomes[i] += payoffsToAdd[i];
            }
        };
        /**A helper method for the visual representation of outcomes. Uses an external library mathjs.*/
        Payoffs.prototype.round = function () {
            for (var i = 0; i < this.outcomes.length; i++) {
                this.outcomes[i] = parseFloat(math.format(math.round(this.outcomes[i], 2)));
            }
        };
        /**A method for printing and visualizing payoffs*/
        Payoffs.prototype.toString = function () {
            var numbersToShow = [];
            for (var i = 0; i < this.playersCount; i++) {
                numbersToShow.push(this.outcomes[i]);
            }
            return numbersToShow.join(" ");
        };
        Payoffs.prototype.destroy = function () {
            this.outcomes = null;
        };
        return Payoffs;
    }());
    GTE.Payoffs = Payoffs;
})(GTE || (GTE = {}));
//# sourceMappingURL=Payoffs.js.map