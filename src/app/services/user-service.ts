import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  collectionData,
  docData,
  updateDoc,
  deleteDoc,
  setDoc,
  getFirestore
} from '@angular/fire/firestore';
import { from, Observable, of } from 'rxjs';
import { User, UserRole } from '../models/User';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private firestore = inject(Firestore);

  constructor() {}

  /**
   * 🔹 Get all users as a live Observable
   */
  getAllUsers(): Observable<User[]> {
    const usersRef = collection(this.firestore, 'users');
    return collectionData(usersRef, { idField: 'id' }) as Observable<User[]>;
  }

  /**
   * 🔹 Get a single user by ID (live Observable)
   */
  getUserById(userId: string): Observable<User | null> {
    if (!userId) return of(null);
    const userRef = doc(this.firestore, `users/${userId}`);
    return docData(userRef, { idField: 'id' }) as Observable<User | null>;
  }

  /**
   * 🔹 Create a new user (Observable wrapper)
   */
  createUser(user: User): Observable<void> {
    const userRef = doc(this.firestore, `users/${user.id}`);
    return from(setDoc(userRef, user));
  }

  /**
   * 🔹 Update an existing user (Observable wrapper)
   */
  updateUser(userId: string, updatedData: Partial<User>): Observable<void> {
    const userRef = doc(this.firestore, `users/${userId}`);
    return from(updateDoc(userRef, { ...updatedData }));
  }

  /**
   * 🔹 Update only the user's role
   */
  updateUserRole(userId: string, newRole: UserRole): Observable<void> {
    const userRef = doc(this.firestore, `users/${userId}`);
    return from(updateDoc(userRef, { role: newRole }));
  }

  /**
   * 🔹 Delete a user
   */
  deleteUser(userId: string): Observable<void> {
    const userRef = doc(this.firestore, `users/${userId}`);
    return from(deleteDoc(userRef));
  }
}
