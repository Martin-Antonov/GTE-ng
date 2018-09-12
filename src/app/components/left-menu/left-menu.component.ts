import {Component, OnInit} from '@angular/core';
import {UserActionController} from '../../gte-core/gte/src/Controller/UserActionController';
import {ITooltips} from '../../services/tooltips/tooltips';
import {TooltipsService} from '../../services/tooltips/tooltips.service';
import {UserActionControllerService} from '../../services/user-action-controller/user-action-controller.service';


@Component({
  selector: 'app-left-menu',
  templateUrl: './left-menu.component.html',
  styleUrls: ['./left-menu.component.scss']
})
export class LeftMenuComponent implements OnInit {
  userActionController: UserActionController;

  playerIsClicked: boolean;
  playerColors: Array<string>;
  tooltips: ITooltips;

  constructor(private uac: UserActionControllerService, private tts: TooltipsService) {
  }

  ngOnInit() {
    this.uac.userActionController.subscribe((value) => {
      this.userActionController = value;
    });
    this.tts.getTooltips().subscribe((tooltips) => {
      this.tooltips = tooltips;
    });
    this.playerIsClicked = false;
    this.playerColors = ['#ff0000', '#0000ff', '#00ff00', '#ff00ff'];
  }

  togglePlayerActive() {
    this.playerIsClicked = !this.playerIsClicked;
  }

  assignPlayer(id: number) {
    this.userActionController.assignPlayerToNodeHandler(id + 1);
  }

  areNodesSelected() {
    if (this.userActionController) {
      return this.userActionController.selectedNodes.length === 0;
    }
    else {
      return true;
    }

  }

  doSelectedHaveChildren() {
    if (this.userActionController) {
      let result = false;
      this.userActionController.selectedNodes.forEach((n) => {
        if (n.node.children.length > 0) {
          result = true;
        }
      });
      return result;
    }
    else {
      return false;
    }
  }

  canCreateISet() {
    if (this.userActionController && this.userActionController.selectedNodes.length > 1) {
      let selectedNodes = this.userActionController.selectedNodes;
      let nodes = [];
      selectedNodes.forEach((n => {
        nodes.push(n.node);
      }));

      try {
        this.userActionController.treeController.tree.canCreateISet(nodes);
      }
      catch {
        return false;
      }
      let distinctISets = this.userActionController.treeController
        .getDistinctISetsFromNodes(selectedNodes).length;
      for (let i = 0; i < selectedNodes.length; i++) {
        if (!selectedNodes[i].node.iSet) {
          return true;
        }
      }
      return distinctISets !== 1;
    }
    else {
      return false;
    }
  }

  canUnlinkOrCut() {
    if (this.userActionController) {
      return this.userActionController.treeController.getDistinctISetsFromNodes(this.userActionController.selectedNodes).length === 1;
    }
    return false;
  }
}

