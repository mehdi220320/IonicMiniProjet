import { inject, Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  getDocs,
  query,
  where
} from '@angular/fire/firestore';

interface CategoryStat {
  id: string;
  name: string;
  icon: string;
  percentage: number;
  count: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private firestore = inject(Firestore);

  private ordersCollection = collection(this.firestore, 'orders');
  private productsCollection = collection(this.firestore, 'products');
  private usersCollection = collection(this.firestore, 'users');
  private categoriesCollection = collection(this.firestore, 'categories');

  async getTotalRevenue(): Promise<number> {
    const snapshot = await getDocs(this.ordersCollection);
    let total = 0;
    snapshot.forEach((doc) => {
      const data = doc.data() as any;
      total += data.total || 0;
    });
    return total;
  }

  async getTotalOrders(): Promise<number> {
    const snapshot = await getDocs(this.ordersCollection);
    return snapshot.size;
  }

  async getTotalProducts(): Promise<number> {
    const snapshot = await getDocs(this.productsCollection);
    return snapshot.size;
  }

  async getTotalUsers(): Promise<number> {
    const snapshot = await getDocs(this.usersCollection);
    return snapshot.size;
  }

  async getCategoryStats(): Promise<CategoryStat[]> {
    // Get all categories
    const categorySnap = await getDocs(this.categoriesCollection);
    const productSnap = await getDocs(this.productsCollection);
    const totalProducts = productSnap.size || 1;

    const categoryStats: CategoryStat[] = [];

    categorySnap.forEach((catDoc) => {
      const catData = catDoc.data() as any;
      const catId = catDoc.id;

      let count = 0;
      productSnap.forEach((prodDoc) => {
        const prodData = prodDoc.data() as any;
        if (prodData.category && prodData.category.id === catId) {
          count++;
        }
      });

      const percentage = (count / totalProducts) * 100;

      categoryStats.push({
        id: catId,
        name: catData.name,
        icon: catData.icon || 'pricetag-outline',
        percentage,
        count
      });
    });

    return categoryStats.sort((a, b) => b.percentage - a.percentage);
  }
}
