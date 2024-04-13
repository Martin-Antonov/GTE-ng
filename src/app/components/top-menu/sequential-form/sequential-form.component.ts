import {Component, OnInit} from '@angular/core';
import {UserActionController} from '../../../gte-core/gte/src/Controller/Main/UserActionController';
import {UserActionControllerService} from '../../../services/user-action-controller/user-action-controller.service';
import {UiSettingsService} from '../../../services/ui-settings/ui-settings.service';
import {SolverService} from '../../../services/solver/solver.service';

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
  includeSequential = true;
  restrictStrategy = false;
  restrictBelief = false;
  showEdit = false;

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

  upScale(increment: number) {
    this.uis.stratFormScale *= increment;
    this.stratFormScaleCSS = 'scale(' + this.uis.stratFormScale + ')';
  }

  downScale(increment: number) {
    this.uis.stratFormScale *= 1 / increment;
    this.stratFormScaleCSS = 'scale(' + this.uis.stratFormScale + ')';
  }

  close() {
    this.uis.sequentialFormActive = false;
  }

  postGameTree() {
    if (!this.showEdit) {
      this.createEfForm();
    }
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

    const lines = this.solver.variableNames.split('\n');
    let variable_overwrites = '';
    for (let i = 1; i < lines.length; i++) {
      let parts = lines[i].split(':');
      if (parts.length === 3) {
        variable_overwrites += parts[1].trim() + ':' + parts[2].trim() + '\n';
      }
    }
    this.solver.postGameTree(this.efForm, variable_overwrites, config);
    this.uis.solverActive = true;
  }

  createEfForm() {
    const efFile = this.userActionController.viewExporter.toEf();
    this.solver.postGameToRead(efFile);
    this.efForm = efFile;
  }
}
