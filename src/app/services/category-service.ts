import {inject, Injectable} from '@angular/core';
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
import {Category} from "../models/Category";
@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private firestore = inject(Firestore);
  private categoriesCollection = collection(this.firestore, 'categories');

  getAllCategories(): Observable<Category[]> {
    return collectionData(this.categoriesCollection, { idField: 'id' }) as Observable<Category[]>;
  }


  getCategoryById(id: string): Observable<Category | undefined> {
    const categoryDoc = doc(this.firestore, `categories/${id}`);
    return docData(categoryDoc, { idField: 'id' }) as Observable<Category | undefined>;
  }

  addCategory(category: Category): Observable<void> {
    const addPromise = addDoc(this.categoriesCollection, {
      ...category,
      createdAt: new Date()
    }).then(() => {});
    return from(addPromise);
  }


  updateCategory(id: string, category: Partial<Category>): Observable<void> {
    const categoryDoc = doc(this.firestore, `categories/${id}`);
    const updatePromise = updateDoc(categoryDoc, { ...category });
    return from(updatePromise);
  }


  deleteCategory(id: string): Observable<void> {
    const categoryDoc = doc(this.firestore, `categories/${id}`);
    const deletePromise = deleteDoc(categoryDoc);
    return from(deletePromise);
  }
}
