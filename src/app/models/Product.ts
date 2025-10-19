import {Category} from "./Category";

export interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  imageUri: string;
  category: Category;
  createdAt: Date;
  ratingsCount?: number;
  rating?: number;
  stock?:number;

}
