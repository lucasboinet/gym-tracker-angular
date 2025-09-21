import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { MenubarModule } from 'primeng/menubar';
import { Output, EventEmitter } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { RouterLink } from '@angular/router';

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
