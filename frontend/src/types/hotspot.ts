export type Severity='critical'|'high'|'medium'|'low'; export type Status='new'|'reviewing'|'verified'|'closed';
export interface Hotspot {id:string;name:string;state:string;lat:number;lng:number;severity:Severity;status:Status;category:string;detectedAt:string;description:string;notes:string;confidence?:number;ndviChange?:number;sarVhChange?:number;evidence:string[];demo?:boolean}
export interface PhenologyPoint {date:string;ndvi:number;anomaly?:boolean;demo?:boolean}
