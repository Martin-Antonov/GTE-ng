import { TestBed, inject } from '@angular/core/testing';
import {UserActionControllerService} from './user-action-controller.service';



describe('UserActionControllerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserActionControllerService]
    });
  });

  it('should be created', inject([UserActionControllerService], (service: UserActionControllerService) => {
    expect(service).toBeTruthy();
  }));
});
