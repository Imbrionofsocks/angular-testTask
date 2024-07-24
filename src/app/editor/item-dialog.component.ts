import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Item} from '../models/item.model';
import {ItemService} from '../services/item.service';

@Component({
  selector: 'item-dialog',
  templateUrl: './item-dialog.component.html',
})
export class ItemDialog implements OnInit {
  itemForm: FormGroup;
  isReadOnly: boolean;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ItemDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { item: Item, isReadOnly: boolean },
    private itemService: ItemService
  ) {
    this.isReadOnly = data.isReadOnly;

    // Создаем форму с пустыми значениями по умолчанию
    this.itemForm = this.fb.group({
      name: [{value: '', disabled: this.isReadOnly}, [Validators.required, this.uniqueNameValidator.bind(this)]],
      dueDate: [{value: '', disabled: this.isReadOnly}, [Validators.required]],
      dueTime: [{value: '', disabled: this.isReadOnly}, [Validators.required, this.validTimeValidator]],
      description: [{value: '', disabled: this.isReadOnly}]
    });
  }

  ngOnInit(): void {
    if (this.data.item) {
      const itemDate = this.data.item.dueDate;

      const isDateObject = itemDate instanceof Date || !isNaN(Date.parse(itemDate));

      if (this.isReadOnly && isDateObject) {
        const dateObject = new Date(itemDate);
        const formattedDate = dateObject.toISOString().split('T')[0];
        const formattedTime = this.formatTime(dateObject);

        this.itemForm.patchValue({
          name: this.data.item.name || '',
          dueDate: formattedDate || '',
          dueTime: formattedTime || '',
          description: this.data.item.description || ''
        });
      }
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }

    const formValues = this.itemForm.value;
    const dueDate = new Date(formValues.dueDate);
    const dueTime = formValues.dueTime;

    if (this.isDateAndTimeValid(dueDate, dueTime)) {
      this.data.item.name = formValues.name;
      this.data.item.dueDate = this.combineDateAndTime(dueDate, dueTime);
      this.data.item.description = formValues.description;
      this.dialogRef.close(this.data.item);
    } else {
      alert('Дата или время некорректны');
    }
  }

  private isDateAndTimeValid(date: Date, time: string): boolean {
    const currentDate = new Date();
    const inputDate = new Date(date);
    const [hours, minutes] = time.split(':').map(Number);

    if (inputDate < currentDate) {
      return false;
    }

    if (inputDate.toDateString() === currentDate.toDateString()) {
      const inputTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      const currentTime = this.formatTime(currentDate);

      if (inputTime <= currentTime) {
        return false;
      }
    }

    return true;
  }

  private formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  private combineDateAndTime(date: Date, time: string): Date {
    const [hours, minutes] = time.split(':').map(Number);
    const combinedDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      isNaN(hours) ? 0 : hours,
      isNaN(minutes) ? 0 : minutes
    );
    return combinedDate;
  }

  private uniqueNameValidator(control: any) {
    if (this.isReadOnly) {
      return null;
    }

    const items = this.itemService.getItems();
    if (items.some(item => item.name === control.value && item !== this.data.item)) {
      return {uniqueName: true};
    }
    return null;
  }

  private validTimeValidator(control: any) {
    const [hours, minutes] = control.value.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return {validTime: true};
    }
    return null;
  }
}
