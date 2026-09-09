import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  templateUrl: './menu.html',
  selector: 'menu-bar',
  imports: [RouterLink, RouterLinkActive],
})
export class MenuBar {}
