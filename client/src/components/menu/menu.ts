import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MenubarModule } from 'primeng/menubar';

@Component({
  templateUrl: './menu.html',
  selector: 'menu-bar',
  imports: [MenubarModule, ButtonModule, RouterLink],
})
export class MenuBar {}
