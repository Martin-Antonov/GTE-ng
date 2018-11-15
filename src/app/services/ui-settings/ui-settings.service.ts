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
  tutorialActive: boolean;
  bestResponsesActive: boolean;
  saveFileActive: boolean;

  constructor() {
  }

  init() {
    this.strategicFormActive = false;
    this.matrixInputActive = false;
    this.solverActive = false;
    this.settingsActive = false;
    this.shortcutsActive = false;
    this.consoleActive = false;
    this.tutorialActive = false;
    this.bestResponsesActive = true;
    this.saveFileActive = false;
  }
}
