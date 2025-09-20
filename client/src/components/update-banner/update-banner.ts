import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SwUpdateService } from '../../services/worker.service';

@Component({
  selector: 'app-update-banner',
  imports: [CommonModule],
  templateUrl: './update-banner.html'
})
export class UpdateBannerComponent {
  updateService = inject(SwUpdateService);

  reload() {
    this.updateService.activateUpdate();
  }

  dismiss() {
    this.updateService.dismissUpdate();
  }
}