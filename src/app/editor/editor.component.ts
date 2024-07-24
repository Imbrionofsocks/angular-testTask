import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Item } from '../models/item.model';
import { ItemService } from '../services/item.service';
import { ItemDialog } from './item-dialog.component';
import { SelectItemDialog } from './select-item-dialog.component';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent {
  newItem: Item = {
    name: '',
    creationDate: new Date(),
    dueDate: new Date(),
    description: ''
  };

  constructor(public dialog: MatDialog, private itemService: ItemService) {}

  openDialog(): void {
    const dialogRef = this.dialog.open(ItemDialog, {
      width: '250px',
      data: { item: { ...this.newItem }, isReadOnly: false }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.newItem = result;
        this.addItem();
      }
    });
  }

  addItem(): void {
    this.newItem.creationDate = new Date();
    this.itemService.addItem(this.newItem);
    this.newItem = { name: '', creationDate: new Date(), dueDate: new Date(), description: '' };
  }

  openCopyDialog(): void {
    const dialogRef = this.dialog.open(SelectItemDialog, {
      width: '300px',
      data: { items: this.itemService.getItems(), action: 'copy' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.copyItem(result);
      }
    });
  }

  openDeleteDialog(): void {
    const dialogRef = this.dialog.open(SelectItemDialog, {
      width: '300px',
      data: { items: this.itemService.getItems(), action: 'delete' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteItem(result);
      }
    });
  }

  copyItem(item: Item): void {
    const items = this.itemService.getItems();
    const nameCount = items.filter(i => i.name.startsWith(item.name)).length;
    const newItem = { ...item, creationDate: new Date(), dueDate: new Date() };
    this.itemService.addItem(newItem);
  }

  deleteItem(item: Item): void {
    this.itemService.deleteItem(item);
  }
}
