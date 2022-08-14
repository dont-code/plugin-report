import {ChangeDetectorRef, Component, Injector, TemplateRef, ViewChild} from '@angular/core';
import {
  ComponentLoaderService, FormElement,
  PluginBaseComponent,
  PossibleTemplateList,
  TemplateList,
} from '@dontcode/plugin-common';
import {Change, CommandProviderInterface, DontCodeModel, DontCodeModelPointer} from '@dontcode/core';

@Component({
  selector: 'dontcode-report-entity',
  templateUrl: './report-entity.component.html',
  styleUrls: ['./report-entity.component.scss'],
})
export class ReportEntityComponent extends PluginBaseComponent {

  @ViewChild('defaultdisplay')
  private defaultTemplate!: TemplateRef<any>;

  title="No Title";

  constructor(loader: ComponentLoaderService, injector: Injector,     private ref: ChangeDetectorRef
  ) {
    super(loader, injector);
  }

  override initCommandFlow(
    provider: CommandProviderInterface,
    pointer: DontCodeModelPointer
  ): any {
    //this.initing=true;
    super.initCommandFlow(provider, pointer);

    if (!this.entityPointer)
      throw new Error(
        'Cannot listen to changes without knowing a base position'
      );
    this.decomposeJsonToMultipleChanges(
      this.entityPointer,
      provider.getJsonAt(this.entityPointer.position)
    ); // Dont provide a special handling for initial json, but emulate a list of changes
    this.initChangeListening(true); // Listen to all changes occuring after entityPointer
  }

  providesTemplates(key?: string): TemplateList {
    throw new Error('Method not implemented.');
  }
  canProvide(key?: string): PossibleTemplateList {
    throw new Error('Method not implemented.');
  }

  handleChange(change: Change): void {
    if (change?.pointer?.positionInSchema === DontCodeModel.APP_REPORTS_DISPLAY) {
      this.updateSubFieldsWithChange(change, DontCodeModel.APP_REPORTS_DISPLAY_NODE).then(value => {
        if (value != null) {
          this.ref.markForCheck();
          this.ref.detectChanges();
        }
      })
    }
  }

  templateOf(field: FormElement): TemplateRef<any> {
    let ref = field.component?.providesTemplates(field.type).forFullView;
    if (!ref) ref = this.defaultTemplate;

    return ref;
  }

}
