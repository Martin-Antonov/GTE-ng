import {Component, OnInit, ViewChild} from '@angular/core';
import {MatrixInput} from './MatrixInput';
import {UiSettingsService} from '../../../services/ui-settings/ui-settings.service';
import {SolverService} from '../../../services/solver/solver.service';
import * as math from 'mathjs';

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
  @ViewChild('p1Table', { static: false }) p1T;
  @ViewChild('p2Table', { static: false }) p2T;

  constructor(public uis: UiSettingsService, private solver: SolverService) {
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
    this.fromTextActive = true;
    this.fromMatricesActive = false;
  }

  activatePlayerMatrix() {
    this.fromTextActive = false;
    this.fromMatricesActive = true;
  }

  close() {
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
    let m1 = '';
    let m2 = '';
    for (let i = 0; i < this.p1T.nativeElement.children[0].children.length; i++) {
      const childElement = this.p1T.nativeElement.children[0].children[i];
      for (let j = 0; j < childElement.children.length; j++) {
        const child = childElement.children[j];
        const fraction = math.format(math.fraction(child.children[0].value));
        m1 += fraction + ' ';
      }
      m1 += '\n';
    }

    for (let i = 0; i < this.p2T.nativeElement.children[0].children.length; i++) {
      const childElement = this.p2T.nativeElement.children[0].children[i];
      for (let j = 0; j < childElement.children.length; j++) {
        const child = childElement.children[j];
        const fraction = math.format(math.fraction(child.children[0].value));
        m2 += fraction + ' ';
      }
      m2 += '\n';
    }

    let result = this.matrixInputModel.rows + ' ' + this.matrixInputModel.cols + '\n\n' + m1 + '\n' + m2;

    this.solver.postMatrixAsText(result);
    this.uis.solverActive = true;
  }

  postMatrixAsText() {
    this.solver.postMatrixAsText(this.matrixInputModel.wholeMatrix);
    this.uis.solverActive = true;
  }
}
