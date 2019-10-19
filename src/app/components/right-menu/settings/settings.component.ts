import {Component, Input, OnInit} from '@angular/core';
import {SquareButtonComponent} from '../../../shared/components/square-button/square-button.component';
import {UiSettingsService} from '../../../services/ui-settings/ui-settings.service';
import {UserActionControllerService} from '../../../services/user-action-controller/user-action-controller.service';
import {UserActionController} from '../../../gte-core/gte/src/Controller/UserActionController';
import {INITIAL_TREE_HEIGHT, INITIAL_TREE_WIDTH} from '../../../gte-core/gte/src/Utils/Constants';

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

  updateTreeWidth() {
    this.userActionController.treeController.treeView.properties.treeWidth =
      this.userActionController.scene.sys.canvas.width * INITIAL_TREE_WIDTH * this.treeWidth * 2 / 100;
    this.userActionController.treeController.resetTree(true, true);
  }

  updateTreeHeight() {
    this.userActionController.treeController.treeView.properties.levelHeight =
      this.userActionController.scene.sys.canvas.height * INITIAL_TREE_HEIGHT * this.treeHeight * 2 / 100;
    this.userActionController.treeController.resetTree(true, true);
  }

  updatePlayerList(index: number) {
    this.userActionController.treeController.tree.labelSetter.labels[index] = this.playerLists[index].split('');
    this.userActionController.treeController.resetTree(false, false);
  }

  toggleAutoLevels() {
    const properties = this.userActionController.treeController.treeView.properties;
    properties.automaticLevelAdjustment = !properties.automaticLevelAdjustment;
    // this.userActionController.treeController.resetTree(true, true);
  }

  toggleBestResponses() {
    this.uis.bestResponsesActive = !this.uis.bestResponsesActive;
  }
}
