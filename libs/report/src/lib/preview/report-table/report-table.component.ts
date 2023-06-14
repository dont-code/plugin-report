import {ChangeDetectorRef, Component, Injector, TemplateRef, ViewChild} from '@angular/core';
import {
  Change,
  CommandProviderInterface,
  DontCodeModel,
  DontCodeModelPointer,
  DontCodeSchemaManager,
  dtcde
} from "@dontcode/core";
import {
  ComponentLoaderService,
  DynamicComponent,
  EntityListManager,
  PluginBaseComponent,
  PossibleTemplateList,
  TemplateList,
  ValueService
} from "@dontcode/plugin-common";

@Component({
  selector: 'dontcode-report-table',
  templateUrl: './report-table.component.html',
  styleUrls: ['./report-table.component.scss'],
})
export class ReportTableComponent extends PluginBaseComponent {
  @ViewChild('fullView', {static: true})
  private fullView!: TemplateRef<any>;

  cols = new Array<PrimeColumn>();
  colsMap = new Map<string, number>();

  title="";

  provider: CommandProviderInterface | null = null;
  targetEntityPointer: DontCodeModelPointer | null = null;
  reportPointer:DontCodeModelPointer|null=null;
  cleanedTableData: any[]=[];

  entityNamePropertyName?:string|null;

  constructor(protected valueService:ValueService, protected schemaMgr:DontCodeSchemaManager, protected loader:ComponentLoaderService, protected ref:ChangeDetectorRef, protected injector:Injector) {
    super(loader, injector, ref);
    if (this.schemaMgr==null)
      this.schemaMgr=dtcde.getSchemaManager();
  }

  providesTemplates(): TemplateList {
    return new TemplateList(null, this.fullView, this.fullView);
  }

  canProvide(key?: string): PossibleTemplateList {
    return new PossibleTemplateList(false, true, true);
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

    this.reportPointer=this.entityPointer.parentPointer(this.schemaMgr)?.parentPointer(this.schemaMgr)??null;
    if (this.reportPointer!=null) {
      const targetInfo = this.valueService.findTargetOfProperty("for", this.reportPointer.position);

      if (targetInfo!=null) {
        this.targetEntityPointer=this.schemaMgr.generateSchemaPointer(targetInfo.pointer);
        this.pluginHelper.initOtherChangeListening(true, this.targetEntityPointer.subPropertyPointer(DontCodeModel.APP_FIELDS_NODE));
        this.decomposeJsonToMultipleChanges(
          this.targetEntityPointer,
          targetInfo.value
        ); // Dont provide a special handling for initial json, but emulate a list of changes
      }
    }

    this.initChangeListening(true); // Listen to all changes occuring after entityPointer
  }

  templateOf(col: PrimeColumn, value: any): TemplateRef<any> {
    if (col.component!=null) {
      col.component.setValue(value);
      const ref = col.component.providesTemplates(col.type).forInlineView;
      if (ref) return ref;
    }
    throw new Error('No component or template to display ' + col.type);
  }

  override setValue(val: EntityListManager) {
    super.setValue(val);
    if( val.entities!=null)
      this.cleanedTableData=val.entities;
    else
      this.cleanedTableData=[];
  }
    /**
   * Make the appropriate display updates whenever a change is received
   * @param change
   */
  override handleChange(change: Change) {
    //console.log("Changed Entity",change.position);

        // We only care when a field has been modified
    if (this.targetEntityPointer?.subPropertyPointer(DontCodeModel.APP_FIELDS_NODE).isParentOf(change.position, true)) {
      // Columns have been changed
      this.applyUpdatesToArrayAsync(
        this.cols,
        this.colsMap,
        change,
        null,
        (position, value) => {
          return this.loadSubComponent(position, value.type, value.name).then((component) => {
            const ret = new PrimeColumn(value.name, value.name, value.type);
            if (component) {
              // Keep the component only if it provides the view template
              if (component.canProvide(value.type).forInlineView) {
                ret.component = component;
                this.applyComponentToSubField(component, value.type, value.name);
              }
            }
            return ret;
          });
        },
        this.targetEntityPointer?.subPropertyPointer(DontCodeModel.APP_FIELDS_NODE).position
      ).then((updatedColumns) => {

        this.cols = updatedColumns;
        //  this.reloadData ();
        this.ref.markForCheck();
        this.ref.detectChanges();
      });
    }
  }

}

class PrimeColumn {
  field: string;
  header: string;
  type: string;
  component: DynamicComponent | null;

  constructor(field: string, header: string, type: string) {
    this.field = field;
    this.header = header;
    this.type = type;
    this.component = null;
  }
}
