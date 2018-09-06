import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicLButtonComponent } from './basic-l-button.component';

describe('BasicLButtonComponent', () => {
  let component: BasicLButtonComponent;
  let fixture: ComponentFixture<BasicLButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BasicLButtonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BasicLButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
