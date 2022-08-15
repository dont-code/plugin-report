import {DontCodeModelManager, DontCodeReportDisplayType} from "@dontcode/core";
import {Observable, ReplaySubject, Subject} from "rxjs";

/**
 * Calculates the correct data to generate a graph based on the configuration of the model
 */
export class GraphDataTransformer {

  protected config?: DontCodeReportDisplayType;

  protected labelFieldName?:string;

  protected data = new ReplaySubject(1);

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
    for (const elt of srcData) {
      if( this.labelFieldName!=null)
        labels.push(elt[this.labelFieldName]);
      else {
        labels.push(count);
        count++;
      }
      data.push(elt[this.config.of]);
    }
    this.data.next({
      labels,
      datasets: [
        {
          label: this.config.of,
          data
        }
      ]
    });
  }

  setLabelFieldName(fieldName: string) {
    this.labelFieldName = fieldName;
  }
}
