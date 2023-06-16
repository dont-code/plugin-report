import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ReportTableComponent} from './report-table.component';
import {ComponentLoaderService, EntityListManager, PluginCommonModule} from "@dontcode/plugin-common";
import {DontCodeTestManager, dtcde, TestProviderInterface} from "@dontcode/core";
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
    dtcde.getModelManager().resetContent({
      creation: {
        entities: {
          'aa': {
            name: 'Entity1',
            fields: {
              'aaa': {
                name: 'name',
                type: 'Text'
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
                type: 'Table',
                of: 'value'
              }
            }
          }
        }
      }
    });

    /*    DontCodeTestManager.addDummyProviderFromContent("creation/entities/aa", [{
          name: 'Test1',
          value: 123
        }, {
          name: 'Test2',
          value: 456
        }]);*/

    const provider = new TestProviderInterface(dtcde.getModelManager().findAtPosition('creation/reports/ba/as/baa'));
    const entityPointer = provider.calculatePointerFor('creation/reports/ba/as/baa');
    component.initCommandFlow(provider, entityPointer);

    await DontCodeTestManager.waitUntilTrueAndEmit(() => {
      console.log("Here");
      return component.cols.length == 4;
    }, 20, 5).then(async value => {
      if (!value) throw new Error ("No column values are updated");
      else {

        containerFixture.detectChanges();
        await containerFixture.whenStable();
        component.setValue(new TestEntityListManager('creation/entities/aa', [{
          name: 'Test1',
          value: 123,
          amount: {amount: 250, currencyCode: 'EUR'},
          date: new Date(2023, 5, 12)
        }, {
          name: 'Test2',
          value: 456,
          amount: {amount: 125, currencyCode: 'EUR'},
          date: new Date(2023, 5, 14)
        }]));

        containerFixture.detectChanges();
        await containerFixture.whenStable();
        expect(component.cleanedTableData).toHaveLength(2);
        expect(component.cols).toHaveLength(4);
        const tableRows = containerFixture.debugElement.queryAll(By.css('tr'));
        expect(tableRows).toHaveLength(3);


        expect(tableRows[1].children[0].nativeElement.textContent.trim()).toEqual('Test1');
        expect(tableRows[1].children[1].nativeElement.textContent.trim()).toEqual('123');
        expect(tableRows[1].children[2].nativeElement.textContent.trim()).toEqual('€250.00');
        expect(tableRows[1].children[3].nativeElement.textContent.trim()).toEqual('06/12/2023');
      }

    });
  });

});

class TestEntityListManager extends EntityListManager {
  constructor(position:string, values:any[]) {
    super(position, {}, dtcde.getStoreManager());
    this.entities=values as never[];
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

