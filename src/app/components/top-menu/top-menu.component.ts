import {Component, OnInit} from '@angular/core';
import {UserActionController} from '../../gte-core/gte/src/Controller/UserActionController';
import {ITooltips} from '../../services/tooltips/tooltips';
import {TooltipsService} from '../../services/tooltips/tooltips.service';
import {UserActionControllerService} from '../../services/user-action-controller/user-action-controller.service';
import {UiSettingsService} from '../../services/ui-settings/ui-settings.service';

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

  constructor(private uac: UserActionControllerService, public tts: TooltipsService, public uis: UiSettingsService) {
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

  someFunction() {
  }

  toggleStrategicForm() {
    this.uis.strategicFormActive = !this.uis.strategicFormActive;
  }

  toggleMatrixInput() {
    this.uis.matrixInputActive = !this.uis.matrixInputActive;
  }

  toggleSolver() {
    this.uis.solverActive = !this.uis.solverActive;
  }
}
