import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeededEntityComponent } from './seeded-entity.component';

describe('SeededEntityComponent', () => {
  let component: SeededEntityComponent;
  let fixture: ComponentFixture<SeededEntityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SeededEntityComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SeededEntityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
