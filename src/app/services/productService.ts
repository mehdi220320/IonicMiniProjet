import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  addDoc,
  updateDoc,
  deleteDoc
} from '@angular/fire/firestore';
import {from, Observable} from "rxjs";
import {Product} from "../models/Product";
@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsCollection = collection(this.firestore, 'products');

  constructor(private firestore: Firestore) {}

  getAllProducts(): Observable<Product[]> {
    return collectionData(this.productsCollection, { idField: 'id' }) as Observable<Product[]>;
  }


  getProductById(id: string): Observable<Product | undefined> {
    const productDoc = doc(this.firestore, `products/${id}`);
    return docData(productDoc, { idField: 'id' }) as Observable<Product | undefined>;
  }


  addProduct(product: Product): Observable<void> {
    const addPromise = addDoc(this.productsCollection, {
      ...product,
      createdAt: new Date()
    }).then(() => {});
    return from(addPromise);
  }

  updateProduct(id: string, product: Partial<Product>): Observable<void> {
    const productDoc = doc(this.firestore, `products/${id}`);
    const updatePromise = updateDoc(productDoc, { ...product });
    return from(updatePromise);
  }


  deleteProduct(id: string): Observable<void> {
    const productDoc = doc(this.firestore, `products/${id}`);
    const deletePromise = deleteDoc(productDoc);
    return from(deletePromise);
  }
}
