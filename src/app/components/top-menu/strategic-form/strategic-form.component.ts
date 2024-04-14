import {Component, OnInit} from '@angular/core';
import {UserActionController} from '../../../gte-core/gte/src/Controller/Main/UserActionController';
import {UserActionControllerService} from '../../../services/user-action-controller/user-action-controller.service';
import {UiSettingsService} from '../../../services/ui-settings/ui-settings.service';
import {SolverService} from '../../../services/solver/solver.service';
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
              private solver: SolverService) {
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
    try {
      this.userActionController.checkCreateStrategicForm();
      const result = this.solver.createStrategicFormString(this.userActionController.strategicFormResult);
      this.solver.postMatrixAsText(result);
      this.uis.solverActive = true;
    } catch (error) {
      this.userActionController.events.emit('show-error', error);
    }
  }
}
