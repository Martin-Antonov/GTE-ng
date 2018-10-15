import {Component, Input, OnInit} from '@angular/core';
import {UserActionController} from '../../../gte-core/gte/src/Controller/UserActionController';
import {UserActionControllerService} from '../../../services/user-action-controller/user-action-controller.service';
import {UiSettingsService} from '../../../services/ui-settings/ui-settings.service';
import {SolverService} from '../../../services/solver/solver.service';

@Component({
  selector: 'app-strategic-form-table',
  templateUrl: './strategic-form-table.component.html',
  styleUrls: ['./strategic-form-table.component.scss']
})
export class StrategicFormTableComponent implements OnInit {
  @Input() stratFormScaleCSS: number;
  userActionController: UserActionController;

  constructor(private uac: UserActionControllerService, private uis: UiSettingsService, private solver: SolverService) {
    this.uac.userActionController.subscribe((value) => {
      this.userActionController = value;
    });
  }

  ngOnInit() {
  }

}
