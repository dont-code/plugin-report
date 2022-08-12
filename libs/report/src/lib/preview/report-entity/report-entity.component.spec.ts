import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportEntityComponent } from './report-entity.component';
import { PluginCommonModule } from '@dontcode/plugin-common';

describe('ReportedEntityComponent', () => {
  let component: ReportEntityComponent;
  let fixture: ComponentFixture<ReportEntityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReportEntityComponent],
      imports: [PluginCommonModule.forRoot()],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportEntityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
