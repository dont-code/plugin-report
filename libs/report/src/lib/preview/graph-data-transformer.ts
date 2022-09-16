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
    if (this.config==null) {
      throw new Error ("Cannot process source data without graph configuration");
    }
    if( !Array.isArray(srcData)) {
      srcData = [srcData];
    }

    const isAmount = this.targetType == 'Dollar' || this.targetType == 'Euro' || this.targetType == 'Other currency';
    let byDate = false;

    if (this.config.type!="Table") {
      const data = [];
      const labels = [];
      let count = 1;

      const metaData = new DataTransformationInfo();
      const isBiDirectional = this.config.type!='Pie';

      let globalCurrency:string|null=null;

      let xFieldName=this.labelFieldName;
      if( this.config.by!=null)
        xFieldName = this.config.by;
      for (const elt of srcData) {

          let label;
          if (xFieldName != null) {
            if (elt[xFieldName] instanceof Date) byDate=true;
            label = this.translateDateValue (elt[xFieldName]);
          }
          else {
            label = count;
            count++;
          }

          labels.push(label);
          if (!isBiDirectional) {
            if (isAmount) {
              data.push(elt[this.config.of].amount);
              globalCurrency=elt[this.config.of].currencyCode;
            }
            else data.push(this.translateDateValue(elt[this.config.of]));
          } else if (isAmount) {
            // For money we store the amount AND the Currency
            data.push({x: label, y: elt[this.config.of]?.amount, src: elt[this.config.of]});
          } else {
            data.push({x: label, y:this.translateDateValue(this.modelMgr.extractValue(elt[this.config.of], metaData))});
          }
      }

      const chartData: ChartData<any> = {
        datasets: [
          {
            label: this.config.of,
            data
          }
        ]
      };

      const chartOption: ChartOptions<any> = {}

      chartOption.plugins = {};
      chartOption.plugins.title = {
        align: "center",
        position: "top",
        display: true,
        text: this.config.title
      }

      if (!isAmount || !isBiDirectional) {
        chartData.labels = labels;
      }

      if( byDate) {
        chartOption.scales = {
            x: {
              type: 'time'
          }
        }
      }
      if( this.config.type!="Line") {
        chartOption.plugins.autocolors = {
            mode: 'data',
            offset:2
        }
      } else {
        chartOption.plugins.autocolors = {
          mode: 'dataset',
          offset:2
        }

      }

      if (isAmount)
      {
        chartOption.plugins.tooltip = {
          callbacks: {
            label: function (context: TooltipItem<any>): string {
              if ((context.raw as any)?.src?.currencyCode != null) {
                return Intl.NumberFormat(undefined, {
                  style: 'currency',
                  currency: (context.raw as any).src.currencyCode
                }).format(context.parsed.y);
              } else if (globalCurrency!=null) {
                return Intl.NumberFormat(undefined, {
                  style: 'currency',
                  currency: globalCurrency
                }).format(context.parsed);

              } else
                return context.parsed.y;
            }
          }
        }
      }

      if (this.config.type == 'Bar') {
        const barChartConfig = chartData as ChartData<'bar'>;

        /*for (const dataSet of barChartConfig.datasets) {
          dataSet.backgroundColor = ChartsColors.fillColors;
        }*/
      } else if (this.config.type == 'Pie') {
        const pieChartConfig = chartData as ChartData<'pie'>;

        for (const dataSet of pieChartConfig.datasets) {
          //dataSet.backgroundColor = ChartsColors.fillColors;
          dataSet.hoverOffset = 20;
        }

      } else if (this.config.type == 'Line') {
        const lineChartConfig = chartData as ChartData<'line'>;

        /*let position = 0;
        for (const dataSet of lineChartConfig.datasets) {
          dataSet.borderColor = ChartsColors.fillColors[position];
          position++;
        }*/
      }
      this.data.next(chartData);
      this.option.next(chartOption);
    }
  }

  setLabelFieldName(fieldName: string) {
    this.labelFieldName = fieldName;
  }

  private translateDateValue(eltElement: any) {
    if (eltElement instanceof Date) {
      return (eltElement as Date).valueOf();
    }else return eltElement;
  }
}

/* class ChartsColors {
  public static fillColors=[
    '#42A5F5',
    '#7E57C2',
    '#66BB6A',
    '#FFCA28',
    '#26A69A',
    '#EC407A',
    '#AB47BC'
  ]
}*/
