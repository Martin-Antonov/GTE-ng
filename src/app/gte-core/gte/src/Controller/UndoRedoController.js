///<reference path="TreeController.ts"/>
///<reference path="../Model/Tree.ts"/>
///<reference path="../View/TreeView.ts"/>
///<reference path="../Utils/TreeParser.ts"/>
///<reference path="../View/NodeView.ts"/>
var GTE;
(function (GTE) {
    /**A class for handling the Undo/Redo functionality */
    var UndoRedoController = /** @class */ (function () {
        function UndoRedoController(treeController) {
            this.treeController = treeController;
            this.treesList = [];
            this.treeCoordinatesList = [];
            this.currentTreeIndex = 0;
            this.treeParser = new GTE.TreeParser();
            this.treesList.push(this.treeParser.parse(this.treeParser.stringify(this.treeController.tree)));
        }
        /**Undo-Redo method */
        UndoRedoController.prototype.changeTreeInController = function (undo) {
            if (undo && this.currentTreeIndex - 1 >= 0) {
                this.currentTreeIndex--;
            }
            else if (!undo && this.currentTreeIndex + 1 < this.treesList.length) {
                this.currentTreeIndex++;
            }
            else {
                return;
            }
            var newTree = this.treeParser.parse(this.treeParser.stringify(this.treesList[this.currentTreeIndex]));
            this.treeController.reloadTreeFromJSON(newTree, this.treeCoordinatesList[this.currentTreeIndex]);
            this.resetUndoReddoButtons();
        };
        UndoRedoController.prototype.saveNewTree = function (saveCoordinates) {
            this.treesList.splice(this.currentTreeIndex + 1, this.treesList.length);
            this.treesList.push(this.treeParser.parse(this.treeParser.stringify(this.treeController.tree)));
            if (saveCoordinates) {
                var coordsArray_1 = [];
                this.treeController.treeView.nodes.forEach(function (n) {
                    coordsArray_1.push({ x: n.position.x, y: n.position.y });
                });
                this.treeCoordinatesList[this.currentTreeIndex + 1] = coordsArray_1;
            }
            this.resetUndoReddoButtons();
            this.currentTreeIndex++;
        };
        /**A method which resets the top-menu undo-redo buttons*/
        UndoRedoController.prototype.resetUndoReddoButtons = function () {
            if (this.currentTreeIndex === 0) {
                $("#undo-wrapper").css({ opacity: 0.3 });
            }
            else {
                $("#undo-wrapper").css({ opacity: 1 });
            }
            if (this.currentTreeIndex === this.treesList.length - 1) {
                $("#redo-wrapper").css({ opacity: 0.3 });
            }
            else {
                $("#redo-wrapper").css({ opacity: 1 });
            }
        };
        return UndoRedoController;
    }());
    GTE.UndoRedoController = UndoRedoController;
})(GTE || (GTE = {}));
//# sourceMappingURL=UndoRedoController.js.map