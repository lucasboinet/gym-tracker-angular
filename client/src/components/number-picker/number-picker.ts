import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  input,
  OnInit,
  Output,
  signal,
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

  numbers: number[] = [];
  visibleNumbers: { value: number; index: number }[] = [];
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

  visibleItemCount = 15;
  bufferSize = 5;
  startIndex = 0;
  endIndex = 0;
  totalHeight = 0;
  topPadding = signal(0);
  bottomPadding = signal(0);

  ngOnInit() {
    this.numbers = Array.from({ length: this.max() - this.min() + 1 }, (_, i) => this.min() + i);
    this.selectedValue = this.initialValue();
    this.totalHeight = this.numbers.length * this.itemHeight;
    this.updateVisibleItems(0);
  }

  ngAfterViewInit() {
    const index = this.numbers.indexOf(this.initialValue());
    if (index !== -1 && this.scrollContainerRef) {
      const targetScroll = index * this.itemHeight;

      this.updateVisibleItems(targetScroll);

      this.scrollContainerRef.nativeElement.scrollTop = targetScroll;

      setTimeout(() => {
        this.updateVisibleItems(targetScroll);
        this.scrollContainerRef.nativeElement.scrollTop = targetScroll;
      }, 0);
    }
  }

  updateVisibleItems(scrollTop: number) {
    const centerIndex = Math.round(scrollTop / this.itemHeight);

    this.startIndex = Math.max(
      0,
      centerIndex - Math.floor(this.visibleItemCount / 2) - this.bufferSize,
    );
    this.endIndex = Math.min(
      this.numbers.length,
      centerIndex + Math.ceil(this.visibleItemCount / 2) + this.bufferSize,
    );

    this.visibleNumbers = [];
    for (let i = this.startIndex; i < this.endIndex; i++) {
      this.visibleNumbers.push({
        value: this.numbers[i],
        index: i,
      });
    }

    this.topPadding.set(this.startIndex * this.itemHeight);
    this.bottomPadding.set((this.numbers.length - this.endIndex) * this.itemHeight);
  }

  onScroll() {
    this.isScrolling = true;

    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }

    const container = this.scrollContainerRef.nativeElement;
    const scrollTop = container.scrollTop;

    // Update visible items based on scroll position
    this.updateVisibleItems(scrollTop);

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
    let velocity = this.velocityY * 15;
    const deceleration = 0.95;

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
      const targetScroll = index * this.itemHeight;

      this.updateVisibleItems(targetScroll);

      container.scrollTo({
        top: targetScroll,
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  }

  getItemPosition(index: number): number {
    return index * this.itemHeight;
  }
}
