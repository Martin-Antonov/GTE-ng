import {Component, HostBinding, OnInit, ViewChild} from '@angular/core';
import {UserActionController} from '../../../gte-core/gte/src/Controller/Main/UserActionController';
import {UserActionControllerService} from '../../../services/user-action-controller/user-action-controller.service';

@Component({
  selector: 'app-label-input',
  templateUrl: './label-input.component.html',
  styleUrls: ['./label-input.component.scss']
})
export class LabelInputComponent implements OnInit {
  @ViewChild('inputLabel', {static: false}) inputField;
  userActionController: UserActionController;

  constructor(private uac: UserActionControllerService) {
  }

  ngOnInit() {
    this.uac.userActionController.subscribe((value: UserActionController) => {
      this.userActionController = value;
      if (value) {
        this.userActionController.labelInput.events.on('select-text', () => {
          this.selectInputText();
        }, this);
      }
    });
  }

  @HostBinding('style.display')
  private get textColor() {
    return this.userActionController && this.userActionController.labelInput.active ? 'block' : 'none';
  }

  private get x(): string {
    return this.userActionController.labelInput.fieldX + 15 + 'px';
  }

  private get y(): string {
    return this.userActionController.labelInput.fieldY + 60 + 'px';
  }

  private get value(): string {
    return this.userActionController.labelInput.getLabelValue();
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' || (event.key === 'Tab' && !event.shiftKey)) {
      this.changeLabel();
    } else if (event.key === 'Tab' && event.shiftKey) {
      this.userActionController.labelInput.show(false);
    }
  }

  private changeLabel() {
    this.userActionController.changeLabel(this.inputField.nativeElement.value);
    this.selectInputText();
  }

  private hide() {
    this.userActionController.labelInput.hide();
  }

  private selectInputText() {
    this.inputField.nativeElement.value = this.value;
    this.inputField.nativeElement.style.left = this.x;
    this.inputField.nativeElement.style.top = this.y;
    setTimeout(() => {
      this.inputField.nativeElement.select();
    }, 50);
  }
}
