///<reference path="Tree.ts"/>
///<reference path="Node.ts"/>
///<reference path="Move.ts"/>
///<reference path="../Utils/Constants.ts"/>
///<reference path="Payoffs.ts"/>
var GTE;
(function (GTE) {
    /**The class which will calculate the strategic form from the given tree */
    var StrategicForm = /** @class */ (function () {
        function StrategicForm(tree) {
            this.tree = tree;
            this.generateStrategicForm();
        }
        //region Generate strategies
        /**Generates the strategic form, which is stored in two arrays of strategies for P1 and P2*/
        StrategicForm.prototype.generateStrategicForm = function () {
            var _this = this;
            this.checkStrategicFormPossible();
            // The order of information sets is breadth-first. If at some point we wish to change this - swap with dfs.
            var nodes = this.tree.BFSOnTree();
            var p1InfoSets = [];
            var p2InfoSets = [];
            //Get all P1 and P2 information sets and singletons separated from the DFS order.
            nodes.forEach(function (n) {
                if (n.player === _this.tree.players[1]) {
                    if (n.iSet && p1InfoSets.indexOf(n.iSet) === -1) {
                        p1InfoSets.push(n.iSet);
                    }
                    else if (!n.iSet) {
                        p1InfoSets.push(n);
                    }
                }
                else if (n.player === _this.tree.players[2]) {
                    if (n.iSet && p2InfoSets.indexOf(n.iSet) === -1) {
                        p2InfoSets.push(n.iSet);
                    }
                    else if (!n.iSet) {
                        p2InfoSets.push(n);
                    }
                }
            });
            this.p1Strategies = [];
            this.p2Strategies = [];
            this.generateStrategies(p1InfoSets);
            this.generateStrategies(p2InfoSets);
            this.generatePayoffs();
        };
        /**A method which checks whether the conditions for generating a strategic form are kept*/
        StrategicForm.prototype.checkStrategicFormPossible = function () {
            if (this.tree.players.length !== 3) {
                throw new Error(GTE.STRATEGIC_PLAYERS_ERROR_TEXT);
            }
            if (!this.tree.checkAllNodesLabeled()) {
                throw new Error(GTE.STRATEGIC_NOT_LABELED_ERROR_TEXT);
            }
            this.tree.perfectRecallCheck();
        };
        /**A method which generates the strategies for a specific player, given his collection of iSets*/
        StrategicForm.prototype.generateStrategies = function (iSets) {
            var currentStrategy = [];
            this.recurseStrategies(iSets, 0, currentStrategy);
        };
        /**A method for the recursive generation of strategies*/
        // We create combinations of all moves, given their specific slot (index) which corresponds to the current
        // node or an information set we are looking at. "Strategy" stores the moves that are played in the recursion.
        StrategicForm.prototype.recurseStrategies = function (iSets, index, strategy) {
            // If we have reached the last slot for the combinations, save it and go back in the recursion.
            if (index === iSets.length) {
                if (iSets[0] && iSets[0].player === this.tree.players[1]) {
                    this.p1Strategies.push(strategy.slice(0));
                }
                else if (iSets[0] && iSets[0].player === this.tree.players[2]) {
                    this.p2Strategies.push(strategy.slice(0));
                }
                return;
            }
            //Depending on whether the current iSet is a singleton (node) or not, we take the moves and save the nodes
            // of the iSet in an array
            var currentISet;
            var moves = [];
            if (iSets[index] instanceof GTE.Node) {
                currentISet = [iSets[index]];
                moves = currentISet[0].childrenMoves;
            }
            else if (iSets[index] instanceof GTE.ISet) {
                currentISet = iSets[index].nodes;
                moves = currentISet[0].childrenMoves;
            }
            // We perform a check of whether the node is reachable from the previously played moves by the player
            var isReachable = false;
            if (index !== 0) {
                var nonNullIndex = this.findFirstNonNullIndex(strategy, index);
                var nodesToCheckReachability = [];
                var lastEarlierMove = strategy[nonNullIndex];
                if (lastEarlierMove.from.iSet === null) {
                    nodesToCheckReachability = [lastEarlierMove.to];
                }
                else {
                    var earlierMoveIndex = lastEarlierMove.from.childrenMoves.indexOf(lastEarlierMove);
                    for (var i = 0; i < lastEarlierMove.from.iSet.nodes.length; i++) {
                        nodesToCheckReachability.push(lastEarlierMove.from.iSet.nodes[i].childrenMoves[earlierMoveIndex].to);
                    }
                }
                isReachable = this.isReachable(currentISet, nodesToCheckReachability);
            }
            // If the move is the first that a player has played or is reachable, we save it to "strategies" and move on
            if (this.isFirstMove(currentISet[0]) || isReachable) {
                for (var i = 0; i < moves.length; i++) {
                    strategy.push(moves[i]);
                    this.recurseStrategies(iSets, index + 1, strategy);
                    strategy.pop();
                }
            }
            // If the move is not reachable, we push "null" which will later be transformed into a "*"
            else {
                strategy.push(null);
                this.recurseStrategies(iSets, index + 1, strategy);
                strategy.pop();
            }
        };
        /**A helper method for the recursion*/
        StrategicForm.prototype.isFirstMove = function (node) {
            var current = node.parent;
            while (current) {
                if (current.player === node.player) {
                    return false;
                }
                current = current.parent;
            }
            return true;
        };
        /**A helper method for the recursion*/
        StrategicForm.prototype.findFirstNonNullIndex = function (strategy, index) {
            for (var i = index - 1; i >= 0; i--) {
                if (strategy[i]) {
                    return i;
                }
            }
            return 0;
        };
        /**A helper method to check whether a collection of nodes is reachable from another collection*/
        // "From" is the lower (in terms of the tree) move
        StrategicForm.prototype.isReachable = function (from, to) {
            for (var i = 0; i < from.length; i++) {
                var fromNode = from[i];
                for (var j = 0; j < to.length; j++) {
                    var toNode = to[j];
                    if (this.checkTwoNodesReachable(fromNode, toNode)) {
                        return true;
                    }
                }
            }
            return false;
        };
        /**A helper method which checks whether a given node is reachable from another given node (used above)*/
        StrategicForm.prototype.checkTwoNodesReachable = function (from, to) {
            // current is the node of the move we start from
            if (from === to) {
                return true;
            }
            var current = from;
            while (current.parent) {
                if (current.parent === to) {
                    return true;
                }
                current = current.parent;
            }
            return false;
        };
        //endregion
        //region Payoff matrices generation
        /**A method for generating the payoffs matrices, to be used in the View. Called after strat form is done*/
        StrategicForm.prototype.generatePayoffs = function () {
            var _this = this;
            var rows = this.p1Strategies.length;
            var cols = this.p2Strategies.length;
            if (rows === 0) {
                rows++;
            }
            if (cols === 0) {
                cols++;
            }
            this.payoffsMatrix = [];
            for (var i = 0; i < rows; i++) {
                this.payoffsMatrix[i] = [];
                for (var j = 0; j < cols; j++) {
                    this.payoffsMatrix[i][j] = new GTE.Payoffs();
                }
            }
            var leaves = this.tree.getLeaves();
            leaves.forEach(function (leaf) {
                _this.getMovesPathToRoot(leaf);
                _this.reachableRows = [];
                _this.reachableCols = [];
                // Vector - either a row or a column
                _this.getReachableVectors(_this.reachableRows, _this.p1Strategies, _this.movesToReachLeafP1);
                _this.getReachableVectors(_this.reachableCols, _this.p2Strategies, _this.movesToReachLeafP2);
                var payoffsToAdd = leaf.payoffs.outcomes.slice(0);
                for (var i = 0; i < payoffsToAdd.length; i++) {
                    payoffsToAdd[i] = payoffsToAdd[i] * _this.probabilityPerPath;
                }
                // this.currentPathToString(leaf);
                var rowsLength = _this.reachableRows.length;
                var colsLength = _this.reachableCols.length;
                if (rowsLength === 0) {
                    rowsLength++;
                }
                if (colsLength === 0) {
                    colsLength++;
                }
                for (var i = 0; i < rowsLength; i++) {
                    for (var j = 0; j < colsLength; j++) {
                        if (_this.reachableRows.length !== 0 && _this.reachableCols.length !== 0) {
                            _this.payoffsMatrix[_this.reachableRows[i]][_this.reachableCols[j]].add(payoffsToAdd);
                        }
                        else if (_this.reachableRows.length !== 0 && _this.reachableCols.length === 0) {
                            _this.payoffsMatrix[_this.reachableRows[i]][j].add(payoffsToAdd);
                        }
                        else if (_this.reachableRows.length === 0 && _this.reachableCols.length !== 0) {
                            _this.payoffsMatrix[i][_this.reachableCols[j]].add(payoffsToAdd);
                        }
                        else {
                            _this.payoffsMatrix[i][j].add(payoffsToAdd);
                        }
                    }
                }
            }, this);
            for (var i = 0; i < this.payoffsMatrix.length; i++) {
                for (var j = 0; j < this.payoffsMatrix[0].length; j++) {
                    this.payoffsMatrix[i][j].round();
                }
            }
        };
        /**A helper method for the generation of payoffs matrices*/
        StrategicForm.prototype.getMovesPathToRoot = function (leaf) {
            this.movesToReachLeafP1 = [];
            this.movesToReachLeafP2 = [];
            this.probabilityPerPath = 1;
            var current = leaf;
            while (current.parent) {
                if (current.parent.type === GTE.NodeType.CHANCE) {
                    this.probabilityPerPath *= current.parentMove.probability;
                }
                else if (current.parent.type === GTE.NodeType.OWNED) {
                    if (current.parent.player === this.tree.players[1]) {
                        this.movesToReachLeafP1.push(current.parentMove);
                    }
                    else if (current.parent.player === this.tree.players[2]) {
                        this.movesToReachLeafP2.push(current.parentMove);
                    }
                }
                current = current.parent;
            }
        };
        /**A helper method for the generation of payoffs matrices*/
        StrategicForm.prototype.getReachableVectors = function (vector, allStrategies, strategiesOnPath) {
            for (var i = 0; i < allStrategies.length; i++) {
                var currentStrategy = allStrategies[i];
                var containsAllOnPath = true;
                for (var j = 0; j < strategiesOnPath.length; j++) {
                    var moveOnPath = strategiesOnPath[j];
                    if (this.checkUnreachableMove(currentStrategy, moveOnPath)) {
                        containsAllOnPath = false;
                        break;
                    }
                }
                if (containsAllOnPath) {
                    vector.push(i);
                }
            }
            if (vector.length === 0) {
                for (var i = 0; i < allStrategies.length; i++) {
                    vector.push(i);
                }
            }
        };
        /**A helper method for the getReachableVectors method*/
        StrategicForm.prototype.checkUnreachableMove = function (strategy, move) {
            if (strategy.indexOf(move) !== -1) {
                return false;
            }
            else if (move.from.iSet === null) {
                return true;
            }
            else {
                var moveIndex = move.from.childrenMoves.indexOf(move);
                var iSetNodes = move.from.iSet.nodes;
                for (var i = 0; i < iSetNodes.length; i++) {
                    if (strategy.indexOf(iSetNodes[i].childrenMoves[moveIndex]) !== -1) {
                        return false;
                    }
                }
                return true;
            }
        };
        //endregion
        StrategicForm.prototype.strategyToString = function (strategies) {
            if (strategies.length === 0) {
                return [" "];
            }
            var strategyAsString = [];
            for (var i = 0; i < strategies.length; i++) {
                var str = "";
                for (var j = 0; j < strategies[i].length; j++) {
                    var current = strategies[i][j];
                    if (current) {
                        str += current.label + GTE.STRATEGIC_FORM_DELIMITER;
                    }
                    else {
                        str += "*" + GTE.STRATEGIC_FORM_DELIMITER;
                    }
                }
                strategyAsString.push(str.substring(0, str.length - 1));
            }
            return strategyAsString;
        };
        // For debugging purposes
        StrategicForm.prototype.currentPathToString = function (leaf) {
            var result = "" + leaf.payoffs.outcomes + "-> ";
            this.movesToReachLeafP1.forEach(function (m) {
                result += m.label + " ";
            });
            result += "|| ";
            this.movesToReachLeafP2.forEach(function (m) {
                result += m.label + " ";
            });
            result += "\nReachable Rows: " + this.reachableRows.join(",");
            result += "\nReachable Cols: " + this.reachableCols.join(",");
            console.log(result);
        };
        StrategicForm.prototype.destroy = function () {
            this.p1Strategies = null;
            this.p2Strategies = null;
        };
        return StrategicForm;
    }());
    GTE.StrategicForm = StrategicForm;
})(GTE || (GTE = {}));
//# sourceMappingURL=StrategicForm.js.map