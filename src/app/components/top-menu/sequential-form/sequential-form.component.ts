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
  efForm : string
  include_nash : boolean
  include_sequential: boolean
  restrict_strategy: boolean
  restrict_belief: boolean

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
    this.createEfForm()
    this.include_nash = true
    this.include_sequential = true
    this.restrict_strategy = false
    this.restrict_belief = false
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
    let config = ""
    if (this.include_nash)
      config += "include_nash\n"
    if (this.include_sequential)
      config += "include_sequential\n"
    if (this.restrict_strategy)
      config += "restrict_strategy\n"
    if (this.restrict_belief)
      config += "restrict_belief\n"

    this.solver.postGameTree(this.efForm, config);
    this.uis.solverActive = true;
  }

  createEfForm(){
    const efFile = this.userActionController.viewExporter.toEf();
    this.efForm = efFile
  }


}
