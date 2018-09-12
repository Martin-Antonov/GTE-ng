import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SquareButtonComponent } from './square-button.component';

describe('SquareButtonComponent', () => {
  let component: SquareButtonComponent;
  let fixture: ComponentFixture<SquareButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SquareButtonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SquareButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
