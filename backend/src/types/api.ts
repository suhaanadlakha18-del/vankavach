export interface ApiError { error: { code:string; message:string; details?:unknown } }
export interface CollectionResponse<T> { data:T[]; meta:{ total:number; limit:number; offset:number; dataMode:string } }
export interface ResourceResponse<T> { data:T }
