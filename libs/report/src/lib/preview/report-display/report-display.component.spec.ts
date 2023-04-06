import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportDisplayComponent } from './report-display.component';
import { PluginCommonModule } from '@dontcode/plugin-common';
import {
  Change,
  CommandProviderInterface,
  DontCodeModelPointer,
  DontCodeSchemaManager,
  DontCodeTestManager,
  dtcde
} from "@dontcode/core";
import {firstValueFrom, map, Observable} from "rxjs";

describe('ReportFieldComponent', () => {
  let component: ReportDisplayComponent;
  let fixture: ComponentFixture<ReportDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReportDisplayComponent],
      imports: [PluginCommonModule.forRoot()],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportDisplayComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should generate a pie chart', () => {
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

    const provider = new TestProviderInterface(dtcde.getModelManager().findAtPosition('creation/reports/ba/as/baa'));
    const entityPointer = provider.calculatePointerFor('creation/reports/ba/as/baa');
    component.initCommandFlow(provider, entityPointer);

    fixture.detectChanges();
    fixture.whenStable().then(() => {
      component.setValue([{
        name: 'Test1',
        value: 123
      }, {
        name: 'Test2',
        value: 456
      }]);

      fixture.detectChanges();
    });

    return firstValueFrom(component.data$.pipe(map(data => {
      expect (data.labels).not.toBeNull();
      expect (component.entityNamePropertyName).toEqual ("name");
      return data;
    })));


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
