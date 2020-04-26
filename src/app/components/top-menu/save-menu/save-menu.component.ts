import {Component, OnInit} from '@angular/core';
import {TreesFileService} from '../../../services/trees-file/trees-file.service';
import {UiSettingsService} from '../../../services/ui-settings/ui-settings.service';
import {UserActionControllerService} from '../../../services/user-action-controller/user-action-controller.service';
import {UserActionController} from '../../../gte-core/gte/src/Controller/Main/UserActionController';

@Component({
  selector: 'app-save-menu',
  templateUrl: './save-menu.component.html',
  styleUrls: ['./save-menu.component.scss']
})
export class SaveMenuComponent implements OnInit {
  userActionController: UserActionController;

  constructor(public tfs: TreesFileService, private uis: UiSettingsService, private uac: UserActionControllerService) {
    this.uac.userActionController.subscribe((value) => {
      this.userActionController = value;
    });
  }

  ngOnInit() {
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
