import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ReportTableComponent} from './report-table.component';
import {EntityListManager, PluginCommonModule} from "@dontcode/plugin-common";
import {DontCodeTestManager, dtcde, TestProviderInterface} from "@dontcode/core";
import {By} from "@angular/platform-browser";
import {Component, NgModule, TemplateRef} from "@angular/core";
import {CommonModule} from "@angular/common";
import {TableModule} from "primeng/table";

describe('ReportTableComponent', () => {
  let component: ReportTableComponent;
  let fixture: ComponentFixture<ReportTableComponent>;
  let containerFixture: ComponentFixture<TestInsertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReportTableComponent, TestInsertComponent],
      imports: [PluginCommonModule.forRoot(), CommonModule, TableModule]
    }).compileComponents();

/*    fixture = TestBed.createComponent(TestInsertComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const componentRef = fixture.componentInstance.dynamicInsertPoint.createComponent<ReportTableComponent>(
      ReportTableComponent, {
        injector:fixture.debugElement.injector,
        ngModuleRef: createNgModule(TestBed.ngModule as Type<any>)
      }
    );
    component = componentRef.instance;*/
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

  it('should display a grouped table', (done) => {
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

    DontCodeTestManager.waitUntilTrueAndEmit(() => {
      console.log("Here");
      return component.cols.length==2;
    }, 20, 5).then (value => {
      if( !value) done("No column values are updated");

      containerFixture.detectChanges();
      containerFixture.whenStable().then(() => {
        component.setValue(new TestEntityListManager ('creation/entities/aa',[{
          name: 'Test1',
          value: 123
        }, {
          name: 'Test2',
          value: 456
        }]));

        containerFixture.detectChanges();
        containerFixture.whenStable().then(() => {
          expect(component.cleanedTableData).toHaveLength(2);
          expect(component.cols).toHaveLength(2);
          const tableRows = containerFixture.debugElement.queryAll(By.css('tr'));
          expect(tableRows).toHaveLength(3);


          expect(tableRows[1].children[0].nativeElement.textContent.trim()).toEqual('Test1');
          done();

        }).catch(error => done(error));
      });
    }).catch(error => done(error));
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

