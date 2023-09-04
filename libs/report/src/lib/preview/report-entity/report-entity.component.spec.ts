import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ReportEntityComponent} from './report-entity.component';
import {PluginCommonModule} from '@dontcode/plugin-common';
import {
  Change,
  CommandProviderInterface,
  DontCodeModelPointer,
  DontCodeSchemaManager,
  DontCodeTestManager,
  dtcde
} from "@dontcode/core";
import {Observable} from "rxjs";

describe('ReportEntityComponent', () => {
  let component: ReportEntityComponent;
  let fixture: ComponentFixture<ReportEntityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReportEntityComponent],
      imports: [PluginCommonModule.forRoot()],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportEntityComponent);
    component = fixture.componentInstance;
  });

  it ('should handle subfields', (done) => {

    dtcde.getModelManager().resetContent({
      creation: {
        entities: {
          'aa': {
            name: 'Entity1',
            fields: {
              'aaa': {
                name: 'name',
                type: 'string'
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
                title: 'Pie Chart',
                type: 'Pie',
                of: 'value'
              }
            }
          }
        }
      }
    });

    DontCodeTestManager.addDummyProviderFromContent("creation/entities/aa", [{
      Name: 'Test1',
      Value: 123
    }, {
      Name: 'Test2',
      Value: 456
    }]);

    const provider = new TestProviderInterface(dtcde.getModelManager().findAtPosition('creation/reports/ba'));
    const entityPointer = provider.calculatePointerFor('creation/reports/ba');
    component.initCommandFlow(provider, entityPointer);

    fixture.detectChanges();

    DontCodeTestManager.waitUntilTrue(() => {
      return (component.getSubFields().length == 1) && (component.title=='Test');
    }, done);
  });


  it ('should manage grouping', (done) => {

    dtcde.getModelManager().resetContent({
      creation: {
        entities: {
          'aa': {
            name: 'SimpleEntity',
            fields: {
              'aaa': {
                name: 'Name',
                type: 'string'
              },
              'aab': {
                name: 'Value',
                type: 'number'
              }
            }
          }
        },
        reports: {
          'ba': {
            title: 'SimpleTest',
            for: 'SimpleEntity',
            groupedBy: [{
              "label": "By Name",
              "of": "Name",
              "display": [{
                "operation": "Count",
                "of": "Name",
                "label": "#"
              },
                {
                  "operation": "Sum",
                  "of": "Value",
                  "label": "Sum"
                }
                ]
              }],
            as: {
              'baa': {
                title: 'Simple Table',
                type: 'Table'
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
    },{
      name: 'Test1',
      value: 432
    }, {
      name: 'Test2',
      value: 124
    }, {
      name: 'Test2',
      value: 642
    }]);

    const provider = new TestProviderInterface(dtcde.getModelManager().findAtPosition('creation/reports/ba'));
    const entityPointer = provider.calculatePointerFor('creation/reports/ba');
    component.initCommandFlow(provider, entityPointer);

    fixture.detectChanges();

    DontCodeTestManager.waitUntilTrue(() => {
      return (component.reportEntityData?.groupedByEntities?.values?.size==2);
    }, done);
  });

  it ('should manage cross table grouping', (done) => {

    dtcde.getModelManager().resetContent({
      creation: {
        entities: {
          'aa': {
            name: 'SimpleEntity',
            fields: {
              'aaa': {
                name: 'Name',
                type: 'string'
              },
              'aab': {
                name: 'Price1',
                type: 'number'
              },
              'aac': {
                name: 'Price2',
                type: 'number'
              },
              'aad': {
                name: 'Price3',
                type: 'number'
              },

            }
          }
        },
        reports: {
          'ba': {
            title: 'CrossTest',
            for: 'SimpleEntity',
            groupedBy: [{
              "label": "By Shop",
              "of": "number",
              "show":"OnlyLowest",
              "display": [{
                "operation": "Count",
                "of": "Name",
                "label": "#"
                },
                {
                  "operation": "Sum",
                  "of": "Price1",
                  "label": "Price1 Sum"
                },
                {
                  "operation": "Sum",
                  "of": "Price2",
                  "label": "Price2 Sum"
                },
                {
                  "operation": "Sum",
                  "of": "Price3",
                  "label": "Price3 Sum"
                }]
            }],
            as: {
              'baa': {
                title: 'Simple Table',
                type: 'Table'
              }
            }
          }
        }
      }
    });

    DontCodeTestManager.addDummyProviderFromContent("creation/entities/aa", [{
      name: 'Test1',
      Price1: 123,
      Price2: 112,
      Price3: 150
    }, {
      name: 'Test2',
      Price1: 456,
      Price2: 560,
      Price3: 340
    },{
      name: 'Test3',
      Price1: 156,
      Price2: 260,
      Price3: 340
    }, {
      name: 'Test4',
      Price1: 183,
      Price2: 123,
      Price3: 90
    }, {
      name: 'Test5',
      Price1: 46,
      Price2: 50,
      Price3: 130
    }]);

    const provider = new TestProviderInterface(dtcde.getModelManager().findAtPosition('creation/reports/ba'));
    const entityPointer = provider.calculatePointerFor('creation/reports/ba');
    component.initCommandFlow(provider, entityPointer);

    fixture.detectChanges();

    DontCodeTestManager.waitUntilTrue(() => {
      return (component.reportEntityData?.groupedByEntities?.values?.size==3);
    }, done);
  });
});

class TestProviderInterface implements CommandProviderInterface {
  constructor(protected toRet: any) {}

  getJsonAt(position: string): any {
    return this.toRet;
  }

  receiveCommands(position?: string, lastItem?: string): Observable<Change> {
    return new Observable<Change>();
  }

  calculatePointerFor(position: string): DontCodeModelPointer {
    return dtcde.getSchemaManager().generateSchemaPointer(position);
  }

  getSchemaManager(): DontCodeSchemaManager {
    return dtcde.getSchemaManager();
  }
}
