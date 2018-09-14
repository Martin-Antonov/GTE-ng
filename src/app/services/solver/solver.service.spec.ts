import { TestBed, inject } from '@angular/core/testing';

import { SolverService } from './solver.service';

describe('SolverService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SolverService]
    });
  });

  it('should be created', inject([SolverService], (service: SolverService) => {
    expect(service).toBeTruthy();
  }));
});
