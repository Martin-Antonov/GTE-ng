import {Component, OnInit, ViewChild} from '@angular/core';
import {UserActionController} from '../../gte-core/gte/src/Controller/Main/UserActionController';
import {ITooltips} from '../../services/tooltips/tooltips';
import {TooltipsService} from '../../services/tooltips/tooltips.service';
import {UserActionControllerService} from '../../services/user-action-controller/user-action-controller.service';
import {UiSettingsService} from '../../services/ui-settings/ui-settings.service';
import {TreesFileService} from '../../services/trees-file/trees-file.service';
import {Hotkey, HotkeysService} from 'angular2-hotkeys';

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

  @ViewChild('loadInput', { static: false }) loadFileField;

  constructor(private uac: UserActionControllerService, public tts: TooltipsService,
              public uis: UiSettingsService, private tfs: TreesFileService, private hotkeys: HotkeysService) {

    this.hotkeys.add(new Hotkey('alt+n', (event: KeyboardEvent): boolean => {
      this.createNewTree();
      return false;
    }));
    this.hotkeys.add(new Hotkey('alt+s', (event: KeyboardEvent): boolean => {
      this.uis.saveFileActive = !this.uis.saveFileActive;
      return false;
    }));
    this.hotkeys.add(new Hotkey('alt+o', (): boolean => {
      this.loadFileField.nativeElement.click();
      return false;
    }));
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

  toggleSPNE() {
    if (!this.userActionController.SPNEActive) {
      this.userActionController.calculateSPNE();
    } else {
      this.userActionController.resetSPNE();
    }
  }

  isUndoActive() {
    return this.userActionController.undoRedoController.currentTreeIndex === 0;
  }

  isRedoActive() {
    return this.userActionController.undoRedoController.currentTreeIndex ===
      this.userActionController.undoRedoController.treesList.length - 1;
  }

  toggleSaveMenu() {
    this.uis.saveFileActive = !this.uis.saveFileActive;
  }

  createNewTree() {
    this.tfs.addNewTree();
  }

  loadTreeFromFile(event) {
    this.tfs.loadTreeFromFile(event);
  }

  closeSaveFile() {
    if (this.uis.saveFileActive) {
      this.uis.saveFileActive = false;
    }
  }
}
