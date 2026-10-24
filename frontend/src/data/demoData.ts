import type {Hotspot,PhenologyPoint} from '../types/hotspot'; import type {AuditRecord} from '../types/api';
export const DEMO_NOTICE='DEMO MODE Ã¢â‚¬â€ SYNTHETIC DATA';
const now=Date.now(); const ago=(h:number)=>new Date(now-h*3600000).toISOString();
export const demoHotspots:Hotspot[]=[
{id:'DEMO-OD-KJ-01',name:'Keonjhar',state:'Odisha',lat:21.6289,lng:85.5817,severity:'critical',status:'reviewing',category:'Forest disturbance review',detectedAt:ago(2),description:'Possible mining-related forest disturbance.',notes:'Illustrative scenario only; requires independent review.',confidence:undefined,ndviChange:-0.18,sarVhChange:-1.7,evidence:['Synthetic change indicator'],demo:true},
{id:'DEMO-MP-SG-02',name:'Singrauli',state:'Madhya Pradesh',lat:24.1997,lng:82.6753,severity:'high',status:'new',category:'Linear expansion review',detectedAt:ago(6),description:'Possible haul-road expansion.',notes:'Static approximate location, not a detected illegal activity.',ndviChange:-0.12,evidence:['Synthetic optical indicator'],demo:true},
{id:'DEMO-AS-DH-03',name:'Dima Hasao',state:'Assam',lat:25.3478,lng:93.0176,severity:'high',status:'reviewing',category:'Canopy disturbance review',detectedAt:ago(9),description:'Possible logging-related disturbance under cloudy conditions.',notes:'Cloud conditions are part of the demonstration scenario.',sarVhChange:-2.1,evidence:['Synthetic SAR indicator'],demo:true},
{id:'DEMO-KA-SH-04',name:'Shimoga',state:'Karnataka',lat:13.9299,lng:75.5681,severity:'medium',status:'new',category:'Boundary change review',detectedAt:ago(14),description:'Possible agricultural encroachment.',notes:'Demonstration scenario; not verified.',ndviChange:-0.08,evidence:[],demo:true},
{id:'DEMO-CG-BA-05',name:'Bastar',state:'Chhattisgarh',lat:19.1071,lng:81.9535,severity:'medium',status:'reviewing',category:'Surface disturbance review',detectedAt:ago(21),description:'Possible excavation-related disturbance.',notes:'Approximate regional coordinate only.',sarVhChange:-1.1,evidence:['Synthetic review flag'],demo:true},
{id:'DEMO-MP-KB-06',name:'Kanha buffer',state:'Madhya Pradesh',lat:22.3345,lng:80.6115,severity:'low',status:'new',category:'Phenology review',detectedAt:ago(28),description:'Potential phenology anomaly requiring review.',notes:'Illustrative vegetation trend only.',ndviChange:-0.05,evidence:['Synthetic time-series flag'],demo:true}];
export const demoPhenology=(_id:string):PhenologyPoint[]=>Array.from({length:24},(_,i)=>({date:new Date(now-(23-i)*86400000).toISOString().slice(0,10),ndvi:Number((.65+Math.sin(i/4)*.035-(i>16?.08:0)).toFixed(3)),anomaly:i>16,demo:true}));
export const demoAudit:AuditRecord[]=[{id:'AUD-DEMO-1',timestamp:ago(1),action:'HOTSPOT_REVIEW_OPENED',actor:'demo.operator',entityId:'DEMO-OD-KJ-01',hash:'demo:82bd5f8a9c7e',previousHash:'demo:31fa7c2d0061',demo:true},{id:'AUD-DEMO-2',timestamp:ago(4),action:'DATASET_REFRESH_ATTEMPTED',entityId:'SYSTEM',hash:'demo:31fa7c2d0061',demo:true}];





