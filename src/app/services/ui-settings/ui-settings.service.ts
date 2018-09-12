import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UiSettingsService {
  strategicFormActive: boolean;
  matrixInputActive: boolean;
  solverActive: boolean;

  constructor() {
  }

  init(){
    this.strategicFormActive = false;
    this.matrixInputActive = false;
    this.solverActive = false;
  }
}
