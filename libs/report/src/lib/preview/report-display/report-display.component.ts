import {Component, TemplateRef, ViewChild,} from '@angular/core';
import {
  AbstractDynamicComponent,
  EntityListManager,
  PossibleTemplateList,
  TemplateList,
} from '@dontcode/plugin-common';
import {Change, CommandProviderInterface, DontCodeModelPointer, PreviewHandler} from "@dontcode/core";

@Component({
  selector: 'dontcode-report-field',
  templateUrl: './report-display.component.html',
  styleUrls: ['./report-display.component.scss'],
})
export class ReportDisplayComponent extends AbstractDynamicComponent implements PreviewHandler {
  @ViewChild('fullView', {static: true})
  private fullView!: TemplateRef<any>;

  data: any = null;
  type?: string;

  provider: CommandProviderInterface | null = null;
  graphModelPointer: DontCodeModelPointer | null = null;

  constructor() {
    super();
  }

  providesTemplates(): TemplateList {
    return new TemplateList(null, this.fullView, this.fullView);
  }

  canProvide(key?: string): PossibleTemplateList {
    return new PossibleTemplateList(false, true, true);
  }

  setValue(val: any) {
    super.setValue(val);
    this.data = {
      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
      datasets: [
        {
          label: 'First Dataset',
          data: [65, 59, 80, 81, 56, 55, 40]
        }
        ]
    }
    //this.data = (val as EntityListManager).entities;
  }

  initCommandFlow(provider: CommandProviderInterface, pointer: DontCodeModelPointer): void {
    this.provider=provider;
    this.graphModelPointer=pointer;

    const json = this.provider.getJsonAt(pointer.position);
    this.type = this.translateType (json?.type);

  }

  protected translateType (dontCodeType?:string): string|undefined {
    if( dontCodeType!=null) {
      return dontCodeType.toLowerCase();
    }
    return;
  }

  handleChange(change: Change): void {
    // Nothing for now
  }

}
