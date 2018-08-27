/// <reference path="../../../../../../node_modules/phaser-ce/typescript/phaser.d.ts" />"/>
///<reference path="../Controller/UserActionController.ts"/>
///<reference path="../View/NodeView.ts"/>
///<reference path="../View/ISetView.ts"/>
///<reference path="../Utils/HoverButton.ts"/>

namespace GameTheoryExplorer {

  export class HoverMenuController {
    game: Phaser.Game;
    userActionController: UserActionController;

    plusButton: HoverButton;
    minusButton: HoverButton;
    linkButton: HoverButton;
    unlinkButton: HoverButton;
    cutButton: HoverButton;
    player1Button: HoverButton;
    player2Button: HoverButton;
    player3Button: HoverButton;
    player4Button: HoverButton;
    chancePlayerButton: HoverButton;

    buttonsGroup: Phaser.Group;
    buttonsArray: Array<HoverButton>;
    private buttonWidth: number;
    menuTween: Phaser.Tween;

    private previouslyHoveredSprite: Phaser.Sprite;
    selectedNodesSprites: Array<NodeView>;

    constructor(game: Phaser.Game, userActionController: UserActionController) {
      this.game = game;
      this.userActionController = userActionController;

      this.buttonsGroup = this.game.add.group();
      this.buttonsGroup.name = 'hoverMenu';
      this.createButtonSprites();
      this.setButtonFunctionality();

      this.buttonWidth = this.plusButton.width;

      const nodeWidth = this.userActionController.treeController.treeView.nodes[0].width;
      this.repositionButtonSprites(nodeWidth);

      this.menuTween = this.game.add.tween(this.buttonsGroup);
      this.hideMenu();

      // If a node or an iSet is hovered, we start the hover menu.
      this.userActionController.treeController.hoverSignal.add(function () {
        this.triggerMenu(arguments[0]);
      }, this);

      // Whenever a key on the keyobard is pressed, we remove the menu
      this.game.input.keyboard.onDownCallback = () => {
        this.hideMenu();
      };

      // Remove the menu, whenever someone clicks on the background (on anything without an active input)
      this.userActionController.backgroundInputSprite.events.onInputDown.add(() => {
        this.hideMenu();
      });

      // If clicking on the top menu, hide the hover menu
      // setTimeout(()=>{
      //     $("#top-container").on("click",()=>{
      //        this.hideMenu();
      //     });
      // },300);


      this.selectedNodesSprites = this.userActionController.selectedNodes;
    }

    private createButtonSprites() {
      this.plusButton = new HoverButton(this.game, this.buttonsGroup, 'plus', PLUS_BUTTON_COLOR);
      this.minusButton = new HoverButton(this.game, this.buttonsGroup, 'minus', MINUS_BUTTON_COLOR);
      this.linkButton = new HoverButton(this.game, this.buttonsGroup, 'link', LINK_BUTTON_COLOR);
      this.unlinkButton = new HoverButton(this.game, this.buttonsGroup, 'unlink', UNLINK_BUTTON_COLOR);
      this.cutButton = new HoverButton(this.game, this.buttonsGroup, 'scissors', CUT_BUTTON_COLOR);
      this.player1Button = new HoverButton(this.game, this.buttonsGroup, 'player', PLAYER_BUTTON_COLOR, PLAYER_COLORS[0]);
      this.player2Button = new HoverButton(this.game, this.buttonsGroup, 'player', PLAYER_BUTTON_COLOR, PLAYER_COLORS[1]);
      this.player3Button = new HoverButton(this.game, this.buttonsGroup, 'player', PLAYER_BUTTON_COLOR, PLAYER_COLORS[2]);
      this.player4Button = new HoverButton(this.game, this.buttonsGroup, 'player', PLAYER_BUTTON_COLOR, PLAYER_COLORS[3]);
      this.chancePlayerButton = new HoverButton(this.game, this.buttonsGroup, 'chance', PLAYER_BUTTON_COLOR, 0x111111);

      this.buttonsArray = [this.plusButton, this.minusButton, this.linkButton, this.unlinkButton,
        this.cutButton, this.player1Button, this.player2Button, this.player3Button, this.player4Button, this.chancePlayerButton];
    }

    private repositionButtonSprites(nodeWidth: number) {
      const buttonsScale = nodeWidth * 0.001;
      this.buttonsGroup.scale.set(buttonsScale);
      this.plusButton.position.set(-0.5 * this.buttonWidth, 0);
      this.minusButton.position.set(0.5 * this.buttonWidth, 0);

      this.repositionPlayerButtonSprites();

      this.unlinkButton.position.set(0, 2 * this.buttonWidth);
      this.linkButton.position.set(-this.buttonWidth, 2 * this.buttonWidth);
      this.cutButton.position.set(this.buttonWidth, 2 * this.buttonWidth);
    }

