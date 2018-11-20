import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DraggableWindowComponent } from './draggable-window.component';

describe('DraggableWindowComponent', () => {
  let component: DraggableWindowComponent;
  let fixture: ComponentFixture<DraggableWindowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DraggableWindowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DraggableWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
