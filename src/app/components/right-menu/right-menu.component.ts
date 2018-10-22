import {Component, OnInit} from '@angular/core';
import {UiSettingsService} from '../../services/ui-settings/ui-settings.service';

@Component({
  selector: 'app-right-menu',
  templateUrl: './right-menu.component.html',
  styleUrls: ['./right-menu.component.scss']
})
export class RightMenuComponent implements OnInit {


  constructor(public uis: UiSettingsService) {
  }

  ngOnInit() {
  }
}
