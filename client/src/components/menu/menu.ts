import { Component } from "@angular/core";
import { ButtonModule } from "primeng/button";
import { MenubarModule } from "primeng/menubar";
import { Output, EventEmitter } from "@angular/core";

@Component({
  templateUrl: './menu.html',
  selector: 'menu-bar',
  imports: [MenubarModule, ButtonModule]
})
export class MenuBar {
  @Output() historyOpen = new EventEmitter<void>();

  onHistoryOpen() {
    this.historyOpen.emit();
  }
}