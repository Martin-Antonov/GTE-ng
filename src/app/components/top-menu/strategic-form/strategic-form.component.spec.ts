import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StrategicFormComponent } from './strategic-form.component';

describe('StrategicFormComponent', () => {
  let component: StrategicFormComponent;
  let fixture: ComponentFixture<StrategicFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StrategicFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StrategicFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
