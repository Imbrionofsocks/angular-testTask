import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Item } from '../models/item.model';
import { ItemService } from '../services/item.service';

@Component({
  selector: 'item-dialog',
  templateUrl: './item-dialog.component.html',
})
export class ItemDialog implements OnInit {
  itemForm: FormGroup;
  isReadOnly: boolean;
  dueTime: string;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ItemDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { item: Item, isReadOnly: boolean },
    private itemService: ItemService
  ) {
    this.isReadOnly = data.isReadOnly;
    this.data.item.dueDate = new Date(this.data.item.dueDate); // Преобразование строки в объект Date
    this.dueTime = this.formatTime(this.data.item.dueDate);

    this.itemForm = this.fb.group({
      name: [{ value: this.data.item.name, disabled: this.isReadOnly }, [Validators.required, this.uniqueNameValidator.bind(this)]],
      dueDate: [{ value: this.data.item.dueDate, disabled: this.isReadOnly }, [Validators.required, this.futureDateValidator]],
      dueTime: [{ value: this.dueTime, disabled: this.isReadOnly }, [Validators.required, this.validTimeValidator]],
      description: [{ value: this.data.item.description, disabled: this.isReadOnly }]
    });
  }

  ngOnInit(): void {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.itemForm.valid) {
      const formValues = this.itemForm.value;
      this.data.item.name = formValues.name;
      this.data.item.dueDate = this.combineDateAndTime(formValues.dueDate, formValues.dueTime);
      this.data.item.description = formValues.description;
      this.dialogRef.close(this.data.item);
    }
  }

  private formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  private combineDateAndTime(date: Date, time: string): Date {
    const [hours, minutes] = time.split(':').map(Number);
    const newDate = new Date(date);
    newDate.setHours(hours, minutes);
    return newDate;
  }

  private uniqueNameValidator(control: any) {
    const items = this.itemService.getItems();
    if (items.some(item => item.name === control.value && item !== this.data.item)) {
      return { uniqueName: true };
    }
    return null;
  }

  private futureDateValidator(control: any) {
    const currentDate = new Date();
    if (new Date(control.value) < currentDate) {
      return { futureDate: true };
    }
    return null;
  }

  private validTimeValidator(control: any) {
    const [hours, minutes] = control.value.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return { validTime: true };
    }
    return null;
  }
}
