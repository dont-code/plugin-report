import {Component, Injector, OnInit, TemplateRef, ViewChild} from '@angular/core';
import { AbstractDynamicComponent, ComponentLoaderService, PossibleTemplateList, TemplateList} from '@dontcode/plugin-common';

@Component({
  selector: 'dontcode-seed-field',
  templateUrl: './seed-field.component.html',
  styleUrls: ['./seed-field.component.scss']
})
export class SeedFieldComponent extends AbstractDynamicComponent {

  @ViewChild('inlineView')
  private inlineView!: TemplateRef<any>;

  @ViewChild('fullEditView')
  private fullEditView!: TemplateRef<any>;

  constructor() {
    super ();
  }

  providesTemplates (): TemplateList {
    return new TemplateList(this.inlineView, null, this.fullEditView);
  }

  canProvide(key?: string): PossibleTemplateList {
    return new PossibleTemplateList(true, false, true);
  }
}
