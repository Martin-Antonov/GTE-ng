import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ToggleLButtonComponent } from './toggle-l-button.component';

describe('ToggleLButtonComponent', () => {
  let component: ToggleLButtonComponent;
  let fixture: ComponentFixture<ToggleLButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ToggleLButtonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToggleLButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
