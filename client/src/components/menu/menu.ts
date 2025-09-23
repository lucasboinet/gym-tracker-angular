import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { MenubarModule } from 'primeng/menubar';

@Component({
  templateUrl: './menu.html',
  selector: 'menu-bar',
  imports: [MenubarModule, ButtonModule, RouterLink],
})
export class MenuBar implements OnInit {
  @Output() historyOpen = new EventEmitter<void>();

  items: MenuItem[] = [];

  ngOnInit(): void {
    this.items = [{ label: 'Sessions', routerLink: '/sessions', icon: 'pi pi-file' }];
  }

  onHistoryOpen() {
    this.historyOpen.emit();
  }
}
