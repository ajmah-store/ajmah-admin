export const PRODUCT_COLLECTION = "products";

export class Product {
  id?:any;
  featuredImageUrl?:string;
  name: string;
  category: string;
  price: number;
  unit: string;
  description: string;
  featured?: boolean;
  discount?: number;
  createdAt?: Date;
  salesCount?: number;
}
