import {Component, OnInit} from '@angular/core';
import {UserActionController} from '../../../gte-core/gte/src/Controller/Main/UserActionController';
import {UserActionControllerService} from '../../../services/user-action-controller/user-action-controller.service';
import {UiSettingsService} from '../../../services/ui-settings/ui-settings.service';
import {SolverService} from '../../../services/solver/solver.service';
import {TreesFileService} from '../../../services/trees-file/trees-file.service';
import {MAX_NODES_COUNT_FOR_STRATEGIC_FORM} from '../../../gte-core/gte/src/Utils/Constants';

@Component({
  selector: 'app-strategic-form',
  templateUrl: './strategic-form.component.html',
  styleUrls: ['./strategic-form.component.scss']
})
export class StrategicFormComponent implements OnInit {
  userActionController: UserActionController;
  stratFormScaleCSS: string;

  constructor(private uac: UserActionControllerService,
              private uis: UiSettingsService,
              private solver: SolverService,
              private tts: TreesFileService) {
  }


  ngOnInit() {
    this.uac.userActionController.subscribe((value) => {
      this.userActionController = value;
      this.userActionController.checkCreateStrategicForm();
    });
    this.stratFormScaleCSS = 'scale(' + this.uis.stratFormScale + ')';
  }

  get areThereTooManyNodes(): boolean {
    return this.userActionController.treeController.tree.nodes.length > MAX_NODES_COUNT_FOR_STRATEGIC_FORM;
  }

  upScale(increment: number) {
    this.uis.stratFormScale *= increment;
    this.stratFormScaleCSS = 'scale(' + this.uis.stratFormScale + ')';
  }

  downScale(increment: number) {
    this.uis.stratFormScale *= 1 / increment;
    this.stratFormScaleCSS = 'scale(' + this.uis.stratFormScale + ')';
  }

  close() {
    this.uis.strategicFormActive = false;
  }

  postFromStrategicForm() {
    this.userActionController.checkCreateStrategicForm();
    let result = '';
    let m1 = '';
    let m2 = '';
    result += this.userActionController.strategicFormResult.p1rows.length + ' ' + this.userActionController.strategicFormResult.p2cols.length;
    for (let i = 0; i < this.userActionController.strategicFormResult.payoffsMatrix.length; i++) {
      const payoffsMatrix = this.userActionController.strategicFormResult.payoffsMatrix[i];
      for (let j = 0; j < payoffsMatrix.length; j++) {
        const payoffs = payoffsMatrix[j];
        const m1PayoffAsFraction = payoffs[0][0].outcomes[0].toFraction();
        const m2PayoffAsFraction = payoffs[0][0].outcomes[1].toFraction();
        m1 += m1PayoffAsFraction + ' ';
        m2 += m2PayoffAsFraction + ' ';
      }
      m1 += '\n';
      m2 += '\n';
    }
    result += '\n\n' + m1 + '\n' + m2;
    this.solver.postMatrixAsText(result);
    this.uis.solverActive = true;
  }
}
