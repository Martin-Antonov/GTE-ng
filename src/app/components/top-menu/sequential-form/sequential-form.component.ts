import {Component, OnInit} from '@angular/core';
import {UserActionController} from '../../../gte-core/gte/src/Controller/Main/UserActionController';
import {UserActionControllerService} from '../../../services/user-action-controller/user-action-controller.service';
import {UiSettingsService} from '../../../services/ui-settings/ui-settings.service';
import {SolverService} from '../../../services/solver/solver.service';
import {TreesFileService} from '../../../services/trees-file/trees-file.service';
import {MAX_NODES_COUNT_FOR_STRATEGIC_FORM} from '../../../gte-core/gte/src/Utils/Constants';

@Component({
  selector: 'app-sequential-form',
  templateUrl: './sequential-form.component.html',
  styleUrls: ['./sequential-form.component.scss']
})
export class SequentialFormComponent implements OnInit {
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
      // this.userActionController.checkCreateStrategicForm();
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
    this.uis.sequentialFormActive = false;
  }

  postGameTree() {
    const efFile = this.userActionController.viewExporter.toEf();
    // const blob = new Blob([efFile], {type: 'text/plain;charset=utf-8'});
    this.solver.postGameTree(efFile);
    this.uis.solverActive = true;
  }
}
