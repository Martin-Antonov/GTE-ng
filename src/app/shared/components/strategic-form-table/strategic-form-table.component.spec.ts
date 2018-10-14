import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StrategicFormTableComponent } from './strategic-form-table.component';

describe('StrategicFormTableComponent', () => {
  let component: StrategicFormTableComponent;
  let fixture: ComponentFixture<StrategicFormTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StrategicFormTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StrategicFormTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
