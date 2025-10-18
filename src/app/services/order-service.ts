import {inject, Injectable} from '@angular/core';
import {addDoc, collection, collectionData, Firestore, serverTimestamp,  query, where} from "@angular/fire/firestore";
import {Product} from "../models/Product";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private firestore = inject(Firestore);
  private ordersCollection = collection(this.firestore, 'orders');

  async createOrder(userId: string, cartItems: Product[], total: number) {
    const order = {
      userId,
      items: cartItems,
      total,
      createdAt: serverTimestamp(),
    };
    return await addDoc(this.ordersCollection, order);
  }
  getOrders(userId: string, isAdmin: boolean): Observable<any[]> {

  console.log(isAdmin)
    if (isAdmin) {
      return collectionData(this.ordersCollection, { idField: 'id' }) as Observable<any[]>;
    } else {
      const q = query(this.ordersCollection, where('userId', '==', userId));
      return collectionData(q, { idField: 'id' }) as Observable<any[]>;
    }
  }


}
