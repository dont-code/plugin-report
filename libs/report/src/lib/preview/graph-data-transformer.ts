import {DataTransformationInfo, DontCodeModelManager, DontCodeReportDisplayType} from "@dontcode/core";
import {Observable, ReplaySubject} from "rxjs";
import {ChartData, ChartOptions, TooltipItem} from "chart.js";

/**
 * Calculates the correct data to generate a graph based on the configuration of the model
 */
export class GraphDataTransformer {

  protected config?: DontCodeReportDisplayType;

  protected labelFieldName?:string;

  protected data = new ReplaySubject(1);
  protected option = new ReplaySubject(1);

  protected targetType:string|null=null;

  constructor(protected modelMgr:DontCodeModelManager, graphConfig?: DontCodeReportDisplayType) {
    this.config=graphConfig;
  }

  setConfig (graphConfig?: DontCodeReportDisplayType) : void {
    this.config = graphConfig;
  }

  setTargetType (newType:string|null): void {
    this.targetType=newType;
  }

  translatedGraphType (): string|undefined {
    if( this.config?.type!=null) {
      return this.config.type.toLowerCase();
    }
    return;
  }

  changeGraphType (newType:string) {
    if (this.config==null)
      throw new Error ("No config to change type to "+ newType);
    this.config.type=newType;
  }

  dataObservable (): Observable<any> {
    return this.data.asObservable();
  }

  optionObservable():Observable<any> {
    return this.option.asObservable();
  }

  updateSourceData (srcData:any): void {
    if (this.config?.of==null) {
      throw new Error ("Cannot process source data without graph configuration");
    }
    if( !Array.isArray(srcData)) {
      srcData = [srcData];
    }

    const data = [];
    const labels = [];
    let count=1;

    const metaData=new DataTransformationInfo();

    const isAmount = this.targetType=='Dollar'||this.targetType=='Euro'||this.targetType=='Other currency';

    for (const elt of srcData) {

      let label;
      if( this.labelFieldName!=null)
        label=elt[this.labelFieldName];
      else {
        label = count;
        count++;
      }
      if (isAmount) {
        // For money we store the amount AND the Currency
        data.push({x:label, y:elt[this.config.of]?.amount, src:elt[this.config.of]});
      } else {
        labels.push(label);
        data.push(this.modelMgr.extractValue (elt[this.config.of], metaData));
      }
    }

    const chartData:ChartData<any> = {
      datasets: [
        {
          label: this.config.of,
          data
        }
      ]
    };

    const chartOption:ChartOptions<any> = {
    }

    if( !isAmount) {
      chartData.labels=labels;
    }else {
      chartOption.plugins={
          tooltip: {
            callbacks: {
              label: function (context: TooltipItem<any>):string {
                if ((context.raw as any).src.currencyCode!=null) {
                  return Intl.NumberFormat (undefined, {style:'currency', currency:(context.raw as any).src.currencyCode }).format(context.parsed.y);
                } else
                return context.parsed.y;
              }
            }
          }
      }
    }

    if( this.config.type=='Bar') {
      const barChartConfig = chartData as ChartData<'bar'>;

      for (const dataSet of barChartConfig.datasets) {
        dataSet.backgroundColor=ChartsColors.fillColors;
      }
    } else if (this.config.type=='Line') {
      const lineChartConfig = chartData as ChartData<'line'>;

      let position=0;
      for (const dataSet of lineChartConfig.datasets) {
        dataSet.borderColor=ChartsColors.fillColors[position];
        position++;
      }
    }
    this.data.next(chartData);
    this.option.next(chartOption);
  }

  setLabelFieldName(fieldName: string) {
    this.labelFieldName = fieldName;
  }

}

class ChartsColors {
  public static fillColors=[
    '#42A5F5',
    '#7E57C2',
    '#66BB6A',
    '#FFCA28',
    '#26A69A',
    '#EC407A',
    '#AB47BC'
  ]
}
