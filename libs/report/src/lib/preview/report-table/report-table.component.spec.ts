import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ReportTableComponent} from './report-table.component';
import {EntityListManager, PluginCommonModule} from "@dontcode/plugin-common";
import {DontCodeTestManager, dtcde, TestProviderInterface} from "@dontcode/core";

describe('ReportTableComponent', () => {
  let component: ReportTableComponent;
  let fixture: ComponentFixture<ReportTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReportTableComponent],
      imports: [PluginCommonModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ReportTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
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

    DontCodeTestManager.addDummyProviderFromContent("creation/entities/aa", [{
      name: 'Test1',
      value: 123
    }, {
      name: 'Test2',
      value: 456
    }]);

    const provider = new TestProviderInterface(dtcde.getModelManager().findAtPosition('creation/reports/ba/as/baa'));
    const entityPointer = provider.calculatePointerFor('creation/reports/ba/as/baa');
    component.initCommandFlow(provider, entityPointer);

    DontCodeTestManager.waitUntilTrueAndEmit(() => {
      console.log("Here");
      return component.cols.length==2;
    }, 20, 5).then (value => {
      if( !value) done("No column values are updated");

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        component.setValue(new TestEntityListManager ('creation/entities/aa',[{
          name: 'Test1',
          value: 123
        }, {
          name: 'Test2',
          value: 456
        }]));

        fixture.detectChanges();
      });
    }).catch(error => done(error))
      .finally(() => done());
  });

});

class TestEntityListManager extends EntityListManager {
  constructor(position:string, values:any[]) {
    super(position, {}, dtcde.getStoreManager());
    this.entities=values as never[];
  }

}
