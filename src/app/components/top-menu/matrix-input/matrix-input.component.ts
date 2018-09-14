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
  p1Matrix: Array<Array<string>>;
  p2Matrix: Array<Array<string>>;


  constructor(public uis: UiSettingsService, private solver: SolverService) {
  }

  ngOnInit() {
    this.fromTextActive = false;
    this.fromMatricesActive = false;
    this.textMatrixPlaceholder = '2 2     (dimensions)\n\n5 0     (player 1 matrix)\n0 1\n\n-1 3     (player 2 matrix)\n3-2';
    this.matrixInputModel = new MatrixInput('', '0', '0');
  }

  createP1Matrix(): Array<Array<string>> {
    this.p1Matrix = new Array(parseInt(this.matrixInputModel.rows, 10)).fill(
      new Array(parseInt(this.matrixInputModel.cols, 10)).fill('')
    );
    return new Array(this.convertToNumber(this.matrixInputModel.rows));
  }

  createP2Matrix(): Array<Array<string>> {
    this.p2Matrix = new Array(parseInt(this.matrixInputModel.rows, 10)).fill(
      new Array(parseInt(this.matrixInputModel.cols, 10)).fill('')
    );
    return new Array(this.convertToNumber(this.matrixInputModel.rows));
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

  postMatrixAsText() {
    this.solver.postMatrixAsText(this.matrixInputModel.wholeMatrix);
    this.uis.solverActive = true;
  }

  convertToNumber(value: string) {
    return Number(value);
  }

  postMatrixAsPlayersInput() {
    console.table(this.p1Matrix);
  }
}
