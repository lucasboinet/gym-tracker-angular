import { Component, Input } from "@angular/core";
import { Output, EventEmitter } from "@angular/core";
import { DialogModule } from "primeng/dialog";

@Component({
  templateUrl: './create-session-dialog.html',
  selector: 'create-session-dialog',
  imports: [DialogModule],
})
export class CreateSessionDialog {
  @Input() open = false;
  @Output() openChange = new EventEmitter<boolean>();
  
  onOpenChange(value: boolean) {
    this.openChange.emit(value);
  }
}