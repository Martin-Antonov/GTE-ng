import {Component, OnInit, ViewChild} from '@angular/core';
import {MatrixInput} from './MatrixInput';
import {parseIntAutoRadix} from '@angular/common/src/i18n/format_number';
import {UiSettingsService} from '../../../services/ui-settings/ui-settings.service';
import {SolverService} from '../../../services/solver/solver.service';

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
  @ViewChild('p1Table') p1T;
  @ViewChild('p2Table') p2T;

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
    if (this.convertToNumber(this.matrixInputModel.rows) > 1 && this.convertToNumber(this.matrixInputModel.cols) > 1) {
      return true;
    }
    return false;
  }


  convertToNumber(value: string) {
    return Number(value);
  }

  postMatrixAsPlayersInput() {
    let m1 = '';
    let m2 = '';
    console.log(this.p1T);
    console.log(this.p1T.nativeElement.children[0].children);
    for (let i = 0; i < this.p1T.nativeElement.children[0].children.length; i++) {
      const childElement = this.p1T.nativeElement.children[0].children[i];
      for (let j = 0; j < childElement.children.length; j++) {
        const child = childElement.children[j];
        m1 += child.children[0].value + ' ';
      }
      m1 += '\n';
    }

    for (let i = 0; i < this.p2T.nativeElement.children[0].children.length; i++) {
      const childElement = this.p2T.nativeElement.children[0].children[i];
      for (let j = 0; j < childElement.children.length; j++) {
        const child = childElement.children[j];
        m2 += child.children[0].value + ' ';
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
