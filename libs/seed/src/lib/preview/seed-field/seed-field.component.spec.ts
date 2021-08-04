import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeedFieldComponent } from './seed-field.component';

describe('SeedFieldComponent', () => {
  let component: SeedFieldComponent;
  let fixture: ComponentFixture<SeedFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SeedFieldComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SeedFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
