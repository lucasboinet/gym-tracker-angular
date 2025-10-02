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
  @ViewChild('inputElement') inputRef!: ElementRef<HTMLElement>;

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

    requestAnimationFrame(() => {
      this.scrollInputToCenter();
    });
  }

  scrollInputToCenter() {
    if (!this.inputRef?.nativeElement || !this.inputNumberRef?.nativeElement) {
      return;
    }

    const inputElement = this.inputRef.nativeElement;
    const pickerElement = this.inputNumberRef.nativeElement;
    const pickerHeight = pickerElement.offsetHeight;

    const inputRect = inputElement.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    const visibleAreaHeight = viewportHeight - pickerHeight;
    const targetPosition = visibleAreaHeight / 2;

    const scrollAmount = inputRect.top - targetPosition;

    const currentScroll = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const neededScroll = currentScroll + scrollAmount;

    if (neededScroll > maxScroll) {
      const additionalSpace = 5 * 40;
      document.body.style.paddingBottom = `${additionalSpace}px`;
    }

    window.scrollBy({
      top: scrollAmount,
      behavior: 'smooth',
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as Node;

    if (
      this.inputNumberRef?.nativeElement.contains(target) ||
      this.inputRef?.nativeElement.contains(target)
    ) {
      return;
    }

    this.handleOutsideClick();
  }

  handleOutsideClick() {
    document.body.style.paddingBottom = '0px';
    this.displayInput.set(false);
  }
}
