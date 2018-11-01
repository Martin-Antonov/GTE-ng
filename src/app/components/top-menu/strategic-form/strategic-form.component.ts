import {Component, OnInit} from '@angular/core';
import {UserActionController} from '../../../gte-core/gte/src/Controller/UserActionController';
import {UserActionControllerService} from '../../../services/user-action-controller/user-action-controller.service';
import {UiSettingsService} from '../../../services/ui-settings/ui-settings.service';
import {SolverService} from '../../../services/solver/solver.service';

@Component({
  selector: 'app-strategic-form',
  templateUrl: './strategic-form.component.html',
  styleUrls: ['./strategic-form.component.scss']
})
export class StrategicFormComponent implements OnInit {
  userActionController: UserActionController;
  stratFormScaleCSS: string;
  private stratFormScale: number;

  constructor(private uac: UserActionControllerService, private uis: UiSettingsService, private solver: SolverService) {
  }


  ngOnInit() {
    this.uac.userActionController.subscribe((value) => {
      this.userActionController = value;
    });
    this.stratFormScale = 1;
    this.stratFormScaleCSS = 'scale(' + this.stratFormScale + ')';
  }

  upScale(increment: number) {
    this.stratFormScale *= increment;
    this.stratFormScaleCSS = 'scale(' + this.stratFormScale + ')';
  }

  downScale(increment: number) {
    this.stratFormScale *= 1 / increment;
    this.stratFormScaleCSS = 'scale(' + this.stratFormScale + ')';
  }

  close() {
    this.uis.strategicFormActive = false;
  }

  postFromStrategicForm() {
    let result = '';
    let m1 = '';
    let m2 = '';
    result += this.userActionController.strategicForm.p1rows.length + ' ' + this.userActionController.strategicForm.p2cols.length;
    for (let i = 0; i < this.userActionController.strategicForm.payoffsMatrix.length; i++) {
      const payoffsMatrix = this.userActionController.strategicForm.payoffsMatrix[i];
      for (let j = 0; j < payoffsMatrix.length; j++) {
        const payoffs = payoffsMatrix[j];
        m1 += payoffs[0][0].outcomes[0] + ' ';
        m2 += payoffs[0][0].outcomes[1] + ' ';
      }
      m1 += '\n';
      m2 += '\n';
    }
    result += '\n\n' + m1 + '\n' + m2;

    this.solver.postMatrixAsText(result);
    this.uis.solverActive = true;
  }

  getBody() {
    return document.getElementsByTagName('BODY')[0];
  }
}
