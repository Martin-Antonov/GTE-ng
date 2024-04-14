import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatrixInput} from './MatrixInput';
import {UiSettingsService} from '../../../services/ui-settings/ui-settings.service';
import {SolverService} from '../../../services/solver/solver.service';
import Fraction from 'fraction.js/fraction';
import {UserActionController} from '../../../gte-core/gte/src/Controller/Main/UserActionController';
import {UserActionControllerService} from '../../../services/user-action-controller/user-action-controller.service';

@Component({
  selector: 'app-matrix-input',
  templateUrl: './matrix-input.component.html',
  styleUrls: ['./matrix-input.component.scss']
})
export class MatrixInputComponent implements OnInit {

  fromTextActive: boolean;
  textMatrixPlaceholder: string;
  fromMatricesActive: boolean;

  matrixInputModel: MatrixInput;

  userActionController: UserActionController;
  @ViewChild('p1Table', {static: false}) p1T;
  @ViewChild('p2Table', {static: false}) p2T;

  constructor(public uis: UiSettingsService, private solver: SolverService, private uac: UserActionControllerService) {
    this.uac.userActionController.subscribe((val) => {
      this.userActionController = val;
    });
  }

  ngOnInit() {
    this.fromTextActive = false;
    this.fromMatricesActive = false;
    this.textMatrixPlaceholder = '2 2     (dimensions)\n\n5 0     (player 1 matrix)\n0 1\n\n-1 3     (player 2 matrix)\n3-2';
    this.matrixInputModel = new MatrixInput('', '0', '0');
  }


  createRowsArray(): Array<Array<string>> {
    return new Array(this.convertToNumber(this.matrixInputModel.rows));
  }

  createColsArray(): Array<Array<string>> {
    return new Array(this.convertToNumber(this.matrixInputModel.cols));
  }

  activateFromText() {
    this.userActionController.scene.input.keyboard.addCapture('TAB');
    this.fromTextActive = true;
    this.fromMatricesActive = false;
  }

  activatePlayerMatrix() {
    this.fromTextActive = false;
    this.fromMatricesActive = true;
    this.userActionController.scene.input.keyboard.removeCapture('TAB');
  }

  close() {
    this.userActionController.scene.input.keyboard.addCapture('TAB');
    this.uis.matrixInputActive = false;
  }

  checkRowsColsCondition(): boolean {
    const rowsAsInt = this.convertToNumber(this.matrixInputModel.rows);
    const colsAsInt = this.convertToNumber(this.matrixInputModel.cols);
    return rowsAsInt >= 2 && rowsAsInt <= 20 && colsAsInt >= 2 && colsAsInt <= 20;

  }

  checkDecimalNumber(el) {
    return isNaN(el.value) && el.value !== '';
  }


  convertToNumber(value: string) {
    return Number(value);
  }

  postMatrixAsPlayersInput() {
    try {
      const m1 = this.saveMatrixToString(this.p1T);
      const m2 = this.saveMatrixToString(this.p2T);

      const result = this.matrixInputModel.rows + ' ' + this.matrixInputModel.cols + '\n\n' + m1 + '\n' + m2;

      this.solver.postMatrixAsText(result);
      this.uis.solverActive = true;
    } catch (err) {
      this.userActionController.events.emit('show-error', err);
    }

  }

  postMatrixAsText() {
    this.solver.postMatrixAsText(this.matrixInputModel.wholeMatrix);
    this.uis.solverActive = true;
  }

  private saveMatrixToString(pT: any) {
    let result = '';
    for (let i = 0; i < pT.nativeElement.children.length; i++) {
      const row = pT.nativeElement.children[i];
      for (let j = 0; j < row.children.length; j++) {
        const cell = row.children[j];
        const fraction = new Fraction(cell.children[0].value).toFraction();
        result += fraction + ' ';
      }
      result += '\n';
    }
    return result;
  }
}
