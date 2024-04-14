import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UiSettingsService {
  strategicFormActive = false;
  sequentialFormActive = false;
  matrixInputActive = false;
  solverActive = false;
  settingsActive = false;
  shortcutsActive = false;
  consoleActive = false;
  quickstartActive = true;
  bestResponsesActive = true;
  saveFileActive = false;
  SPNEActive = false;
  algorithmsMenuOpen = false;

  stratFormScale: number;
  quickstartDontShowChecked: boolean;

  constructor() {
    this.stratFormScale = 1;
  }

  init() {
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
