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

  constructor(private uac: UserActionControllerService, public sanitizer: DomSanitizer, private uis: UiSettingsService) {
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

  getInnerCellStyle(i: number, j: number, k: number, l: number) {
    let style = {};
    if (this.userActionController.strategicForm.payoffsMatrix[i][j][k][l].isEquilibrium() && this.uis.bestResponsesActive) {
      style['background'] = ['#f5f5f5'];
    }
    return style;
  }

  getP1PayoffStyle(i: number, j: number, k: number, l: number) {
    let style = {};
    if (!this.isThereP3() && !this.isThereP4()) {
      style['top'] = '47%';
    }
    else if ((this.isThereP3() && !this.isThereP4()) || (!this.isThereP3() && this.isThereP4())) {
      style['top'] = '27%';
    }
    else {
      style['top'] = '0';
    }

    if (this.userActionController.strategicForm.payoffsMatrix[i][j][k][l].isBestResponce[0] && this.uis.bestResponsesActive) {
      style['background'] = 'rgba(255,0,0,0.15)';
    }
    return style;
  }

  getP2PayoffStyle(i: number, j: number, k: number, l: number) {
    let style = {};
    if (!this.isThereP3() && !this.isThereP4()) {
      style['left'] = '100%';
      style['transform'] = 'translateX(-100%)';
    }
    else if ((this.isThereP3() && !this.isThereP4()) || (!this.isThereP3() && this.isThereP4())) {
      style['left'] = '50%';
      style['top'] = '20%';
      style['transform'] = 'translate(-50%,-20%)';
    }
    else {
      style['left'] = '33%';
      style['transform'] = 'translateX(-33%)';
    }

    if (this.userActionController.strategicForm.payoffsMatrix[i][j][k][l].isBestResponce[1] && this.uis.bestResponsesActive) {
      style['background'] = 'rgba(0,0,255,0.15)';
    }

    return style;
  }

  getP3PayoffStyle(i: number, j: number, k: number, l: number) {
    let style = {};
    if (this.isThereP4()) {
      style['left'] = '66%';
      style['transform'] = 'translateX(-66%)';
    }
    else {
      style['left'] = '100%';
      style['transform'] = 'translateX(-100%)';

    }
    if (this.userActionController.strategicForm.payoffsMatrix[i][j][k][l].isBestResponce[2] && this.uis.bestResponsesActive) {
      style['background'] = 'rgba(0,255,0,0.15)';
    }
    return style;
  }

  getP4PayoffStyle(i: number, j: number, k: number, l: number) {
    let style = {};
    if (this.userActionController.strategicForm.payoffsMatrix[i][j][k][l].isBestResponce[3] && this.uis.bestResponsesActive) {
      style['background'] = 'rgba(255,0,255,0.15)';
    }
    return style;
  }

  ngOnInit() {
  }
}


