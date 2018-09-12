import { TestBed, inject } from '@angular/core/testing';

import { UiSettingsService } from './ui-settings.service';

describe('UiSettingsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UiSettingsService]
    });
  });

  it('should be created', inject([UiSettingsService], (service: UiSettingsService) => {
    expect(service).toBeTruthy();
  }));
});
