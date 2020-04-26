import {Component, Input, OnInit} from '@angular/core';
import {UserActionController} from '../../../gte-core/gte/src/Controller/Main/UserActionController';
import {UserActionControllerService} from '../../../services/user-action-controller/user-action-controller.service';
import {UiSettingsService} from '../../../services/ui-settings/ui-settings.service';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-strategic-form-table',
  templateUrl: './strategic-form-table.component.html',
  styleUrls: ['./strategic-form-table.component.scss']
})
export class StrategicFormTableComponent implements OnInit {
  @Input() stratFormScaleCSS: string;
  userActionController: UserActionController;

  constructor(private uac: UserActionControllerService, public sanitizer: DomSanitizer, private uis: UiSettingsService) {
    this.uac.userActionController.subscribe((value) => {
      this.userActionController = value;
    });
  }

  ngOnInit() {
  }

  getOuterGridRows() {
    return this.sanitizer.bypassSecurityTrustStyle('repeat(' + this.userActionController.strategicFormResult.p3rows.length + ', 1fr)');
  }

  getOuterGridCols() {
    return this.sanitizer.bypassSecurityTrustStyle('repeat(' + this.userActionController.strategicFormResult.p4cols.length + ', 1fr)');
  }

  getInnerGridRows() {
    return this.sanitizer.bypassSecurityTrustStyle('repeat(' + this.userActionController.strategicFormResult.p1rows.length + ', 1fr)');
  }

  getInnerGridCols() {
    return this.sanitizer.bypassSecurityTrustStyle('repeat(' + this.userActionController.strategicFormResult.p2cols.length + ', 1fr)');
  }

  isThereP3() {
    return this.userActionController.strategicFormResult.p3Strategies.length !== 0 ||
      this.userActionController.treeController.tree.nodes.length === 1;
  }

  isThereP4() {
    return this.userActionController.strategicFormResult.p4Strategies.length !== 0 ||
      this.userActionController.treeController.tree.nodes.length === 1;
  }

  getInnerCellStyle(i: number, j: number, k: number, l: number) {
    const style = {};
    if (this.userActionController.strategicFormResult.payoffsMatrix[i][j][k][l].isEquilibrium() && this.uis.bestResponsesActive) {
      style['background'] = ['#f5f5f5'];
    }
    return style;
  }

  getP1PayoffStyle(i: number, j: number, k: number, l: number) {
    const style = {};
    if (!this.isThereP3() && !this.isThereP4()) {
      style['top'] = '47%';
    } else if ((this.isThereP3() && !this.isThereP4()) || (!this.isThereP3() && this.isThereP4())) {
      style['top'] = '27%';
    } else {
      style['top'] = '0';
    }

    if (this.userActionController.strategicFormResult.payoffsMatrix[i][j][k][l].isBestResponce[0] && this.uis.bestResponsesActive) {
      // style['background'] = 'rgba(255,0,0,0.15)';
      style['font-weight'] = '900';
      // style['text-decoration'] = 'underline';

      style['border'] = '1px solid red';
      style['line-height'] = '110%';
      style['padding'] = '0 2px';
    }
    return style;
  }

  getP2PayoffStyle(i: number, j: number, k: number, l: number) {
    const style = {};
    if (!this.isThereP3() && !this.isThereP4()) {
      style['left'] = '100%';
      style['transform'] = 'translateX(-100%)';
    } else if ((this.isThereP3() && !this.isThereP4()) || (!this.isThereP3() && this.isThereP4())) {
      style['left'] = '50%';
      style['top'] = '20%';
      style['transform'] = 'translate(-50%,-20%)';
    } else {
      style['left'] = '33%';
      style['transform'] = 'translateX(-33%)';
    }

    if (this.userActionController.strategicFormResult.payoffsMatrix[i][j][k][l].isBestResponce[1] && this.uis.bestResponsesActive) {
      // style['background'] = 'rgba(0,0,255,0.15)';
      if (!this.isSafari()) {
        style['font-weight'] = '900';
      }
      // style['text-decoration'] = 'underline';
      style['border'] = '1px solid blue';
      style['line-height'] = '110%';
      style['padding'] = '0 2px';
    }

    return style;
  }

  getP3PayoffStyle(i: number, j: number, k: number, l: number) {
    const style = {};
    if (this.isThereP4()) {
      style['left'] = '66%';
      style['transform'] = 'translateX(-66%)';
    } else {
      style['left'] = '100%';
      style['transform'] = 'translateX(-100%)';

    }
    if (this.userActionController.strategicFormResult.payoffsMatrix[i][j][k][l].isBestResponce[2] && this.uis.bestResponsesActive) {
      // style['background'] = 'rgba(0,255,0,0.15)';
      style['font-weight'] = '900';
      // style['text-decoration'] = 'underline';
      style['border'] = '1px solid #00bb00';
      style['line-height'] = '110%';
      style['padding'] = '0 2px';

    }
    return style;
  }

  getP4PayoffStyle(i: number, j: number, k: number, l: number) {
    const style = {};
    if (this.userActionController.strategicFormResult.payoffsMatrix[i][j][k][l].isBestResponce[3] && this.uis.bestResponsesActive) {
      // style['background'] = 'rgba(255,0,255,0.15)';
      style['font-weight'] = '900';
      // style['text-decoration'] = 'underline';
      style['border'] = '1px solid #ff00ff';
      style['line-height'] = '110%';
      style['padding'] = '0 2px';

    }
    return style;
  }

  transformStrategy(strategy: string) {
    let result = ``;
    const separateMoves = strategy.split(' ');
    separateMoves.forEach(move => {
        const moveWithSubscript = move.split('_');
        if (moveWithSubscript.length === 1) {
          result += moveWithSubscript[0];
        } else {
          result += moveWithSubscript[0] + '<sub>' + moveWithSubscript[1] + '</sub>';
        }
        result += ' ';
      }
    );
    return result;
  }

  getOutcome(i: number, j: number, k: number, l: number, outcome: number) {
    if (this.userActionController.treeController.treeView.properties.fractionOn) {
      const outcomePayoff = this.userActionController.strategicFormResult.payoffsMatrix[i][j][k][l].outcomes[outcome];
      if (outcomePayoff.n === 0) {
        return 0;
      } else if (outcomePayoff.d === 1) {
        const sign = outcomePayoff.s === 1 ? '' : '-';
        return sign + outcomePayoff.n;
      } else {
        const sign = outcomePayoff.s === 1 ? '' : '-';
        return sign + outcomePayoff.n + '/' + outcomePayoff.d;
      }
    } else {
      return this.userActionController.strategicFormResult.payoffsMatrix[i][j][k][l].outcomesAsDecimals[outcome];
    }
  }

  isSafari(): boolean {
    const chromeAgent = navigator.userAgent.indexOf('Chrome') > -1;
    let safariAgent = navigator.userAgent.indexOf('Safari') > -1;
    if (chromeAgent && safariAgent) {
      safariAgent = false;
    }
    return safariAgent;
  }
}


