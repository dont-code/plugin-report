import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportFieldComponent } from './report-field.component';
import { PluginCommonModule } from '@dontcode/plugin-common';

describe('ReportFieldComponent', () => {
  let component: ReportFieldComponent;
  let fixture: ComponentFixture<ReportFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReportFieldComponent],
      imports: [PluginCommonModule.forRoot()],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
