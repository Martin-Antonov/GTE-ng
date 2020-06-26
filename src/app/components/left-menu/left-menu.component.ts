import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {UserActionController} from '../../gte-core/gte/src/Controller/Main/UserActionController';
import {ITooltips} from '../../services/tooltips/tooltips';
import {TooltipsService} from '../../services/tooltips/tooltips.service';
import {UserActionControllerService} from '../../services/user-action-controller/user-action-controller.service';
import {NodeView} from '../../gte-core/gte/src/View/NodeView';
import {SquareButtonComponent} from '../../shared/components/square-button/square-button.component';


@Component({
  selector: 'app-left-menu',
  templateUrl: './left-menu.component.html',
  styleUrls: ['./left-menu.component.scss']
})
export class LeftMenuComponent implements OnInit {
  userActionController: UserActionController;

  playerIsActive: boolean;
  playerColors: Array<string>;
  tooltips: ITooltips;
  @ViewChild('zeroSumComponent', {static: false}) zeroSumComponent: SquareButtonComponent;
  @ViewChild('fractionDecimalComponent', {static: false}) fractionDecimalComponent: SquareButtonComponent;

  constructor(private uac: UserActionControllerService, private tts: TooltipsService) {
  }

  ngOnInit() {
    this.uac.userActionController.subscribe((value) => {
      this.userActionController = value;
      if (value) {
        this.userActionController.treeController.events.on('zero-sum-undo', () => {
          this.zeroSumComponent.flipImage();
        });
        this.userActionController.treeController.events.on('fraction-decimal-undo', () => {
          this.fractionDecimalComponent.flipImage();
        });
      }
    });
    this.tts.getTooltips().subscribe((tooltips) => {
      this.tooltips = tooltips;
    });
    this.playerIsActive = false;
    this.playerColors = ['#ff0000', '#0000ff', '#00bb00', '#ff00ff'];
  }

  assignPlayer(id: number) {
    this.userActionController.assignPlayerToNodeHandler(id + 1);
    this.playerIsActive = false;
  }

  activatePlayerChoice() {
    this.playerIsActive = true;
  }

  areNodesSelected(): boolean {
    if (this.userActionController) {
      return this.userActionController.selectedNodes.length === 0;
    } else {
      return true;
    }
  }

  doSelectedHaveChildren(): boolean {
    return this.userActionController && this.userActionController.doSelectedHaveChildren();
  }

  canCreateISet() {
    if (this.userActionController && this.userActionController.selectedNodes.length > 1) {
      const selectedNodes = this.userActionController.selectedNodes;
      const nodes = [];
      selectedNodes.forEach((nV: NodeView) => {
        nodes.push(nV.node);
      });

      try {
        this.userActionController.treeController.tree.canCreateISet(nodes);
      } catch {
        return false;
      }
      const distinctISets = this.userActionController.treeController.getDistinctISetsFromNodes(selectedNodes).length;
      for (let i = 0; i < selectedNodes.length; i++) {
        if (!selectedNodes[i].node.iSet) {
          return true;
        }
      }
      return distinctISets !== 1;
    } else {
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

