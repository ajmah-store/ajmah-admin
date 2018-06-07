import { Category } from "./category.model";

export const PRODUCT_COLLECTION = "product";

export class Product {
  id?:string;
  name: string;
  category: Category;
  price: number;

  constructor(name:string, category: Category, price: number) {
    this.name = name;
    this.category = category;
    this.price = price;
  }
}
