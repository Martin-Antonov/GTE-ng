import {Component, OnInit} from '@angular/core';
import {UserActionController} from '../../../gte-core/gte/src/Controller/Main/UserActionController';
import {UserActionControllerService} from '../../../services/user-action-controller/user-action-controller.service';
import {UiSettingsService} from '../../../services/ui-settings/ui-settings.service';
import {SolverService} from '../../../services/solver/solver.service';
import {BACKWARDS_INDUCTION_NOT_ALL_LABELED} from '../../../gte-core/gte/src/Utils/Constants';

@Component({
  selector: 'app-sequential-form',
  templateUrl: './sequential-form.component.html',
  styleUrls: ['./sequential-form.component.scss']
})
export class SequentialFormComponent implements OnInit {
  userActionController: UserActionController;
  stratFormScaleCSS: string;
  efForm: string;
  includeNash = true;
  includeSequential = false;
  restrictStrategy = false;
  restrictBelief = false;

  constructor(private uac: UserActionControllerService, private uis: UiSettingsService, private solver: SolverService) {
  }

  ngOnInit() {
    this.uac.userActionController.subscribe((value) => {
      this.userActionController = value;
      // this.userActionController.checkCreateStrategicForm();
    });
    this.stratFormScaleCSS = 'scale(' + this.uis.stratFormScale + ')';
    this.createEfForm();

  }

  close() {
    this.uis.sequentialFormActive = false;
  }

  postGameTree() {
    try {
      if (!this.userActionController.treeController.tree.checkAllNodesLabeled()) {
        throw new Error(BACKWARDS_INDUCTION_NOT_ALL_LABELED);
      }
      this.uis.sequentialFormActive = false;
      this.createEfForm();

      let config = '';
      if (this.includeNash) {
        config += 'include_nash\n';
      }
      if (this.includeSequential) {
        config += 'include_sequential\n';
      }
      if (this.restrictStrategy) {
        config += 'restrict_strategy\n';
      }
      if (this.restrictBelief) {
        config += 'restrict_belief\n';
      }

      // const lines = this.solver.variableNames.split('\n');
      let variableOverwrites = '';
      // for (let i = 1; i < lines.length; i++) {
      //   let parts = lines[i].split(':');
      //   if (parts.length === 3) {
      //     variableOverwrites += parts[1].trim() + ':' + parts[2].trim() + '\n';
      //   }
      // }
      this.solver.postGameTree(this.efForm, variableOverwrites, config);
      this.uis.solverActive = true;
    } catch (err) {
      this.userActionController.events.emit('show-error', err);
    }
  }

  createEfForm() {
    const efFile = this.userActionController.viewExporter.toEf();
    this.solver.postGameToRead(efFile);
    this.efForm = efFile;
  }
}
