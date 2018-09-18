import { TestBed, inject } from '@angular/core/testing';

import { TreesFileService } from './trees-file.service';

describe('TreesFileService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TreesFileService]
    });
  });

  it('should be created', inject([TreesFileService], (service: TreesFileService) => {
    expect(service).toBeTruthy();
  }));
});
