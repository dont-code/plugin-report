import {DataTransformationInfo, DontCodeModelManager, DontCodeReportDisplayType} from "@dontcode/core";
import {Observable, ReplaySubject} from "rxjs";

/**
 * Calculates the correct data to generate a graph based on the configuration of the model
 */
export class GraphDataTransformer {

  protected config?: DontCodeReportDisplayType;

  protected labelFieldName?:string;

  protected data = new ReplaySubject(1);

  protected amount=false;

  constructor(protected modelMgr:DontCodeModelManager, graphConfig?: DontCodeReportDisplayType) {
    this.config=graphConfig;
  }

  setConfig (graphConfig?: DontCodeReportDisplayType) : void {
    this.config = graphConfig;
  }

  translatedType (): string|undefined {
    if( this.config?.type!=null) {
      return this.config.type.toLowerCase();
    }
    return;
  }

  changeType (newType:string) {
    if (this.config==null)
      throw new Error ("No config to change type to "+ newType);
    this.config.type=newType;
  }

  dataObservable (): Observable<any> {
    return this.data.asObservable();
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

    for (const elt of srcData) {
      if( this.labelFieldName!=null)
        labels.push(elt[this.labelFieldName]);
      else {
        labels.push(count);
        count++;
      }
      data.push(this.modelMgr.extractValue (elt[this.config.of], metaData));
    }
    this.data.next({
      labels,
      datasets: [
        {
          label: this.config.of,
          backgroundColor: [
            '#EC407A',
            '#AB47BC',
            '#42A5F5',
            '#7E57C2',
            '#66BB6A',
            '#FFCA28',
            '#26A69A'
          ],
          borderColor: '#42A5F5',
          data
        }
      ]
    });
  }

  setLabelFieldName(fieldName: string) {
    this.labelFieldName = fieldName;
  }

}
