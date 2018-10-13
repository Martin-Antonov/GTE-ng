import {Component, OnInit} from '@angular/core';
import {SolverService} from '../../../services/solver/solver.service';
import {UiSettingsService} from '../../../services/ui-settings/ui-settings.service';

@Component({
  selector: 'app-solver',
  templateUrl: './solver.component.html',
  styleUrls: ['./solver.component.scss']
})
export class SolverComponent implements OnInit {

  constructor(public solver: SolverService, private uis: UiSettingsService) {
  }

  ngOnInit() {
  }

  closeWindow() {
    this.uis.solverActive = false;
  }
}
