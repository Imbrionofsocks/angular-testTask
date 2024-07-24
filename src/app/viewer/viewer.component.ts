import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Item } from '../models/item.model';
import { ItemService } from '../services/item.service';
import { ItemDialog } from '../editor/item-dialog.component';

@Component({
  selector: 'app-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.css']
})
export class ViewerComponent implements OnInit {
  items: Item[] = [];
  filteredItems: Item[] = [];
  displayedColumns: string[] = ['name', 'creationDate', 'dueDate', 'actions'];
  filterName: string = '';
  filterStartDate: Date | null = null;
  filterEndDate: Date | null = null;

  constructor(public dialog: MatDialog, private itemService: ItemService) {}

  async ngOnInit(): Promise<void> {
    this.items = await this.itemService.getItems(); // Используем await для получения данных
    this.filteredItems = [...this.items]; // Клонируем массив для начальной фильтрации
  }

  async applyFilter(): Promise<void> {
    this.filteredItems = (await this.itemService.getItems()).filter(item => {
      const matchesName = !this.filterName || item.name.includes(this.filterName);
      const matchesStartDate = !this.filterStartDate || new Date(item.dueDate) >= this.filterStartDate;
      const matchesEndDate = !this.filterEndDate || new Date(item.dueDate) <= this.filterEndDate;
      return matchesName && matchesStartDate && matchesEndDate;
    });
  }

  async copyItem(item: Item): Promise<void> {
    const newItem = { ...item, creationDate: new Date() };
    await this.itemService.addItem(newItem);
    await this.applyFilter();
  }

  async deleteItem(item: Item): Promise<void> {
    await this.itemService.deleteItem(item);
    await this.applyFilter();
  }

  async moveItemUp(item: Item): Promise<void> {
    const index = this.items.indexOf(item);
    if (index > 0) {
      [this.items[index - 1], this.items[index]] = [this.items[index], this.items[index - 1]];
      await this.itemService.updateItem(this.items[index - 1]);
      await this.itemService.updateItem(this.items[index]);
      await this.applyFilter();
    }
  }

  async moveItemDown(item: Item): Promise<void> {
    const index = this.items.indexOf(item);
    if (index < this.items.length - 1) {
      [this.items[index + 1], this.items[index]] = [this.items[index], this.items[index + 1]];
      await this.itemService.updateItem(this.items[index + 1]);
      await this.itemService.updateItem(this.items[index]);
      await this.applyFilter();
    }
  }

  openViewDialog(item: Item): void {
    this.dialog.open(ItemDialog, {
      width: '250px',
      data: { item, isReadOnly: true }
    });
  }
}
