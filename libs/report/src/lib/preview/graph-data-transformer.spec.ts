import {GraphDataTransformer} from "./graph-data-transformer";
import {firstValueFrom, map} from "rxjs";
import {dtcde} from "@dontcode/core";

describe('GraphDataTransformer', () => {
  // let component: ReportDisplayComponent;
  // let fixture: ComponentFixture<ReportDisplayComponent>;

  beforeEach(async () => {
    /*await TestBed.configureTestingModule({
      declarations: [ReportDisplayComponent],
      imports: [PluginCommonModule.forRoot()],
    }).compileComponents();*/
  });

  beforeEach(() => {
   // fixture = TestBed.createComponent(ReportDisplayComponent);
   // component = fixture.componentInstance;
  });

  it('should translate simple data', () => {
    const toTest = new GraphDataTransformer( dtcde.getModelManager(), {
      type: 'Pie',
      of: 'value',
      title: 'Pie Chart'
    });

    toTest.updateSourceData ([{
      whatever: 'Test1',
      value: 123
    }, {
      whatever: 'Test2',
      value: 456
    }]);

    return firstValueFrom(toTest.dataObservable().pipe(map (result => {
      expect(result.labels).not.toBeNull();
      expect(result.labels).toEqual([1, 2]);
      expect(result.datasets).toHaveLength(1);
      expect(result.datasets[0].data).not.toBeNull();
      expect(result.datasets[0].data).toEqual([123,456]);
    })))
  });

  it('should translate object data', () => {
    const toTest = new GraphDataTransformer( dtcde.getModelManager(), {
      type: 'Pie',
      of: 'object',
      title: 'Pie Chart'
    });

    toTest.setLabelFieldName('name');
    toTest.setTargetType("Euro");

    toTest.updateSourceData ([{
      name: 'Test1',
      object: {
        amount: 343,
        currency: 'EUR'
      }
    }, {
      name: 'Test2',
      object: {
        amount: 436,
        currency: 'USD'

      }
    }]);

    return firstValueFrom(toTest.dataObservable().pipe(map (result => {
      expect(result.labels).not.toBeNull();
      expect(result.labels).toEqual(['Test1', 'Test2']);
      expect(result.datasets).toHaveLength(1);
      expect(result.datasets[0].data).not.toBeNull();
      expect(result.datasets[0].data).toEqual([343,436]);
    })))
  });

  it('should manage date values', () => {
    const toTest = new GraphDataTransformer( dtcde.getModelManager(), {
      type: 'Pie',
      of: 'object',
      title: 'Pie Chart'
    });

    toTest.setLabelFieldName('name');

    toTest.updateSourceData ([{
      name: 'Test1',
      object: new Date()
    }, {
      name: 'Test2',
      object: new Date()
    }]);

    return firstValueFrom(toTest.dataObservable().pipe(map (result => {
      expect(result.labels).not.toBeNull();
      expect(result.labels).toEqual(['Test1', 'Test2']);
      expect(result.datasets).toHaveLength(1);
      expect(result.datasets[0].data).toHaveLength(2);
      expect(typeof result.datasets[0].data[0]).toEqual('number');
    })))
  });

  it('should support null values', () => {
    const toTest = new GraphDataTransformer( dtcde.getModelManager(), {
      type: 'Pie',
      of: 'object',
      title: 'Pie Chart'
    });

    toTest.setLabelFieldName('name');

    toTest.updateSourceData ([{
      name: 'Test1',
      object: {
        value: null,
        label: 'Label'
      }
    }, {
      name:'Test2',
      object: {
        value: 343,
        label: 'Label2'
        }
    }]);

    return firstValueFrom(toTest.dataObservable().pipe(map (result => {
      expect(result.labels).not.toBeNull();
      expect(result.labels).toEqual(['Test1', 'Test2']);
      expect(result.datasets).toHaveLength(1);
      expect(result.datasets[0].data).toHaveLength(2);
      // Not sure its normal to have the objects in data...
      expect(result.datasets[0].data).toEqual([{value:null, label:'Label'}, {value:343, label:'Label2'}]);
    })))
  });

});
