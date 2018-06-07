export const CATEGORY_COLLECTION = "category";

export class Category {
  id?: string;
  name: string;

  constructor(name:string, id?:string) {
    this.name = name;
    this.id = id;
  }
}
