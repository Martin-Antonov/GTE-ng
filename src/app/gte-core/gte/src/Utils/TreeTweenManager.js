///<reference path="../../lib/phaser.d.ts"/>
///<reference path="../View/NodeView.ts"/>
///<reference path="../View/ISetView.ts"/>
///<reference path="../View/MoveView.ts"/>
///<reference path="Constants.ts"/>
///<reference path="../View/TreeViewProperties.ts"/>
var GTE;
(function (GTE) {
    var TreeTweenManager = /** @class */ (function () {
        function TreeTweenManager(game, properties) {
            this.properties = properties;
            this.game = game;
        }
        TreeTweenManager.prototype.startTweens = function (nodes, moves) {
            var _this = this;
            for (var i = 0; i < this.oldCoordinates.length; i++) {
                var clonedCoords = this.oldCoordinates[i];
                var nodeV = nodes[i];
                this.game.add.tween(nodeV).from({
                    x: clonedCoords.x,
                    y: clonedCoords.y
                }, GTE.TREE_TWEEN_DURATION, Phaser.Easing.Quartic.Out, true)
                    .onUpdateCallback(function () {
                    nodes.forEach(function (n) {
                        n.resetNodeDrawing();
                    });
                    moves.forEach(function (m) {
                        m.updateMovePosition();
                        m.updateLabel(_this.properties.fractionOn);
                    });
                }, this);
            }
        };
        return TreeTweenManager;
    }());
    GTE.TreeTweenManager = TreeTweenManager;
})(GTE || (GTE = {}));
//# sourceMappingURL=TreeTweenManager.js.map