var GTE;
(function (GTE) {
    /** A class that stores the level height and initial width of whe tree
     * All properties are given a fractions of the game width and height!*/
    var TreeViewProperties = /** @class */ (function () {
        function TreeViewProperties(levelHeight, initialLevelDistance) {
            this.levelHeight = levelHeight;
            this.treeWidth = initialLevelDistance;
            this.zeroSumOn = false;
            this.fractionOn = true;
        }
        return TreeViewProperties;
    }());
    GTE.TreeViewProperties = TreeViewProperties;
})(GTE || (GTE = {}));
//# sourceMappingURL=TreeViewProperties.js.map