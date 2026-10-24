import type { Severity } from '../types/location.js';
export const severityPresentation: Record<Severity,{label:string;color:string}> = {
  minimal_seasonal:{label:'Minimal / Seasonal',color:'#10b981'}, low:{label:'Low',color:'#84cc16'},
  moderate:{label:'Moderate',color:'#f59e0b'}, high:{label:'High',color:'#f97316'},
  critical:{label:'Critical',color:'#ef4444'}, insufficient_data:{label:'Insufficient data',color:'#64748b'}
};
