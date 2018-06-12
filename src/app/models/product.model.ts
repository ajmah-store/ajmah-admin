import { Category } from "./category.model";

export const PRODUCT_COLLECTION = "products";

export class Product {
  id:any;
  featuredImageUrl:string;
  name: string;
  category: string | Category;
  price: number;
  description: string;
}
