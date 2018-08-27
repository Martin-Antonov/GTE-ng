/// <reference path="../../../../../../node_modules/phaser-ce/typescript/phaser.d.ts" />
///<reference path="../Model/StrategicForm.ts"/>
///<reference path="../Utils/SCell.ts"/>
///<reference path="../Utils/Constants.ts"/>
namespace GameTheoryExplorer {
    export class StrategicFormView {
        game: Phaser.Game;

        strategicForm: StrategicForm;
        rows: Array<string>;
        cols: Array<string>;

        group: Phaser.Group;
        cells: Array<SCell>;
        diagonalLine: Phaser.Sprite;
        p1Text: Phaser.Text;
        p2Text: Phaser.Text;

        p1Moves: Array<Phaser.Text>;
        p2Moves: Array<Phaser.Text>;

        background: Phaser.Sprite;
        zoomInIcon: Phaser.Sprite;
        zoomOutIcon: Phaser.Sprite;
        closeIcon: Phaser.Sprite;


        constructor(game: Phaser.Game, strategicForm: StrategicForm) {
            this.game = game;
            this.strategicForm = strategicForm;

            this.group = this.game.add.group();
            this.rows = strategicForm.strategyToString(strategicForm.p1Strategies);
            this.cols = strategicForm.strategyToString(strategicForm.p2Strategies);
            //--------------------------------//
            // this.rows = ["X P","X Q","Y P","Y Q","Z P","Z Q"];
            // this.cols = ["a d","a e","b d","b e","c d","c e"];
            // this.newPayoff = [
            //     [[3,4],[3,4],[2,5],[2,5],[4,5],[4,5]],
            //     [[3,4],[3,4],[2,5],[2,5],[4,5],[4,5]],
            //     [[2,3],[2,3],[2,3],[2,3],[2,3],[2,3]],
            //     [[2,3],[2,3],[2,3],[2,3],[2,3],[2,3]],
            //     [[1,3],[0,5],[1,3],[0,5],[1,3],[0,5]],
            //     [[1,3],[4,2],[1,3],[4,2],[1,3],[4,2]],
            // ];
            //------------------------------//
            this.cells = [];
            this.p1Moves = [];
            this.p2Moves = [];


            this.group.scale.set(0.3);
            this.group.position.set(this.game.width * 0.7, this.game.height * 0.1);

            let cellWidth = this.game.width * CELL_WIDTH;
            let cellStroke = cellWidth * CELL_STROKE_WIDTH;

            this.generateGrid(cellWidth, cellStroke);
            this.drawDiagonalLine(cellWidth, cellStroke);
            this.createPlayerTexts(cellWidth);
            this.createStrategiesTexts(cellWidth, cellStroke);
            this.createControlSprites();
        }

        generateGrid(cellWidth: number, cellStroke: number) {
            for (let i = 0; i < this.rows.length; i++) {
                for (let j = 0; j < this.cols.length; j++) {
                    this.cells.push(new SCell(this.game, j * (cellWidth - 0.5 * cellStroke), i * (cellWidth - 0.5 * cellStroke),
                        this.strategicForm.payoffsMatrix[i][j].outcomes[0].toString(),
                        this.strategicForm.payoffsMatrix[i][j].outcomes[1].toString(),
                        this.group));
                }
            }
        }

        drawDiagonalLine(cellWidth: number, cellStroke: number) {
            this.diagonalLine = this.game.add.sprite(0, 0, this.game.cache.getBitmapData("line"), null, this.group);
            this.diagonalLine.scale.set(cellWidth * 0.75, cellStroke * 0.5);
            this.diagonalLine.anchor.set(CELL_STROKE_WIDTH, 0.5);
            this.diagonalLine.tint = 0x000000;
            this.diagonalLine.rotation = -Math.PI * 0.75;
        }

        createPlayerTexts(cellWidth: number) {
            let diagonalWidth = cellWidth * 0.75;
            let lineWidth = diagonalWidth / Math.sqrt(2);
            this.p1Text = this.game.add.text(-0.75 * lineWidth, -0.25 * lineWidth, this.strategicForm.tree.players[1].label, null, this.group);
            this.p1Text.anchor.set(0.5, 0.5);
            this.p1Text.fontSize = diagonalWidth * PLAYER_TEXT_SIZE;
            this.p1Text.fill = Phaser.Color.getWebRGB(PLAYER_COLORS[0]);

            this.p2Text = this.game.add.text(-1 / 4 * lineWidth, -3 / 4 * lineWidth, this.strategicForm.tree.players[2].label, null, this.group);
            this.p2Text.anchor.set(0.5, 0.5);
            this.p2Text.fontSize = diagonalWidth * PLAYER_TEXT_SIZE;
            this.p2Text.fill = Phaser.Color.getWebRGB(PLAYER_COLORS[1]);
        }

