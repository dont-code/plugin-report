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
import {delay, from, map, Observable, of, Subject, take, takeUntil, timer} from "rxjs";
import {compileClassMetadata} from "@angular/compiler";

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
      name: 'Test1',
      value: 123
    }, {
      name: 'Test2',
      value: 456
    }]);

    const provider = new TestProviderInterface(dtcde.getModelManager().findAtPosition('creation/reports/ba'));
    const entityPointer = provider.calculatePointerFor('creation/reports/ba');
    component.initCommandFlow(provider, entityPointer);

    fixture.detectChanges();

    DontCodeTestManager.waitUntilTrue(() => {
      return (component.fields.length == 1) && (component.title=='Test');
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
