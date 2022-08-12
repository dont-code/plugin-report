import {Component, TemplateRef, ViewChild,} from '@angular/core';
import {AbstractDynamicComponent, PossibleTemplateList, TemplateList,} from '@dontcode/plugin-common';

@Component({
  selector: 'dontcode-report-field',
  templateUrl: './report-field.component.html',
  styleUrls: ['./report-field.component.scss'],
})
export class ReportFieldComponent extends AbstractDynamicComponent {
  @ViewChild('inlineView', { static: true })
  private inlineView!: TemplateRef<any>;

  @ViewChild('fullEditView', { static: true })
  private fullEditView!: TemplateRef<any>;

  seeds: Array<any>;

  constructor() {
    super();
    this.seeds = [
      { name: 'Tomato Report', code: 'Tomato' },
      { name: 'Rosa Report', code: 'Rosa' },
      { name: 'Pea Report', code: 'Pea' },
      { name: 'Bean Report', code: 'Bean' },
      { name: 'Other Report', code: 'Other' },
    ];
  }

  providesTemplates(): TemplateList {
    return new TemplateList(this.inlineView, null, this.fullEditView);
  }

  canProvide(key?: string): PossibleTemplateList {
    return new PossibleTemplateList(true, false, true);
  }
}
