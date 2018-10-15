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
  }

  resizeMiddleElement() {
    this.userActionController.gameResize();
  }
}
