import {inject, Injectable} from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, UserCredential } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { Storage } from '@ionic/storage-angular';
import { User, UserRole } from '../models/User';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _storage: Storage | null = null;
  private currentUser: User | null = null;
  private auth= inject(Auth)
  private firestore= inject(Firestore)
  private storage=inject( Storage)
  constructor(

  ) {
    this.init();
  }

  private async init() {
    const storage = await this.storage.create();
    this._storage = storage;
    const storedUser = await this._storage.get('user');
    if (storedUser) this.currentUser = storedUser;
  }

  async register(username: string, email: string, password: string): Promise<User> {
    const credential: UserCredential = await createUserWithEmailAndPassword(this.auth, email, password);

    const newUser: User = {
      id: credential.user.uid,
      username,
      email,
      role: UserRole.USER
    };

    const userRef = doc(this.firestore, `users/${newUser.id}`) as any;
    await setDoc(userRef, newUser);


    await this.saveUser(newUser);
    return newUser;
  }

  async login(email: string, password: string): Promise<User> {
    const credential: UserCredential = await signInWithEmailAndPassword(this.auth, email, password);
    const uid = credential.user.uid;

    const userRef = doc(this.firestore, `users/${uid}`);
    const snapshot = await getDoc(userRef);

    if (snapshot.exists()) {
      const userData = snapshot.data() as User;
      await this.saveUser(userData);
      return userData;
    } else {
      const fallbackUser: User = {
        id: uid,
        username: credential.user.displayName || 'Unknown',
        email: credential.user.email || '',
        role: UserRole.USER
      };
      await this.saveUser(fallbackUser);
      return fallbackUser;
    }
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
    await this._storage?.remove('user');
    this.currentUser = null;
  }

  private async saveUser(user: User): Promise<void> {
    this.currentUser = user;
    await this._storage?.set('user', user);
  }

  async getUser(): Promise<User | null> {
    if (this.currentUser) return this.currentUser;
    const stored = await this._storage?.get('user');
    if (stored) {
      this.currentUser = await stored;
      return stored;
    }
    return null;
  }

  async isLoggedIn(): Promise<boolean> {
    const user = await this.getUser();
    return !!user;
  }
  async getCurrentUser(): Promise<User | null> {
    const currentUser = this.auth.currentUser;
    if (!currentUser) return null;

    try {
      const userDocRef = doc(this.firestore, `users/${currentUser.uid}`);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        return {
          id: currentUser.uid,
          username: userData.username,
          email: userData.email,
          role: userData.role
        };
      } else {
        console.warn('User document not found in Firestore.');
        return null;
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  }

  async getCurrentUserRole(): Promise<UserRole | null> {
    const user = await this.getCurrentUser();
    return user ? user.role : null;
  }}
