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
      name: 'Test1',
      value: 123
    }, {
      name: 'Test2',
      value: 456
    }]);

    return firstValueFrom(toTest.dataObservable().pipe(map (result => {
      expect(result.labels).not.toBeNull();
      expect(result.datasets).toHaveLength(1);
      expect(result.datasets.data).not.toBeNull();
    })))
  });
});