        createStrategiesTexts(cellWidth: number, cellStroke: number) {
            for (let i = 0; i < this.rows.length; i++) {
                let text = this.game.add.text(-cellWidth * MOVES_OFFSET, cellWidth * i + 0.5 * cellWidth, this.rows[i], null, this.group);
                text.anchor.set(1, 0.5);
                text.fontSize = cellWidth * MOVES_TEXT_SIZE;
                text.fill = Phaser.Color.getWebRGB(PLAYER_COLORS[0]);
                text.fontStyle = "italic";
                text.fontWeight = 200;
                this.p1Moves.push(text);
            }
            for (let i = 0; i < this.cols.length; i++) {
                let text = this.game.add.text(cellWidth * i + 0.5 * cellWidth - 0.5 * i * cellStroke, 0, this.cols[i], null, this.group);
                text.anchor.set(0.5, 0.5);
                text.fontSize = cellWidth * MOVES_TEXT_SIZE;
                text.fill = Phaser.Color.getWebRGB(PLAYER_COLORS[1]);
                text.fontStyle = "italic";
                text.fontWeight = 200;
                this.p2Moves.push(text);
            }

            let maxAngle = 0;
            let shouldRotate = false;
            this.p2Moves.forEach((m: Phaser.Text) => {
                if (m.width > cellWidth) {
                    shouldRotate = true;
                    let diagonal = m.width * Math.sqrt(2);
                    let angle = Math.acos(cellWidth / diagonal);
                    if (maxAngle < angle) {
                        maxAngle = angle;
                    }
                }
            });

            if (shouldRotate) {
                this.p2Moves.forEach((m: Phaser.Text) => {
                    m.rotation = -maxAngle;
                    m.y = -m.width * 0.5 * Math.sin(maxAngle) - m.height * 0.3;
                });
            }
            else {
                this.p2Moves.forEach((m: Phaser.Text) => {
                    m.y = -m.height * 0.5;
                });
            }
        }

        createControlSprites() {
            this.background = this.game.add.sprite(this.group.x, this.group.y, this.game.cache.getBitmapData("line"));
            this.background.width = this.cols.length * this.cells[0].width * this.group.scale.x;
            this.background.height = this.rows.length * this.cells[0].height * this.group.scale.x;
            this.background.inputEnabled = true;
            this.background.input.draggable = true;
            this.background.events.onDragUpdate.add(() => {
                this.group.position = this.background.position;
            });

            this.background.events.onInputOver.add(() => {
                this.game.canvas.style.cursor = "move";
            });
            this.background.events.onInputOut.add(() => {
                this.game.canvas.style.cursor = "default";
            });

            this.zoomInIcon = this.game.add.sprite(0, (this.rows.length + 0.2) * this.cells[0].height, "zoomIn", null, this.group);
            this.zoomInIcon.scale.set(0.15);
            this.zoomInIcon.anchor.set(0, 0.5);
            this.zoomInIcon.inputEnabled = true;
            this.zoomInIcon.events.onInputDown.add(() => {
                this.group.scale.set(this.group.scale.x * 1.25);
                this.background.width = this.cols.length * this.cells[0].width * this.group.scale.x;
                this.background.height = this.rows.length * this.cells[0].height * this.group.scale.x;
            });
            this.zoomOutIcon = this.game.add.sprite(this.zoomInIcon.width, this.zoomInIcon.y, "zoomOut", null, this.group);
            this.zoomOutIcon.scale.set(0.15);
            this.zoomOutIcon.anchor.set(0,0.5);
            this.zoomOutIcon.inputEnabled = true;
            this.zoomOutIcon.events.onInputDown.add(() => {
                this.group.scale.set(this.group.scale.x * 0.8);
                this.background.width = this.cols.length * this.cells[0].width * this.group.scale.x;
                this.background.height = this.rows.length * this.cells[0].height * this.group.scale.x;
            });
            this.closeIcon = this.game.add.sprite((this.cols.length) * this.cells[0].width, this.zoomInIcon.y, "close", null, this.group);
            this.closeIcon.scale.set(0.15);
            this.closeIcon.anchor.set(1, 0.5);
            this.closeIcon.inputEnabled = true;

            this.game.world.bringToTop(this.group);

        }

        destroy() {
            this.rows = null;
            this.cols = null;
            this.group.destroy(true, false);
            this.background.destroy();
            this.p1Moves = null;
            this.p2Moves = null;
        }
    }
}
