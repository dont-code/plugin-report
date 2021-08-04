import {Component, Injector, OnInit} from '@angular/core';
import {ComponentLoaderService, PluginBaseComponent, PossibleTemplateList, TemplateList} from '@dontcode/plugin-common';

@Component({
  selector: 'dontcode-seeded-entity',
  templateUrl: './seeded-entity.component.html',
  styleUrls: ['./seeded-entity.component.scss']
})
export class SeededEntityComponent extends PluginBaseComponent {

  constructor(loader: ComponentLoaderService,
              injector: Injector) {
    super (loader, injector);
  }

  providesTemplates(key?: string): TemplateList {
    throw new Error('Method not implemented.');
  }
  canProvide(key?: string): PossibleTemplateList {
    throw new Error('Method not implemented.');
  }

}
