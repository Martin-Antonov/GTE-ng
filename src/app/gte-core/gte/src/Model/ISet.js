/// <reference path = "../../lib/phaser.d.ts"/>
///<reference path="Player.ts"/>
///<reference path="Node.ts"/>
var GTE;
(function (GTE) {
    /**The class that represents the ISet. The ISet has player, array storing all nodes, and a label */
    var ISet = /** @class */ (function () {
        function ISet(player, nodes) {
            var _this = this;
            this.player = player;
            this.nodes = [];
            if (nodes) {
                nodes.forEach(function (n) {
                    _this.addNode(n);
                    if (_this.player) {
                        n.convertToLabeled(_this.player);
                    }
                });
            }
        }
        /** Adds a node to the current information set (currently not used)*/
        ISet.prototype.addNode = function (node) {
            if (this.player && node.player && node.player !== this.player) {
                throw new Error("ISet player is different from node player!");
            }
            if (this.player && !node.player) {
                node.player = this.player;
            }
            if (this.nodes.indexOf(node) === -1) {
                this.nodes.push(node);
                node.iSet = this;
            }
        };
        /** Removes a node from the information set*/
        ISet.prototype.removeNode = function (node) {
            if (this.nodes.indexOf(node) !== -1) {
                this.nodes.splice(this.nodes.indexOf(node), 1);
                node.iSet = null;
            }
        };
        /**The destroy method ensures that there are no memory-leaks */
        ISet.prototype.destroy = function () {
            this.player = null;
            this.nodes.forEach(function (n) {
                n.iSet = null;
            });
            this.nodes = [];
            this.nodes = null;
        };
        return ISet;
    }());
    GTE.ISet = ISet;
})(GTE || (GTE = {}));
//# sourceMappingURL=ISet.js.map