import {Component, Input, OnInit} from '@angular/core';
import {UserActionController} from '../../../gte-core/gte/src/Controller/UserActionController';
import {UserActionControllerService} from '../../../services/user-action-controller/user-action-controller.service';
import {UiSettingsService} from '../../../services/ui-settings/ui-settings.service';
import {SolverService} from '../../../services/solver/solver.service';
import {DomSanitizer, SafeStyle} from '@angular/platform-browser';

@Component({
  selector: 'app-strategic-form-table',
  templateUrl: './strategic-form-table.component.html',
  styleUrls: ['./strategic-form-table.component.scss']
})
export class StrategicFormTableComponent implements OnInit {
  @Input() stratFormScaleCSS: number;
  userActionController: UserActionController;
  gridRows: SafeStyle;
  gridCols: SafeStyle;


  constructor(private uac: UserActionControllerService, public sanitizer: DomSanitizer) {
    this.uac.userActionController.subscribe((value) => {
      this.userActionController = value;
    });
  }

  getOuterGridRows() {
    return this.sanitizer.bypassSecurityTrustStyle('repeat(' + this.userActionController.strategicForm.p3rows.length + ', 1fr)');
  }

  getOuterGridCols() {
    return this.sanitizer.bypassSecurityTrustStyle('repeat(' + this.userActionController.strategicForm.p4cols.length + ', 1fr)');
  }

  getInnerGridRows() {
    return this.sanitizer.bypassSecurityTrustStyle('repeat(' + this.userActionController.strategicForm.p1rows.length + ', 1fr)');
  }

  getInnerGridCols() {
    return this.sanitizer.bypassSecurityTrustStyle('repeat(' + this.userActionController.strategicForm.p2cols.length + ', 1fr)');
  }

  isThereP3() {
    return this.userActionController.strategicForm.p3Strategies.length !== 0;
  }

  isThereP4() {
    return this.userActionController.strategicForm.p4Strategies.length !== 0;
  }

  ngOnInit() {
  }
}
