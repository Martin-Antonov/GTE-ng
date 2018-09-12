import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {UserActionController} from '../../../gte-core/gte/src/Controller/UserActionController';
import {UserActionControllerService} from '../../../services/user-action-controller/user-action-controller.service';
import {UiSettingsService} from '../../../services/ui-settings/ui-settings.service';


@Component({
  selector: 'app-strategic-form',
  templateUrl: './strategic-form.component.html',
  styleUrls: ['./strategic-form.component.scss']
})
export class StrategicFormComponent implements OnInit {
  userActionController: UserActionController;
  stratFormScaleCSS: string;
  private stratFormScale: number;

  constructor(private uac: UserActionControllerService, private uis: UiSettingsService) {
  }

  ngOnInit() {
    this.uac.userActionController.subscribe((value) => {
      this.userActionController = value;
    });
    this.stratFormScale = 1;
    this.stratFormScaleCSS = 'scale(' + this.stratFormScale + ')';
  }

  changeScale(increment: number) {
    this.stratFormScale += increment;
    this.stratFormScaleCSS = 'scale(' + this.stratFormScale + ')';
  }

  close() {
    this.uis.strategicFormActive = false;
  }
}
