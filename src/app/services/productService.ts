import {inject, Injectable} from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  setDoc
} from '@angular/fire/firestore';
import {from, Observable} from "rxjs";
import {Product} from "../models/Product";
@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private firestore= inject(Firestore)
  private productsCollection = collection(this.firestore, 'products');

  constructor() {}

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
  async rateProduct(productId: string, userId: string, newRating: number): Promise<void> {
    const productDoc = doc(this.firestore, `products/${productId}`);
    const userRatingDoc = doc(this.firestore, `products/${productId}/ratings/${userId}`);

    const userRatingSnap = await getDoc(userRatingDoc);
    const productSnap = await getDoc(productDoc);

    let currentRating = 0;
    let ratingsCount = 0;

    if (productSnap.exists()) {
      const data = productSnap.data();
      currentRating = data['rating'] || 0;
      ratingsCount = data['ratingsCount'] || 0;
    }

    if (userRatingSnap.exists()) {
      console.warn('User already rated this product');
      return;
    } else {
      const total = currentRating * ratingsCount + newRating;
      const newCount = ratingsCount + 1;
      const newAverage = total / newCount;

      await setDoc(userRatingDoc, { value: newRating });
      await updateDoc(productDoc, {
        rating: newAverage,
        ratingsCount: newCount
      });
    }
  }
}
