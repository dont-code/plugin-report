import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportEntityComponent } from './report-entity.component';
import { PluginCommonModule } from '@dontcode/plugin-common';
import {
  Change,
  CommandProviderInterface,
  DontCodeModelPointer,
  DontCodeSchemaManager,
  DontCodeTestManager,
  dtcde
} from "@dontcode/core";
import {Observable} from "rxjs";
import * as Assert from "assert";

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

  it ('should handle subfields', () => {
    dtcde.getModelManager().resetContent({
      creation: {
        entities: {
          'aa': {
            name:'Entity1',
            fields: {
              'aaa': {
                name: 'name',
                type:'string'
              },
              'aab': {
                name: 'value',
                type:'number'
              }
            }
          }
        },
        reports:{
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

    const provider = new TestProviderInterface(dtcde.getModelManager().findAtPosition('creation/reports/ba'));
    const entityPointer = provider.calculatePointerFor('creation/reports/ba');
    component.initCommandFlow(provider, entityPointer);

    expect(component.fields).toHaveLength(1);
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
