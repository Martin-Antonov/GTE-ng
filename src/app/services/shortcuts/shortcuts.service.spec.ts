import { TestBed, inject } from '@angular/core/testing';

import { ShortcutsService } from './shortcuts.service';

describe('ShortcutsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ShortcutsService]
    });
  });

  it('should be created', inject([ShortcutsService], (service: ShortcutsService) => {
    expect(service).toBeTruthy();
  }));
});
