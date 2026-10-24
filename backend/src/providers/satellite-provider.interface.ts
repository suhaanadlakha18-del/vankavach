export interface ProviderStatus {configured:boolean;available:boolean;lastSuccessfulFetch:string|null;message:string}
export interface SatelliteProvider {readonly name:string;status():Promise<ProviderStatus>;getObservations(locationId:string):Promise<unknown[]>;getPhenology(locationId:string):Promise<unknown[]>;}
