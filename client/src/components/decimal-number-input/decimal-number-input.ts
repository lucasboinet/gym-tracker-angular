import {
  Component,
  computed,
  ElementRef,
  HostListener,
  input,
  model,
  signal,
  ViewChild,
} from '@angular/core';
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
  displayInput = signal(false);

  @ViewChild('inputsNumber') inputNumberRef!: ElementRef<HTMLElement>;

  modelParts = computed(() =>
    this.model()
      .toString()
      .split('.')
      .map((n) => parseInt(n)),
  );

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
    this.displayInput.set(true);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.inputNumberRef && !this.inputNumberRef.nativeElement.contains(event.target as Node)) {
      this.handleOutsideClick();
    }
  }

  handleOutsideClick() {
    this.displayInput.set(false);
  }
}
