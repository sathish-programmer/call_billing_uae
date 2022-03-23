export interface Organization {
  _id: string;
  name: string;
  parent?:string;
  parentName?:string;
  child?: any;
  creationDate?:any;
}