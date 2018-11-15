import {Component, OnInit} from '@angular/core';
import {TreesFileService} from '../../../services/trees-file/trees-file.service';
import {UiSettingsService} from '../../../services/ui-settings/ui-settings.service';

@Component({
  selector: 'app-save-menu',
  templateUrl: './save-menu.component.html',
  styleUrls: ['./save-menu.component.scss']
})
export class SaveMenuComponent implements OnInit {

  constructor(public tfs: TreesFileService, private uis: UiSettingsService) {
  }

  ngOnInit() {
  }

  closeSaveMenu() {
    if (this.uis.saveFileActive) {
      this.uis.saveFileActive = false;
    }
  }

}
