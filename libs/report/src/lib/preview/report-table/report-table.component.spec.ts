import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ReportTableComponent} from './report-table.component';
import {ComponentLoaderService, EntityListManager, PluginCommonModule} from "@dontcode/plugin-common";
import {
  DontCodeGroupOperationType,
  DontCodeStoreAggregate,
  DontCodeStoreGroupby,
  DontCodeStoreGroupedByEntities, DontCodeStoreGroupedByValues,
  DontCodeStorePreparedEntities,
  DontCodeTestManager,
  dtcde,
  TestProviderInterface
} from "@dontcode/core";
import {By} from "@angular/platform-browser";
import {Component, TemplateRef} from "@angular/core";
import {CommonModule} from "@angular/common";
import {TableModule} from "primeng/table";
import {BasicModule} from "@dontcode/plugin-basic";
import {FieldsModule} from "@dontcode/plugin-fields";
import {TooltipModule} from "primeng/tooltip";
import {SandboxModule} from "@dontcode/sandbox";

describe('ReportTableComponent', () => {
  let component: ReportTableComponent;
  let fixture: ComponentFixture<ReportTableComponent>;
  let containerFixture: ComponentFixture<TestInsertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReportTableComponent, TestInsertComponent],
      imports: [PluginCommonModule.forRoot(), SandboxModule, BasicModule, FieldsModule, CommonModule, TableModule, TooltipModule]
    }).compileComponents();

    // For some reasons, plugin module are not correctly registered by TestBed in Angular, so I just register them internally
    const cls:ComponentLoaderService = TestBed.inject(ComponentLoaderService);
    cls.registerModuleForTest(FieldsModule, 'fields');
    cls.registerModuleForTest(BasicModule, 'basic');

    fixture = TestBed.createComponent(ReportTableComponent);
    component=fixture.componentInstance;

    TestInsertComponent.COMPONENT_TO_TEST=component;
    containerFixture = TestBed.createComponent(TestInsertComponent);
    containerFixture.detectChanges();
    fixture.detectChanges();
    await containerFixture.whenStable();
  });

  it('should create', () => {
    expect(containerFixture.componentInstance).toBeTruthy();
  });

  it('should display a grouped table',async () => {
    dtcde.getModelManager().resetContent(MODEL);

    const provider = new TestProviderInterface(dtcde.getModelManager().findAtPosition('creation/reports/bb/as/bba'));
    const entityPointer = provider.calculatePointerFor('creation/reports/bb/as/bba');
    component.initCommandFlow(provider, entityPointer);

    await DontCodeTestManager.waitUntilTrueAndEmit(() => {
      console.log("Here");
      return component.cols.length == 5;
    }, 20, 5).then(async value => {
      if (!value) throw new Error ("No column values are updated");
      else {

        containerFixture.detectChanges();
        await containerFixture.whenStable();
          // We pre-populate all fields to just test the display
        const dontCodeStoreAggregate = new DontCodeStoreAggregate('value', DontCodeGroupOperationType.Sum);
        component.setValue(new TestEntityListManager('creation/entities/aa', new DontCodeStorePreparedEntities<any>(
          [{
            name: 'Test1',
            type: 'Type1',
            value: 123,
            amount: {amount: 250, currencyCode: 'EUR'},
            date: new Date(2023, 5, 12)
          }, {
            name: 'Test3',
            type: 'Type1',
            value: 234,
            amount: {amount: 43, currencyCode: 'EUR'},
            date: new Date(2023, 4, 14)
          }, {
            name: 'Test2',
            type: 'Type2',
            value: 456,
            amount: {amount: 125, currencyCode: 'EUR'},
            date: new Date(2023, 5, 14)
          }], undefined, new DontCodeStoreGroupedByEntities(
            new DontCodeStoreGroupby('type', [dontCodeStoreAggregate]),
            new Map ([
              ['Type1',new Map([[dontCodeStoreAggregate.of,[new DontCodeStoreGroupedByValues(dontCodeStoreAggregate, 123+234)]]])],
              ['Type2',new Map([[dontCodeStoreAggregate.of,[new DontCodeStoreGroupedByValues(dontCodeStoreAggregate, 456)]]])]
            ]
          ))
        )));

        containerFixture.detectChanges();
        await containerFixture.whenStable();
        expect(component.cleanedTableData).toHaveLength(3);
        expect(component.cols).toHaveLength(5);
        const tableRows = containerFixture.debugElement.queryAll(By.css('tr'));
        expect(tableRows).toHaveLength(6);


        expect(tableRows[1].children[0].nativeElement.textContent.trim()).toEqual('Test1');
        expect(tableRows[1].children[1].nativeElement.textContent.trim()).toEqual('Type1');
        expect(tableRows[1].children[2].nativeElement.textContent.trim()).toEqual('123');
        expect(tableRows[1].children[3].nativeElement.textContent.trim()).toEqual('€250.00');
        expect(tableRows[1].children[4].nativeElement.textContent.trim()).toEqual('06/12/2023');

          // Check the groupedby have been calculated correctly
        expect(tableRows[3].children[2].nativeElement.textContent.trim()).toEqual('357');
        expect(tableRows[5].children[2].nativeElement.textContent.trim()).toEqual('456');
      }

    });
  });

});

const MODEL_SUMTEST_GROUPBY=[{
  of: 'type',
  label: 'Sum of values',
  display: [
    {
      operation: DontCodeGroupOperationType.Sum,
      of: 'value'
    }
  ]
}];

const MODEL = {
  creation: {
    entities: {
      'aa': {
        name: 'Entity1',
        fields: {
          'aaa': {
            name: 'name',
            type: 'Text'
          },
          'aaaa': {
            name:'type',
            type:'Text'
          },
          'aab': {
            name: 'value',
            type: 'number'
          },
          'aac': {
            name: 'amount',
            type: 'Euro'
          },
          'aad': {
            name: 'date',
            type: 'Date'
          }
        }
      }
    },
    reports: {
      'ba': {
        title: 'Test',
        for: 'Entity1',
        as: {
          'baa': {
            title: 'Simple Table',
            type: 'Table'
          }
        }
      },
      'bb': {
        title: 'SumTest',
        for: 'Entity1',
        as: {
          'bba': {
            title: 'Sum Table',
            type: 'Table',
            of: 'value',
            groupedBy: MODEL_SUMTEST_GROUPBY
          }
        }
      }
    }
  }
};


class TestEntityListManager extends EntityListManager<any> {
  constructor(position:string, prepared: DontCodeStorePreparedEntities<any>) {
    super(position, {}, dtcde.getStoreManager());
    this.entities=prepared.sortedData;
    this.prepared=prepared;
  }

}

@Component({
  selector: 'dontcode-test-insert',
  template: '<ng-container *ngTemplateOutlet="getTemplate()"></ng-container>'
})
class TestInsertComponent {

  public static COMPONENT_TO_TEST:ReportTableComponent;

  getTemplate (): TemplateRef<any>|null {
    return TestInsertComponent.COMPONENT_TO_TEST.providesTemplates().forFullView;
  }

}

