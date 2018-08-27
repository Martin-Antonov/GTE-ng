///<reference path="TreeController.ts"/>
///<reference path="../Model/Tree.ts"/>
///<reference path="../View/TreeView.ts"/>
///<reference path="../Utils/TreeParser.ts"/>
///<reference path="../View/NodeView.ts"/>
namespace GameTheoryExplorer {

    /**A class for handling the Undo/Redo functionality */
    export class UndoRedoController {
        treeController: TreeController;
        treesList: Array<Tree>;
        currentTreeIndex: number;
        treeParser: TreeParser;
        treeCoordinatesList: Array<Array<{ x: number, y: number }>>;

        constructor(treeController: TreeController) {
            this.treeController = treeController;
            this.treesList = [];
            this.treeCoordinatesList = [];
            this.currentTreeIndex = 0;
            this.treeParser = new TreeParser();
            this.treesList.push(this.treeParser.parse(this.treeParser.stringify(this.treeController.tree)));

        }

        /**Undo-Redo method */
        changeTreeInController(undo: boolean) {
            if (undo && this.currentTreeIndex - 1 >= 0) {
                this.currentTreeIndex--;
            }
            else if (!undo && this.currentTreeIndex + 1 < this.treesList.length) {
                this.currentTreeIndex++;
            }
            else {
                return;
            }
            let newTree = this.treeParser.parse(this.treeParser.stringify(this.treesList[this.currentTreeIndex]));

            this.treeController.reloadTreeFromJSON(newTree, this.treeCoordinatesList[this.currentTreeIndex]);
            this.resetUndoReddoButtons();
        }

        saveNewTree(saveCoordinates?: boolean) {
            this.treesList.splice(this.currentTreeIndex + 1, this.treesList.length);
            this.treesList.push(this.treeParser.parse(this.treeParser.stringify(this.treeController.tree)));
            if (saveCoordinates) {
                const coordsArray = [];
                this.treeController.treeView.nodes.forEach((n: NodeView) => {
                    coordsArray.push({x: n.position.x, y: n.position.y});
                });
                this.treeCoordinatesList[this.currentTreeIndex + 1] = coordsArray;
            }
            this.resetUndoReddoButtons();
            this.currentTreeIndex++;
        }

        /**A method which resets the top-menu undo-redo buttons*/
        private resetUndoReddoButtons() {
            if (this.currentTreeIndex === 0) {
                // $("#undo-wrapper").css({opacity: 0.3});
            }
            else {
                // $("#undo-wrapper").css({opacity: 1});
            }
            if (this.currentTreeIndex === this.treesList.length - 1) {
                // $("#redo-wrapper").css({opacity: 0.3});
            }
            else {
                // $("#redo-wrapper").css({opacity: 1});
            }
        }
    }
}
