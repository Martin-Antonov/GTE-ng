import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorLogComponent } from './error-log.component';

describe('ErrorLogComponent', () => {
  let component: ErrorLogComponent;
  let fixture: ComponentFixture<ErrorLogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ErrorLogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrorLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
