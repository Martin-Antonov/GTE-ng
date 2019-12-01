import {Component, Input, OnInit} from '@angular/core';
import {SquareButtonComponent} from '../../../shared/components/square-button/square-button.component';
import {UiSettingsService} from '../../../services/ui-settings/ui-settings.service';
import {UserActionControllerService} from '../../../services/user-action-controller/user-action-controller.service';
import {UserActionController} from '../../../gte-core/gte/src/Controller/Main/UserActionController';
import {INITIAL_TREE_HEIGHT, INITIAL_TREE_WIDTH} from '../../../gte-core/gte/src/Utils/Constants';
import {Move} from '../../../gte-core/gte/src/Model/Move';
import {ACTION} from '../../../gte-core/gte/src/Controller/UndoRedo/ActionsEnum';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  @Input() settingsButton: SquareButtonComponent;
  treeWidth: number;
  treeHeight: number;
  userActionController: UserActionController;

  playerLists: Array<string>;

  constructor(private uis: UiSettingsService, private uas: UserActionControllerService) {
    this.uas.userActionController.subscribe(value => {
      this.userActionController = value;
    });
  }

  ngOnInit() {
    this.treeWidth = 50 * this.userActionController.treeController.treeView.properties.treeWidth
      / (this.userActionController.scene.sys.canvas.width * INITIAL_TREE_WIDTH);
    this.treeHeight = 50 * this.userActionController.treeController.treeView.properties.levelHeight
      / (this.userActionController.scene.sys.canvas.height * INITIAL_TREE_HEIGHT);
    this.playerLists = [];
    for (let i = 0; i < this.userActionController.treeController.tree.labelSetter.labels.length; i++) {
      const label = this.userActionController.treeController.tree.labelSetter.labels[i];
      this.playerLists.push(label.join(''));
    }
  }

  close() {
    this.settingsButton.clickHandler();
    this.uis.settingsActive = false;
  }

  updatePlayerList(index: number) {
    const oldLabels = this.userActionController.treeController.tree.labelSetter.labels[index].slice(0);
    this.userActionController.treeController.tree.labelSetter.labels[index] = this.playerLists[index].split('');
    this.userActionController.treeController.tree.moves.forEach((m: Move) => {
      if (m.from.player && m.from.player.id === index + 1) {
        m.manuallyAssigned = false;
      }
    });
    this.userActionController.treeController.resetTree(false, false);
    this.userActionController.undoRedoActionController.saveAction(ACTION.CHANGE_PLAYER_MOVES_LIST,
      [oldLabels, this.userActionController.treeController.tree.labelSetter.labels[index].slice(0), index]);
  }

  toggleAutoLevels() {
    const properties = this.userActionController.treeController.treeView.properties;
    properties.automaticLevelAdjustment = !properties.automaticLevelAdjustment;
  }

  toggleBestResponses() {
    this.uis.bestResponsesActive = !this.uis.bestResponsesActive;
  }
}