    private repositionPlayerButtonSprites() {
      const playersCount = this.userActionController.treeController.tree.players.length;

      this.player1Button.position.set(-0.5 * (playersCount - 1) * this.buttonWidth, this.buttonWidth);
      this.player2Button.position.set(-0.5 * (playersCount - 3) * this.buttonWidth, this.buttonWidth);
      this.player3Button.position.set(0.5 * (5 - playersCount) * this.buttonWidth, this.buttonWidth);
      this.player4Button.position.set(this.buttonWidth, this.buttonWidth);
      this.chancePlayerButton.position.set(0.5 * (playersCount - 1) * this.buttonWidth, this.buttonWidth);
    }

    private setButtonFunctionality() {
      // Add node button functionality
      this.plusButton.events.onInputDown.add(() => {
        if (this.buttonsGroup.alpha === 1) {
          if (this.previouslyHoveredSprite instanceof NodeView && this.selectedNodesSprites.length !== 0) {
            this.userActionController.addNodesHandler();
          }
          else if (this.previouslyHoveredSprite instanceof NodeView && this.selectedNodesSprites.length === 0) {
            this.userActionController.addNodesHandler(this.previouslyHoveredSprite);
          }
          else if (this.previouslyHoveredSprite instanceof ISetView) {
            // A hack in order not to break the information set.
            this.userActionController.emptySelectedNodes();
            this.userActionController.selectedNodes = (<ISetView>this.previouslyHoveredSprite).nodes.slice(0);
            this.userActionController.addNodesHandler();
            this.userActionController.emptySelectedNodes();
          }
        }
      });

      // Remove node button functionality
      this.minusButton.events.onInputDown.add(() => {
        if (this.buttonsGroup.alpha === 1) {
          if (this.previouslyHoveredSprite instanceof NodeView && this.selectedNodesSprites.length !== 0) {
            this.userActionController.deleteNodeHandler();
          }
          else if (this.previouslyHoveredSprite instanceof NodeView && this.selectedNodesSprites.length === 0) {
            this.userActionController.deleteNodeHandler(this.previouslyHoveredSprite);
          }
          else if (this.previouslyHoveredSprite instanceof ISetView) {
            const nodes = (<ISetView>this.previouslyHoveredSprite).nodes;
            if (nodes[0].node.children.length > 1) {
              const nodesToDelete = [];
              nodes.forEach(n => {
                nodesToDelete.push(
                  this.userActionController.treeController.treeView.findNodeView(n.node.children[n.node.children.length - 1]));
              });
              // Same hack as above
              this.userActionController.emptySelectedNodes();
              this.userActionController.selectedNodes = nodesToDelete.slice(0);
              this.userActionController.deleteNodeHandler();
              this.userActionController.emptySelectedNodes();
            }
          }
        }
      });

      // Players button functionality
      const playerButtons = [];
      this.buttonsArray.forEach((btn: HoverButton) => {
        if (btn.buttonKey === 'player') {
          playerButtons.push(btn);
        }
      });
      playerButtons.forEach((btn: Phaser.Sprite) => {
        btn.events.onInputDown.add(() => {
          if (this.buttonsGroup.alpha === 1) {
            if (this.previouslyHoveredSprite instanceof NodeView && this.selectedNodesSprites.length !== 0) {
              this.userActionController.assignPlayerToNodeHandler(playerButtons.indexOf(btn) + 1);
            }
            else if (this.previouslyHoveredSprite instanceof NodeView && this.selectedNodesSprites.length === 0) {
              this.userActionController.assignPlayerToNodeHandler(playerButtons.indexOf(btn) + 1, this.previouslyHoveredSprite);
            }
            else if (this.previouslyHoveredSprite instanceof ISetView) {
              const nodes = (<ISetView>this.previouslyHoveredSprite).nodes;
              nodes.forEach(n => {
                this.userActionController.assignPlayerToNodeHandler(playerButtons.indexOf(btn) + 1, n);
              });
            }
          }
        });
      });

      // Chance player button functionality
      this.chancePlayerButton.events.onInputDown.add(() => {
        if (this.buttonsGroup.alpha === 1) {
          if (this.previouslyHoveredSprite instanceof NodeView) {
            this.userActionController.assignChancePlayerToNodeHandler(this.previouslyHoveredSprite);
          }
        }
      });
      // Adding Information sets functionality
      this.linkButton.events.onInputDown.add(() => {
        if (this.buttonsGroup.alpha === 1) {
          this.userActionController.createISetHandler();
        }
      });
      // Removing information sets functionality
      this.unlinkButton.events.onInputDown.add(() => {
        if (this.buttonsGroup.alpha === 1) {
          if (this.previouslyHoveredSprite instanceof NodeView) {
            this.userActionController.removeISetHandler((<NodeView>this.previouslyHoveredSprite).node.iSet);
          }
          else if (this.previouslyHoveredSprite instanceof ISetView) {
            this.userActionController.removeISetHandler((<ISetView>this.previouslyHoveredSprite).iSet);
          }
        }
      });

      // Cut Sprite functionality
      this.cutButton.events.onInputDown.add(() => {
        if (this.buttonsGroup.alpha === 1) {
          this.userActionController.initiateCutSpriteHandler(<ISetView>this.previouslyHoveredSprite);
        }
      });

      // Clear the menu after clicking every button.
      this.buttonsArray.forEach(btn => {
        btn.events.onInputDown.add(() => {
          this.hideMenu();
        });
      });
    }

