import {Component, OnInit} from '@angular/core';
import {UserActionController} from '../../gte-core/gte/src/Controller/UserActionController';
import {ITooltips} from '../../services/tooltips/tooltips';
import {TooltipsService} from '../../services/tooltips/tooltips.service';
import {UserActionControllerService} from '../../services/user-action-controller/user-action-controller.service';
import {UiSettingsService} from '../../services/ui-settings/ui-settings.service';
import {TreesFileService} from '../../services/trees-file/trees-file.service';

@Component({
  selector: 'app-top-menu',
  templateUrl: './top-menu.component.html',
  styleUrls: ['./top-menu.component.scss']
})
export class TopMenuComponent implements OnInit {

  userActionController: UserActionController;
  tooltips: ITooltips;
  logoSrc: string;

  strategicFormActive: boolean;

  constructor(private uac: UserActionControllerService, public tts: TooltipsService, public uis: UiSettingsService, private tfs: TreesFileService) {
  }

  ngOnInit() {
    this.uac.userActionController.subscribe((value) => {
      this.userActionController = value;
    });

    this.tts.getTooltips().subscribe((tooltips) => {
      this.tooltips = tooltips;
    });
    this.logoSrc = 'assets/images/logo.png';
    this.strategicFormActive = false;
  }

  toggleStrategicForm() {
    this.uis.strategicFormActive = !this.uis.strategicFormActive;
    if (!this.uis.strategicFormActive) {
    }
  }

  toggleMatrixInput() {
    this.uis.matrixInputActive = !this.uis.matrixInputActive;
  }

  toggleSolver() {
    this.uis.solverActive = !this.uis.solverActive;
  }

  isUndoActive() {
    return this.userActionController.undoRedoController.currentTreeIndex === 0;
  }

  isRedoActive() {
    return this.userActionController.undoRedoController.currentTreeIndex ===
      this.userActionController.undoRedoController.treesList.length - 1;
  }

  createNewTree() {
    this.tfs.addNewTree();
  }

  saveTreeToFile() {
    this.tfs.saveTreeToFile();
  }

  loadTreeFromFile() {
    this.tfs.loadTreeFromFile();
  }

  saveToImage() {
    this.tfs.saveToImage();
  }
}
