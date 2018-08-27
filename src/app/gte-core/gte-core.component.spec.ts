import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GteCoreComponent } from './gte-core.component';

describe('GteCoreComponent', () => {
  let component: GteCoreComponent;
  let fixture: ComponentFixture<GteCoreComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GteCoreComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GteCoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
