import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'number-picker',
  imports: [CommonModule],
  templateUrl: './number-picker.html',
  styleUrls: ['./number-picker.css'],
})
export class NumberPicker implements OnInit, AfterViewInit {
  min = input<number>(1);
  max = input<number>(400);
  initialValue = input<number>(2);
  suffix = input<string>('');

  @ViewChild('scrollContainer') scrollContainerRef!: ElementRef<HTMLElement>;
  @Output() valueChange = new EventEmitter<number>();

  private cd = inject(ChangeDetectorRef);

  numbers: number[] = [];
  selectedValue = 2;
  paddingHeight = 112;
  itemHeight = 40;
  isScrolling = false;
  isDragging = false;
  startY = 0;
  startScrollTop = 0;
  lastY = 0;
  lastTime = 0;
  velocityY = 0;
  animationFrame: any;
  scrollTimeout: NodeJS.Timeout | undefined = undefined;

  ngOnInit() {
    this.numbers = Array.from({ length: this.max() - this.min() + 1 }, (_, i) => this.min() + i);
    this.selectedValue = this.initialValue();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.scrollToValue(this.initialValue(), false);
    }, 100);
  }

  onScroll() {
    this.isScrolling = true;

    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }

    const container = this.scrollContainerRef.nativeElement;
    const scrollTop = container.scrollTop;
    const index = Math.round(scrollTop / this.itemHeight);
    const newValue = this.numbers[index];

    if (newValue !== undefined && newValue !== this.selectedValue) {
      this.selectedValue = newValue;
      this.valueChange.emit(newValue);
    }

    this.scrollTimeout = setTimeout(() => {
      this.onScrollEnd();
    }, 150);
  }

  onScrollEnd() {
    if (!this.isScrolling) return;

    this.isScrolling = false;
    const container = this.scrollContainerRef.nativeElement;
    const scrollTop = container.scrollTop;
    const index = Math.round(scrollTop / this.itemHeight);

    // Snap to nearest item
    const targetScroll = index * this.itemHeight;
    container.scrollTo({
      top: targetScroll,
      behavior: 'smooth',
    });
  }

  onNumberClick(value: number) {
    if (this.isDragging) return;
    this.selectedValue = value;
    this.valueChange.emit(value);
    this.scrollToValue(value, true);
  }

  onMouseDown(event: MouseEvent) {
    this.isDragging = false;
    this.startY = event.clientY;
    this.lastY = event.clientY;
    this.lastTime = Date.now();
    this.velocityY = 0;
    this.startScrollTop = this.scrollContainerRef.nativeElement.scrollTop;

    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }

    event.preventDefault();
  }

  onMouseMove(event: MouseEvent) {
    if (this.startY === 0) return;

    this.isDragging = true;
    const currentY = event.clientY;
    const currentTime = Date.now();
    const deltaY = this.startY - currentY;
    const timeDelta = currentTime - this.lastTime;

    if (timeDelta > 0) {
      this.velocityY = (this.lastY - currentY) / timeDelta;
    }

    this.lastY = currentY;
    this.lastTime = currentTime;

    this.scrollContainerRef.nativeElement.scrollTop = this.startScrollTop + deltaY;
  }

  onMouseUp() {
    if (this.startY !== 0) {
      this.startY = 0;

      // Apply momentum if velocity is significant
      if (Math.abs(this.velocityY) > 0.3) {
        this.applyMomentum();
      } else {
        this.onScrollEnd();
      }

      setTimeout(() => {
        this.isDragging = false;
      }, 100);
    }
  }

  applyMomentum() {
    const container = this.scrollContainerRef.nativeElement;
    let velocity = this.velocityY * 15; // Amplify the velocity
    const deceleration = 0.95; // Friction factor

    const animate = () => {
      if (Math.abs(velocity) < 0.5) {
        this.onScrollEnd();
        return;
      }

      velocity *= deceleration;
      container.scrollTop += velocity;

      this.animationFrame = requestAnimationFrame(animate);
    };

    animate();
  }

  onTouchStart(event: TouchEvent) {
    this.isDragging = false;
    this.startY = event.touches[0].clientY;
    this.lastY = event.touches[0].clientY;
    this.lastTime = Date.now();
    this.velocityY = 0;
    this.startScrollTop = this.scrollContainerRef.nativeElement.scrollTop;

    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  onTouchMove(event: TouchEvent) {
    if (this.startY === 0) return;

    this.isDragging = true;
    const currentY = event.touches[0].clientY;
    const currentTime = Date.now();
    const deltaY = this.startY - currentY;
    const timeDelta = currentTime - this.lastTime;

    if (timeDelta > 0) {
      this.velocityY = (this.lastY - currentY) / timeDelta;
    }

    this.lastY = currentY;
    this.lastTime = currentTime;

    this.scrollContainerRef.nativeElement.scrollTop = this.startScrollTop + deltaY;
    event.preventDefault();
  }

  onTouchEnd() {
    if (this.startY !== 0) {
      this.startY = 0;

      // Apply momentum if velocity is significant
      if (Math.abs(this.velocityY) > 0.3) {
        this.applyMomentum();
      } else {
        this.onScrollEnd();
      }

      setTimeout(() => {
        this.isDragging = false;
      }, 100);
    }
  }

  scrollToValue(value: number, smooth = true) {
    const index = this.numbers.indexOf(value);
    if (index !== -1) {
      const container = this.scrollContainerRef.nativeElement;
      container.scrollTo({
        top: index * this.itemHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  }
}
