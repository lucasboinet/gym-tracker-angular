import { Component, ElementRef, HostListener, input, model, ViewChild } from '@angular/core';
import { NumberPicker } from '../number-picker/number-picker';

@Component({
  templateUrl: './decimal-number-input.html',
  selector: 'decimal-number-input',
  imports: [NumberPicker],
})
export class DecimalNumberInput {
  model = model(0);
  decimal = input(true);
  min = input.required<number>();
  max = input.required<number>();
  displayInput = false;

  @ViewChild('inputsNumber') inputNumberRef!: ElementRef<HTMLElement>;

  onNumberPickerChange(data: number, side: 'main' | 'decimal') {
    const numberToString = this.model().toString();
    const parts = numberToString.split('.');

    if (parts.length === 1) {
      this.model.set(side === 'decimal' ? parseFloat(`${parts[0]}.${data}`) : data);
      return;
    }

    if (side === 'main') {
      this.model.set(parseFloat(`${data}.${parts[1]}`));
      return;
    }

    if (side === 'decimal') {
      this.model.set(parseFloat(`${parts[0]}.${data}`));
    }
  }

  handleOnClick() {
    this.displayInput = true;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.inputNumberRef && !this.inputNumberRef.nativeElement.contains(event.target as Node)) {
      this.handleOutsideClick();
    }
  }

  handleOutsideClick() {
    console.log('Clicked outside the component!');
    this.displayInput = false;
  }
}
