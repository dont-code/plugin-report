import {Component, TemplateRef, ViewChild,} from '@angular/core';
import {AbstractDynamicComponent, PossibleTemplateList, TemplateList,} from '@dontcode/plugin-common';

@Component({
  selector: 'dontcode-report-field',
  templateUrl: './report-display.component.html',
  styleUrls: ['./report-display.component.scss'],
})
export class ReportDisplayComponent extends AbstractDynamicComponent {
  @ViewChild('inlineView', { static: true })
  private inlineView!: TemplateRef<any>;

  constructor() {
    super();
  }

  providesTemplates(): TemplateList {
    return new TemplateList(this.inlineView, this.inlineView, this.inlineView);
  }

  canProvide(key?: string): PossibleTemplateList {
    return new PossibleTemplateList(true, true, true);
  }
}
