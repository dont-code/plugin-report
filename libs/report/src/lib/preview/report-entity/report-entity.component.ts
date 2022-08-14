import {AfterViewInit, ChangeDetectorRef, Component, Injector, TemplateRef, ViewChild} from '@angular/core';
import {
  ComponentLoaderService, EntityListManager, EntityStoreService, FormElement,
  PluginBaseComponent,
  PossibleTemplateList,
  TemplateList,
} from '@dontcode/plugin-common';
import {Change, ChangeType, CommandProviderInterface, DontCodeModel, DontCodeModelPointer} from '@dontcode/core';
import {ValueService} from "@dontcode/sandbox";

@Component({
  selector: 'dontcode-report-entity',
  templateUrl: './report-entity.component.html',
  styleUrls: ['./report-entity.component.scss'],
})
export class ReportEntityComponent extends PluginBaseComponent implements AfterViewInit {

  @ViewChild('defaultdisplay')
  private defaultTemplate!: TemplateRef<any>;

  title="No Title";

  store:EntityListManager|null=null;
  dataLoading = false;

  constructor(loader: ComponentLoaderService, protected entityService:EntityStoreService, protected valueService: ValueService, injector: Injector, private ref: ChangeDetectorRef
  ) {
    super(loader, injector);
  }

  override initCommandFlow(
    provider: CommandProviderInterface,
    pointer: DontCodeModelPointer
  ): any {
    super.initCommandFlow(provider, pointer);

    if (!this.entityPointer)
      throw new Error(
        'Cannot listen to changes without knowing a base position'
      );
    const json=provider.getJsonAt(this.entityPointer.position);
    const targetInfo = this.valueService.findTargetOfProperty("for", this.entityPointer.position);

    if (targetInfo!=null) {
      this.store = this.entityService.retrieveListManager(targetInfo.pointer, json);
    }
    this.decomposeJsonToMultipleChanges(
      this.entityPointer,
      json
    ); // Dont provide a special handling for initial json, but emulate a list of changes
    this.initChangeListening(true); // Listen to all changes occuring after entityPointer
  }

  override ngAfterViewInit(): void {
    super.ngAfterViewInit();
    // When testing entityPointer is not defined
    if ((this.entityPointer)&&(this.provider)) {
      if( this.store!=null) {
        this.dataLoading=true;
        this.store.loadAll().then (() => {
          // eslint-disable-next-line no-restricted-syntax
          console.debug ("Loaded entities");
          this.dataLoading=false;
          this.updateSubFieldsValues ();
          this.ref.markForCheck();
          this.ref.detectChanges();
        }, reason => {
          this.dataLoading=false;
        });
      }
    } else {
      throw new Error ('Cannot create subcomponents before initCommandFlow is called');
    }
  }

  protected updateSubFieldsValues (): void {
    for (const field of this.fields) {
      if( field.component!=null) {
        field.component.setValue(this.store);
      }
    }
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
          this.updateSubFieldsValues();
          this.ref.markForCheck();
          this.ref.detectChanges();
        }
      }).catch(reason => {
        console.error(reason);
      })
    } else if (change?.pointer?.positionInSchema === DontCodeModel.APP_REPORTS_TITLE) {
      switch (change.type) {
        case ChangeType.DELETE:
          this.title='';
          break;
        default:
          this.title = change.value;
      }
    }
  }

  templateOf(field: FormElement): TemplateRef<any> {
    let ref = field.component?.providesTemplates(field.type).forFullView;
    if (!ref) ref = this.defaultTemplate;

    return ref;
  }

}
