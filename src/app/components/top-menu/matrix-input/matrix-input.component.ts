import {Component, OnInit} from '@angular/core';
import {MatrixInput} from './MatrixInput';
import {parseIntAutoRadix} from '@angular/common/src/i18n/format_number';

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

  constructor() {
  }

  ngOnInit() {
    this.fromTextActive = false;
    this.fromMatricesActive = false;
    this.textMatrixPlaceholder = '2 2     (dimensions)\n\n5 0     (player 1 matrix)\n0 1\n\n-1 3     (player 2 matrix)\n3-2';
    this.matrixInputModel = new MatrixInput('', 0, 0);
  }

  close() {

  }

  createArray(number): Array<any> {
    return new Array(parseInt(number, 10));
  }

  activateFromText() {
    this.fromTextActive = true;
    this.fromMatricesActive = false;
  }

  activatePlayerMatrix() {
    this.fromTextActive = false;
    this.fromMatricesActive = true;
  }
}
