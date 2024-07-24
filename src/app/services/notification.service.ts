import {Injectable} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {TranslateService} from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private snackBar: MatSnackBar, private translate: TranslateService) {
  }

  showNotification(itemName: string): void {
    this.translate.get('NOTIFICATION_DUE', {name: itemName}).subscribe((res: string) => {
      this.snackBar.open(res, this.translate.instant('CLOSE'), {
        duration: 3000,
      });
    });
  }
}
