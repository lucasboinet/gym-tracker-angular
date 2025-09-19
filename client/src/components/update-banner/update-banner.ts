// update-banner.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { SwUpdateService } from '../../services/worker.service';

@Component({
  selector: 'app-update-banner',
  imports: [CommonModule],
  templateUrl: './update-banner.html',
  styleUrls: ['./update-banner.css']
})
export class UpdateBannerComponent implements OnInit, OnDestroy {
  isVisible = false;
  private subscription = new Subscription();

  constructor(private swUpdateService: SwUpdateService) {}

  ngOnInit() {
    this.subscription.add(
      this.swUpdateService.updateBannerVisible.subscribe(visible => {
        this.isVisible = visible;
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  updateApp() {
    this.swUpdateService.activateUpdate();
  }

  dismissUpdate() {
    this.swUpdateService.dismissUpdate();
  }
}