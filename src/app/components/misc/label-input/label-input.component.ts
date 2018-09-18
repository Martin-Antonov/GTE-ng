import {Component, OnInit, ViewChild} from '@angular/core';
import {UserActionController} from '../../../gte-core/gte/src/Controller/UserActionController';
import {UserActionControllerService} from '../../../services/user-action-controller/user-action-controller.service';

@Component({
  selector: 'app-label-input',
  templateUrl: './label-input.component.html',
  styleUrls: ['./label-input.component.scss']
})
export class LabelInputComponent implements OnInit {
  @ViewChild('inputLabel') inputField;

  userActionController: UserActionController;

  constructor(private uac: UserActionControllerService) {
  }

  ngOnInit() {
    this.uac.userActionController.subscribe((value) => {
      this.userActionController = value;
    });
    setTimeout(() => {
      this.userActionController.labelInput.selectTextSignal.add(() => {
        this.selectInputText();
      }, this);
    }, 2000);
  }

  changeLabel() {
    this.userActionController.changeLabel(this.inputField.nativeElement.value);
    this.selectInputText();
  }

  getValue() {
    return this.userActionController.labelInput.getLabelValue();
  }

  getX() {
    return this.userActionController.labelInput.fieldX + 15 + 'px';
  }

  getY() {
    return this.userActionController.labelInput.fieldY + 60 + 'px';
  }

  hide() {
    this.userActionController.labelInput.hide();
  }

  checkInputShown() {
    return this.userActionController && this.userActionController.labelInput.active;

  }

  selectInputText() {
    setTimeout(() => {
        if (this.inputField && this.inputField.nativeElement) {
          this.inputField.nativeElement.select();
        }
      },
      50);
  }
}
