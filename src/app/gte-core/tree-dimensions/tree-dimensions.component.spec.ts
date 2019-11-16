import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeDimensionsComponent } from './tree-dimensions.component';

describe('TreeDimensionsComponent', () => {
  let component: TreeDimensionsComponent;
  let fixture: ComponentFixture<TreeDimensionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TreeDimensionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TreeDimensionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
