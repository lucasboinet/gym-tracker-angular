import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  signal,
  SimpleChanges,
} from '@angular/core';
import { formatDateToISO, isToday } from '../../shared/dates';
import { Workout } from '../../shared/types/Workout';

@Component({
  selector: 'workouts-calendar',
  imports: [CommonModule],
  templateUrl: './workouts-calendar.html',
  styleUrls: ['./workouts-calendar.css'],
})
export class WorkoutsCalendarComponent implements OnInit, OnChanges {
  @Input() events: Workout[] = [];
  @Output() daySelected = new EventEmitter<Workout[]>();

  currentDate = signal<Date>(new Date());
  weeks: (Date | null)[][] = [];
  weekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  canGoNextMonth = computed(() => this.currentDate().getMonth() < new Date().getMonth());

  ngOnInit(): void {
    this.generateCalendar();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['events']) {
      this.generateCalendar();
    }
  }

  generateCalendar(): void {
    const year = this.currentDate().getFullYear();
    const month = this.currentDate().getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek < 0) startDayOfWeek = 6;

    const daysInMonth = lastDay.getDate();
    const dates: (Date | null)[] = [];

    for (let i = 0; i < startDayOfWeek; i++) {
      dates.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      dates.push(new Date(year, month, day));
    }

    this.weeks = [];
    for (let i = 0; i < dates.length; i += 7) {
      this.weeks.push(dates.slice(i, i + 7));
    }
  }

  prevMonth(): void {
    this.currentDate.set(
      new Date(this.currentDate().getFullYear(), this.currentDate().getMonth() - 1, 1),
    );
    this.generateCalendar();
  }

  nextMonth(): void {
    this.currentDate.set(
      new Date(this.currentDate().getFullYear(), this.currentDate().getMonth() + 1, 1),
    );
    this.generateCalendar();
  }

  goToToday(): void {
    this.currentDate.set(new Date());
    this.generateCalendar();
  }

  get currentMonthYear(): string {
    return this.currentDate().toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  }

  getEventsForDate(date: Date | null): Workout[] {
    if (!date) return [];

    const dateStr = formatDateToISO(date);

    return this.events.filter((event) => formatDateToISO(new Date(event.createdAt)) === dateStr);
  }

  onDayClick(date: Date | null): void {
    if (!date) return;

    const events = this.getEventsForDate(date);

    if (events.length === 0) return;

    this.daySelected.emit(events);
  }

  isDateToday(date: Date | null) {
    return isToday(date);
  }
}
