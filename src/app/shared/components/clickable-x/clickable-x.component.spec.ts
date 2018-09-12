import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClickableXComponent } from './clickable-x.component';

describe('ClickableXComponent', () => {
  let component: ClickableXComponent;
  let fixture: ComponentFixture<ClickableXComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClickableXComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClickableXComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
