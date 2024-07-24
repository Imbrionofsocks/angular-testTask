import { Injectable } from '@angular/core';
import { Item } from '../models/item.model';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  private readonly storageKey = 'items';

  constructor(private notificationService: NotificationService) {
    this.loadItems();
    this.checkDueDates();
  }

  getItems(): Item[] {
    const items = localStorage.getItem(this.storageKey);
    return items ? JSON.parse(items) : [];
  }

  addItem(item: Item): void {
    const items = this.getItems();
    items.push(item);
    this.saveItems(items);
  }

  deleteItem(item: Item): void {
    let items = this.getItems();
    items = items.filter(i => i !== item);
    this.saveItems(items);
  }

  updateItem(updatedItem: Item): void {
    const items = this.getItems().map(item => item === updatedItem ? updatedItem : item);
    this.saveItems(items);
  }

  private saveItems(items: Item[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(items));
  }

  private loadItems(): void {
    if (!localStorage.getItem(this.storageKey)) {
      localStorage.setItem(this.storageKey, JSON.stringify([]));
    }
  }

  private checkDueDates(): void {
    const items = this.getItems();
    const now = new Date();
    items.forEach(item => {
      const dueDate = new Date(item.dueDate);
      if (dueDate <= now) {
        this.notificationService.showNotification(item.name);
      }
    });

    // Проверять каждую минуту
    setTimeout(() => this.checkDueDates(), 60000);
  }
}
