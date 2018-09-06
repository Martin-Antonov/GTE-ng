import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeTabComponent } from './tree-tab.component';

describe('TreeTabComponent', () => {
  let component: TreeTabComponent;
  let fixture: ComponentFixture<TreeTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TreeTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TreeTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