    triggerMenu(hoveredElement: Phaser.Sprite) {
      this.repositionPlayerButtonSprites();
      this.game.world.bringToTop(this.buttonsGroup);
      if (this.previouslyHoveredSprite !== hoveredElement) {
        if (this.buttonsGroup.alpha !== 0) {
          this.hideMenu();
          this.menuTween.stop();
        }
        this.previouslyHoveredSprite = hoveredElement;
        this.handleMenuCases(hoveredElement);
      }
    }

    private handleMenuCases(hoveredSprite: Phaser.Sprite) {
      const playersCount = this.userActionController.treeController.tree.players.length;

      this.buttonsArray.forEach((button: HoverButton) => button.setActive());
      if (playersCount === 3) {
        this.player3Button.setHidden();
        this.player4Button.setHidden();
      }
      if (playersCount === 4) {
        this.player4Button.setHidden();
      }

      // Case 1: The hovered sprite is a node
      if (hoveredSprite instanceof NodeView) {
        this.buttonsGroup.x = hoveredSprite.x;
        this.buttonsGroup.y = hoveredSprite.y;
        // Case 1.1: There is no multiple selection of nodes
        if (this.selectedNodesSprites.length <= 1) {
          // If the selected node is not the hovered sprite
          if (this.selectedNodesSprites[0] && this.selectedNodesSprites[0] !== hoveredSprite) {
            return;
          }
          this.unlinkButton.setHidden();
          this.linkButton.setHidden();
          this.cutButton.setHidden();
          if ((<NodeView>hoveredSprite).node.children.length === 0) {
            this.buttonsArray.forEach((btn: HoverButton) => {
              btn.setHidden();
            });
            this.plusButton.setActive();
            this.minusButton.setActive();
          }
        }
        // Case 1.2: If the hovered sprite is not among the selected sprites
        else if (this.selectedNodesSprites.length > 1 && this.selectedNodesSprites.indexOf(hoveredSprite) === -1) {
          return;
        }
        // Case 1.3: If the hovered sprite is among the selected sprites
        else if (this.selectedNodesSprites.length > 1) {
          // Check whether we can create an information set and disable the corresponding button
          const selectedNodes = [];
          const differentISets = [];
          this.selectedNodesSprites.forEach((s: NodeView) => {
            selectedNodes.push(s.node);
            if (s.node.iSet && differentISets.indexOf(s.node.iSet) === -1) {
              differentISets.push(s.node.iSet);
            }
          });
          try {
            this.userActionController.treeController.tree.canCreateISet(selectedNodes);
          }
          catch (err) {
            this.linkButton.setInactive();
          }
          // Check whether all nodes are in different sets to disable unlink button
          if (differentISets.length !== 1) {
            this.unlinkButton.setInactive();
            this.cutButton.setInactive();
          }
          else {
            this.linkButton.setInactive();
          }
          // If one among the selected nodes is a leaf, disable all but the plus and minus buttons
          for (let i = 0; i < this.selectedNodesSprites.length; i++) {
            if (this.selectedNodesSprites[i].node.children.length === 0) {
              this.buttonsArray.forEach((btn: HoverButton) => {
                btn.setHidden();
              });
              this.plusButton.setActive();
              this.minusButton.setActive();
              break;
            }
          }
        }
      }
      // Case 2: Hovered sprite is an information set
      if (hoveredSprite instanceof ISetView) {
        // this.userActionController.deselectNodesHandler();
        this.buttonsGroup.x = (<ISetView>hoveredSprite).label.x;
        this.buttonsGroup.y = (<ISetView>hoveredSprite).label.y;
        if ((<ISetView>hoveredSprite).nodes[0].node.children.length <= 1) {
          this.minusButton.setInactive();
        }
        this.linkButton.setInactive();
        this.chancePlayerButton.setInactive();
      }

      let sign = 1;
      if (hoveredSprite instanceof NodeView && (<NodeView>hoveredSprite).node.children.length === 0) {
        sign = -1;
      }
      this.menuTween = this.game.add.tween(this.buttonsGroup).to({
        y: this.buttonsGroup.position.y + sign * 50,
        alpha: 1
      }, 300, Phaser.Easing.Default, true);
    }

    private hideMenu() {
      this.buttonsGroup.alpha = 0;
      this.previouslyHoveredSprite = null;
      this.buttonsArray.forEach((btn: HoverButton) => {
        btn.setHidden();
      });
    }
  }
}
