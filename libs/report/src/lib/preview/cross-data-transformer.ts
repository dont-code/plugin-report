import {DontCodeDataTransformer} from "@dontcode/core/src/lib/store/dont-code-data-transformer";
import {
  DataTransformationInfo,
  DontCodeEntityType,
  DontCodeModel,
  DontCodeModelManager,
  DontCodeModelPointer,
  DontCodeReportGroupShowType,
  DontCodeReportGroupType
} from "@dontcode/core";

/**
 * Transform columns values into rows depending on the graph configuration
 */
export class CrossDataTransformer<T=never> implements DontCodeDataTransformer<T>{
  constructor(protected modelMgr: DontCodeModelManager, protected groupByColumn:string, protected affectedColumns:string[], protected groupType: DontCodeReportGroupType, protected entityPosition:DontCodeModelPointer) {
  }
  postLoadingTransformation(source: any[]): T[] {
    const ret = new Array<T>();
    const fieldMapping = this.calculateFieldMapping();
    // Adds the groupBy Column to each element so that standard groupBy works
    for (const srcItem of source) {
      const newItem = structuredClone(srcItem);
       // Let's calculate the relevant column
      newItem["groupByColumn"]=this.calculateRelevantColumn(srcItem, fieldMapping);
      ret.push(newItem);
    }
    return ret;
  }

  private calculateRelevantColumn(srcItem: any, fieldMapping:Map<string, string>):string|undefined {
    let value=undefined;
    let column=undefined;
    const metadataPerField=new Map<string, DataTransformationInfo>();


      const fieldsPosition=this.entityPosition.subItemPointer(DontCodeModel.APP_FIELDS_NODE);
      for (const field of this.affectedColumns) {
        let metadata = metadataPerField.get(field);
        if (metadata==null) {
          metadata=new DataTransformationInfo();
          metadataPerField.set(field, metadata);
        }
        const valSrc=this.modelMgr.extractValue(srcItem[field], metadata)
        if (value == null) {
          value = valSrc;
          column=field;
        }
        else {
          const fieldId=fieldMapping.get(field);
          if (fieldId==null) return undefined;
          const extractValue = this.modelMgr.extractValue(value, metadata, fieldsPosition.subItemPointer(fieldId));
          if (this.groupType.show==DontCodeReportGroupShowType.OnlyLowest) {
            if (value < extractValue) {
              value = valSrc;
              column=field;
            }
          }else { // Keep only Highest values
            if (value > extractValue) {
              value = valSrc;
              column=field;
            }
          }
        }

      }
      return column;
    }

  private calculateFieldMapping(): Map<string, string> {
    const entityDesc = this.modelMgr.findAtPosition(this.entityPosition.position, false) as DontCodeEntityType;
    const ret = new Map<string, string>();
    if (entityDesc.fields!=null) {
      for (const field of Object.entries(entityDesc.fields)) {
        if (field[1].name!=null) {
          ret.set(field[0], field[1].name);
        }
      }
    }
    return ret;
  }
}
