import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UiSettingsService {
  strategicFormActive: boolean;
  matrixInputActive: boolean;
  solverActive: boolean;
  settingsActive: boolean;
  shortcutsActive: boolean;
  consoleActive: boolean;
  quickstartActive: boolean;
  bestResponsesActive: boolean;
  saveFileActive: boolean;
  SPNEActive: boolean;

  stratFormScale: number;
  quickstartDontShowChecked: boolean;

  constructor() {
    this.stratFormScale = 1;
  }

  init() {
    this.strategicFormActive = false;
    this.matrixInputActive = false;
    this.solverActive = false;
    this.settingsActive = false;
    this.shortcutsActive = false;
    this.consoleActive = false;
    this.bestResponsesActive = true;
    this.saveFileActive = false;
    this.SPNEActive = false;

    this.quickstartActive = true;

    try {
      const dontShowQuickstart = localStorage.getItem('dont-show-quickstart');
      if (dontShowQuickstart === '1') {
        this.quickstartActive = false;
        this.quickstartDontShowChecked = true;
      }
    } catch (err) {
      console.log('LOCAL STORAGE NOT AVAILABLE!');
    }
  }

  setQuickStartInactive() {
    try {
      const val = this.quickstartDontShowChecked ? '1' : '0';
      localStorage.setItem('dont-show-quickstart', val);
    } catch (err) {
      console.log('LOCAL STORAGE NOT AVAILABLE!');
    }
  }
}
