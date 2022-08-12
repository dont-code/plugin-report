import { Component, Injector } from '@angular/core';
import {
  ComponentLoaderService,
  PluginBaseComponent,
  PossibleTemplateList,
  TemplateList,
} from '@dontcode/plugin-common';
import { Change } from '@dontcode/core';

@Component({
  selector: 'dontcode-report-entity',
  templateUrl: './report-entity.component.html',
  styleUrls: ['./report-entity.component.scss'],
})
export class ReportEntityComponent extends PluginBaseComponent {
  constructor(loader: ComponentLoaderService, injector: Injector) {
    super(loader, injector);
  }

  providesTemplates(key?: string): TemplateList {
    throw new Error('Method not implemented.');
  }
  canProvide(key?: string): PossibleTemplateList {
    throw new Error('Method not implemented.');
  }

  handleChange(change: Change): void {}
}
