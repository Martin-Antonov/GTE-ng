import {Component} from '@angular/core';
import {UiSettingsService} from './services/ui-settings/ui-settings.service';
import {UserActionControllerService} from './services/user-action-controller/user-action-controller.service';
import {UserActionController} from './gte-core/gte/src/Controller/UserActionController';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'gte-v2';
  userActionController: UserActionController;

  constructor(private uis: UiSettingsService, private uac: UserActionControllerService) {
    this.uis.init();
    this.uac.userActionController.subscribe((value) => {
      this.userActionController = value;
    });

    // confirm on reload page
    window.addEventListener('beforeunload', function (e) {
      const confirmationMessage = '';
      e.returnValue = confirmationMessage;     // Gecko, Trident, Chrome 34+
      return confirmationMessage;              // Gecko, WebKit, Chrome <34
    });
  }

  resizeMiddleElement() {
    this.userActionController.gameResize();
  }


  closeSaveFile() {
    this.uis.saveFileActive = false;
  }
}
