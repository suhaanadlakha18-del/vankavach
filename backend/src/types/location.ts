export const severities = ['minimal_seasonal','low','moderate','high','critical','insufficient_data'] as const;
export const dataQualities = ['excellent','good','limited','radar_assisted','insufficient'] as const;
export type Severity = typeof severities[number];
export type DataQuality = typeof dataQualities[number];
export interface LocationRecord {
  id:string; name:string; state:string; latitude:number; longitude:number; severity:Severity;
  disturbance_category:string; disturbance_description:string; estimated_affected_area_ha:number|null;
  ndvi_change:number|null; sentinel1_vv_change_db:number|null; sentinel1_vh_change_db:number|null;
  optical_available:number; radar_available:number; cloud_percentage:number|null; persistence:string;
  data_quality:DataQuality; seasonal_filter_result:string; severity_explanation:string;
  observation_start:string|null; observation_end:string|null; is_demo:number; created_at:string; updated_at:string;
}
