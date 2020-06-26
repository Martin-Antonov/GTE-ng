import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {TreesFileService} from '../../../services/trees-file/trees-file.service';
import {UiSettingsService} from '../../../services/ui-settings/ui-settings.service';
import {UserActionControllerService} from '../../../services/user-action-controller/user-action-controller.service';
import {UserActionController} from '../../../gte-core/gte/src/Controller/Main/UserActionController';

@Component({
  selector: 'app-save-menu',
  templateUrl: './save-menu.component.html',
  styleUrls: ['./save-menu.component.scss']
})
export class SaveMenuComponent implements AfterViewInit {
  userActionController: UserActionController;

  @ViewChild('filename', {static: false}) fileNameInput: ElementRef;

  constructor(public tfs: TreesFileService, private uis: UiSettingsService, private uac: UserActionControllerService) {
    this.uac.userActionController.subscribe((value) => {
      this.userActionController = value;
    });
  }

  ngAfterViewInit() {
    this.fileNameInput.nativeElement.focus();
    setTimeout(() => {
    this.fileNameInput.nativeElement.select();
    }, 50);
  }

  closeSaveMenu() {
    if (this.uis.saveFileActive) {
      this.uis.saveFileActive = false;
    }
  }

  isStrategicFormDisabled() {
    return !(this.uis.strategicFormActive && this.userActionController && this.userActionController.strategicFormResult);
  }
}
