import {Component} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Item} from '../models/item.model';
import {ItemService} from '../services/item.service';
import {ItemDialog} from './item-dialog.component';
import {SelectItemDialog} from './select-item-dialog.component';

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

  constructor(public dialog: MatDialog, private itemService: ItemService) {
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(ItemDialog, {
      width: '250px',
      data: {item: {...this.newItem}, isReadOnly: false}
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
    this.newItem = {name: '', creationDate: new Date(), dueDate: new Date(), description: ''};
  }

  openCopyDialog(): void {
    const dialogRef = this.dialog.open(SelectItemDialog, {
      width: '300px',
      data: {items: this.itemService.getItems(), action: 'copy'}
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
      data: {items: this.itemService.getItems(), action: 'delete'}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteItem(result);
      }
    });
  }

  copyItem(item: Item): void {
    const items = this.itemService.getItems();
    const namePattern = new RegExp(`^${item.name}_копия_(\\d+)$`);
    const maxCopyNumber = items
      .map(i => {
        const match = i.name.match(namePattern);
        return match ? parseInt(match[1], 10) : 0;
      })
      .reduce((max, num) => Math.max(max, num), 0);

    const newItemName = `${item.name}_копия_${maxCopyNumber + 1}`;
    const newItem = { ...item, id: Math.random().toString(36).substr(2, 9), name: newItemName, creationDate: new Date() };
    this.itemService.addItem(newItem);
  }

  deleteItem(item: Item): void {
    this.itemService.deleteItem(item);
  }
}
