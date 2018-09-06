import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayersBoxComponent } from './players-box.component';

describe('PlayersBoxComponent', () => {
  let component: PlayersBoxComponent;
  let fixture: ComponentFixture<PlayersBoxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlayersBoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayersBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
