import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ReportTableComponent} from './report-table.component';
import {ComponentLoaderService, EntityListManager, PluginCommonModule} from "@dontcode/plugin-common";
import {
  DontCodeGroupOperationType,
  DontCodeStoreAggregate,
  DontCodeStoreGroupby,
  DontCodeStoreGroupedByEntities,
  DontCodeStoreGroupedByValues,
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

const sortedData = [{
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
}];
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

  it('should display a non grouped table',async () => {
    dtcde.getModelManager().resetContent(MODEL);

    const provider = new TestProviderInterface(dtcde.getModelManager().findAtPosition('creation/reports/ba/as/baa'));
    const entityPointer = provider.calculatePointerFor('creation/reports/ba/as/baa');
    component.initCommandFlow(provider, entityPointer);

    await DontCodeTestManager.waitUntilTrueAndEmit(() => {
      return component.cols.length == 5;
    }, 20, 5).then(async value => {
      if (!value) throw new Error ("No column values are updated");
      else {
        component.setValue(new TestEntityListManager('creation/entities/aa', new DontCodeStorePreparedEntities<any>(
          sortedData, undefined, undefined
        )));

        containerFixture.detectChanges();
        expect(component.cleanedTableData).toHaveLength(3);
        expect(component.cols).toHaveLength(5);
        const tableRows = containerFixture.debugElement.queryAll(By.css('tr'));
        expect(tableRows).toHaveLength(4);


        expect(tableRows[1].children[0].nativeElement.textContent.trim()).toEqual('Test1');
        expect(tableRows[1].children[1].nativeElement.textContent.trim()).toEqual('Type1');
        expect(tableRows[1].children[2].nativeElement.textContent.trim()).toEqual('123');
        expect(tableRows[1].children[3].nativeElement.textContent.trim()).toEqual('€250.00');
        expect(tableRows[1].children[4].nativeElement.textContent.trim()).toEqual('06/12/2023');

      }

    });
  });

  it('should display a grouped table with simple types',async () => {
    dtcde.getModelManager().resetContent(MODEL);

    const provider = new TestProviderInterface(dtcde.getModelManager().findAtPosition('creation/reports/bb/as/bba'));
    const entityPointer = provider.calculatePointerFor('creation/reports/bb/as/bba');
    component.initCommandFlow(provider, entityPointer);

    await DontCodeTestManager.waitUntilTrueAndEmit(() => {
      return component.cols.length == 5;
    }, 20, 5).then(async value => {
      if (!value) throw new Error ("No column values are updated");
      else {
          // We pre-populate all fields to just test the display
        const dontCodeStoreAggregates = [
          new DontCodeStoreAggregate('value', DontCodeGroupOperationType.Sum),
          new DontCodeStoreAggregate('value', DontCodeGroupOperationType.Minimum),
          new DontCodeStoreAggregate('name', DontCodeGroupOperationType.Count),
          new DontCodeStoreAggregate('value', DontCodeGroupOperationType.Maximum)
        ];
        component.setValue(new TestEntityListManager('creation/entities/aa', new DontCodeStorePreparedEntities<any>(
          sortedData, undefined, new DontCodeStoreGroupedByEntities(
            new DontCodeStoreGroupby('type', dontCodeStoreAggregates),
            new Map ([
              ['Type1',[new DontCodeStoreGroupedByValues(dontCodeStoreAggregates[0], 123+234),
              new DontCodeStoreGroupedByValues(dontCodeStoreAggregates[1], 123),
              new DontCodeStoreGroupedByValues(dontCodeStoreAggregates[2], 2),
              new DontCodeStoreGroupedByValues(dontCodeStoreAggregates[3], 234)]],
              ['Type2',[new DontCodeStoreGroupedByValues(dontCodeStoreAggregates[0], 456),
                new DontCodeStoreGroupedByValues(dontCodeStoreAggregates[1], 456),
                new DontCodeStoreGroupedByValues(dontCodeStoreAggregates[2], 1),
                new DontCodeStoreGroupedByValues(dontCodeStoreAggregates[3], 456)]],
            ]
          ))
        )));

        containerFixture.detectChanges();
        expect(component.cleanedTableData).toHaveLength(3);
        expect(component.cols).toHaveLength(5);
        const tableRows = containerFixture.debugElement.queryAll(By.css('tr'));
        expect(tableRows).toHaveLength(6);

          // Check the groupedby have been calculated correctly
        expect(tableRows[3].children[0].nativeElement.textContent.trim()).toEqual('Count:\xa02');
        expect(tableRows[3].children[2].nativeElement.textContent.trim()).toEqual('Sum:\xa0357Minimum:\xa0123Maximum:\xa0234');
        expect(tableRows[5].children[0].nativeElement.textContent.trim()).toEqual('Count:\xa01');
        expect(tableRows[5].children[2].nativeElement.textContent.trim()).toEqual('Sum:\xa0456Minimum:\xa0456Maximum:\xa0456');
      }

    });
  });

  it('should display a grouped table with plugin types',async () => {
    dtcde.getModelManager().resetContent(MODEL);

    const provider = new TestProviderInterface(dtcde.getModelManager().findAtPosition('creation/reports/bb/as/bba'));
    const entityPointer = provider.calculatePointerFor('creation/reports/bb/as/bba');
    component.initCommandFlow(provider, entityPointer);

    await DontCodeTestManager.waitUntilTrueAndEmit(() => {
      return component.cols.length == 5;
    }, 20, 5).then(async value => {
      if (!value) throw new Error ("No column values are updated");
      else {
        // We pre-populate all fields to just test the display
        const dontCodeStoreAggregates = [
          new DontCodeStoreAggregate('amount', DontCodeGroupOperationType.Sum),
          new DontCodeStoreAggregate('date', DontCodeGroupOperationType.Minimum),
          new DontCodeStoreAggregate('amount', DontCodeGroupOperationType.Average),
          new DontCodeStoreAggregate('date', DontCodeGroupOperationType.Maximum)
        ];
        component.setValue(new TestEntityListManager('creation/entities/aa', new DontCodeStorePreparedEntities<any>(
          sortedData, undefined, new DontCodeStoreGroupedByEntities(
            new DontCodeStoreGroupby('type', dontCodeStoreAggregates),
            new Map ([
                ['Type1',[new DontCodeStoreGroupedByValues(dontCodeStoreAggregates[0], {amount: 250+43, currencyCode: 'EUR'}),
                  new DontCodeStoreGroupedByValues(dontCodeStoreAggregates[1], new Date(2023, 5, 12)),
                  new DontCodeStoreGroupedByValues(dontCodeStoreAggregates[2], {amount: (250+43)/2, currencyCode: 'EUR'}),
                  new DontCodeStoreGroupedByValues(dontCodeStoreAggregates[3], new Date(2023, 5, 14))]],
                ['Type2',[new DontCodeStoreGroupedByValues(dontCodeStoreAggregates[0], {amount: 125, currencyCode: 'EUR'}),
                  new DontCodeStoreGroupedByValues(dontCodeStoreAggregates[1], new Date(2023, 4, 14)),
                  new DontCodeStoreGroupedByValues(dontCodeStoreAggregates[2], {amount: 125, currencyCode: 'EUR'}),
                  new DontCodeStoreGroupedByValues(dontCodeStoreAggregates[3], new Date(2023, 4, 14))]],
              ]
            ))
        )));

        containerFixture.detectChanges();
        expect(component.cleanedTableData).toHaveLength(3);
        expect(component.cols).toHaveLength(5);
        const tableRows = containerFixture.debugElement.queryAll(By.css('tr'));
        expect(tableRows).toHaveLength(6);

        // Check the groupedby have been calculated correctly
        expect(tableRows[3].children[3].nativeElement.textContent.trim()).toEqual('Sum:\xa0€293.00Average:\xa0€146.50');
        expect(tableRows[3].children[4].nativeElement.textContent.trim()).toEqual('Minimum:\xa006/12/2023Maximum:\xa006/14/2023');
        expect(tableRows[5].children[3].nativeElement.textContent.trim()).toEqual('Sum:\xa0€125.00Average:\xa0€125.00');
        expect(tableRows[5].children[4].nativeElement.textContent.trim()).toEqual('Minimum:\xa005/14/2023Maximum:\xa005/14/2023');
      }

    });
  });
  it('should display correctly "count of" plugin types',async () => {
    dtcde.getModelManager().resetContent(MODEL);

    const provider = new TestProviderInterface(dtcde.getModelManager().findAtPosition('creation/reports/bb/as/bba'));
    const entityPointer = provider.calculatePointerFor('creation/reports/bb/as/bba');
    component.initCommandFlow(provider, entityPointer);

    await DontCodeTestManager.waitUntilTrueAndEmit(() => {
      return component.cols.length == 5;
    }, 20, 5).then(async value => {
      if (!value) throw new Error("No column values are updated");
      else {
        // We pre-populate all fields to just test the display
        const dontCodeStoreAggregates = [
          new DontCodeStoreAggregate('amount', DontCodeGroupOperationType.Count),
          new DontCodeStoreAggregate('date', DontCodeGroupOperationType.Count)
        ];
        component.setValue(new TestEntityListManager('creation/entities/aa', new DontCodeStorePreparedEntities<any>(
          sortedData, undefined, new DontCodeStoreGroupedByEntities(
            new DontCodeStoreGroupby('type', dontCodeStoreAggregates),
            new Map([
                ['Type1', [new DontCodeStoreGroupedByValues(dontCodeStoreAggregates[0], 2),
                  new DontCodeStoreGroupedByValues(dontCodeStoreAggregates[1], 2)]],
                ['Type2', [new DontCodeStoreGroupedByValues(dontCodeStoreAggregates[0], 1),
                  new DontCodeStoreGroupedByValues(dontCodeStoreAggregates[1], 1)]]
              ]
            ))
        )));

        containerFixture.detectChanges();
        expect(component.cleanedTableData).toHaveLength(3);
        expect(component.cols).toHaveLength(5);
        const tableRows = containerFixture.debugElement.queryAll(By.css('tr'));
        expect(tableRows).toHaveLength(6);

        // Check the groupedby have been calculated correctly
        expect(tableRows[3].children[3].nativeElement.textContent.trim()).toEqual('Count:\xa02');
        expect(tableRows[3].children[4].nativeElement.textContent.trim()).toEqual('Count:\xa02');
        expect(tableRows[5].children[3].nativeElement.textContent.trim()).toEqual('Count:\xa01');
        expect(tableRows[5].children[4].nativeElement.textContent.trim()).toEqual('Count:\xa01');
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
        groupedBy: MODEL_SUMTEST_GROUPBY,
        as: {
          'bba': {
            title: 'Sum Table',
            type: 'Table',
            of: 'value',
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

