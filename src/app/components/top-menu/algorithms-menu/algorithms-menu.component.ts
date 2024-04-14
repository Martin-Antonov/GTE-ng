import {Component, OnInit} from '@angular/core';
import {UserActionController} from '../../../gte-core/gte/src/Controller/Main/UserActionController';
import {UserActionControllerService} from '../../../services/user-action-controller/user-action-controller.service';
import {UiSettingsService} from '../../../services/ui-settings/ui-settings.service';
import {SolverService} from '../../../services/solver/solver.service';

@Component({
  selector: 'app-algorithms-menu',
  templateUrl: './algorithms-menu.component.html',
  styleUrls: ['./algorithms-menu.component.scss']
})
export class AlgorithmsMenuComponent implements OnInit {
  userActionController: UserActionController;

  constructor(private uac: UserActionControllerService, private uis: UiSettingsService, private ss: SolverService, private solver: SolverService) {
  }

  ngOnInit() {
    this.uac.userActionController.subscribe((value) => {
      this.userActionController = value;
    });
  }

  toggleSPNE() {
    try {
      if (!this.userActionController.SPNEActive) {
        this.userActionController.calculateSPNE();
      } else {
        this.userActionController.resetSPNE();
      }
    } catch (error) {
    }
  }

  calculateBFI() {
    const result = this.userActionController.calculateBFI();
    if (result) {
      this.uis.solverActive = true;
      this.ss.convertBFISolution(result);
    }
  }

  openMatrixInput() {
    this.uis.matrixInputActive = true;
  }

  openStrategicForm() {
    this.uis.strategicFormActive = true;
  }

  solveForGameTree() {
    try {
      this.userActionController.checkCreateStrategicForm();
      const result = this.solver.createStrategicFormString(this.userActionController.strategicFormResult);
      this.solver.postMatrixAsText(result);
      this.uis.solverActive = true;
    } catch (error) {
      this.userActionController.events.emit('show-error', error);
    }
  }

  toggleSequentialForm() {
    this.uis.sequentialFormActive = !this.uis.sequentialFormActive;
  }
}
