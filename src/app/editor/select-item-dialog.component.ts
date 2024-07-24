import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Item } from '../models/item.model';

@Component({
  selector: 'select-item-dialog',
  templateUrl: './select-item-dialog.component.html',
})
export class SelectItemDialog {
  items: Item[];
  action: string;

  constructor(
    public dialogRef: MatDialogRef<SelectItemDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { items: Item[], action: string }
  ) {
    this.items = data.items;
    this.action = data.action;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSelect(item: Item): void {
    this.dialogRef.close(item);
  }
}
