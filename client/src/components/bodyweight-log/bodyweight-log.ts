import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { UiButton } from '../ui/button';
import { UiNumber } from '../ui/number-stepper';
import { ToastService } from '../../services/toast.service';
import { BodyweightService } from '../../services/bodyweight.service';
import { SettingsService } from '../../services/settings.service';
import { durationFromDate } from '../../shared/dates';
import { BodyweightEntry } from '../../shared/types/Bodyweight';
import { SETTINGS, SETTINGS_DEFAULT_VALUES } from '../../shared/types/Setting';
import { fromKg, round1, toKg } from '../../shared/units';

@Component({
  selector: 'bodyweight-log',
  templateUrl: './bodyweight-log.html',
  imports: [UiButton, UiNumber],
})
export class BodyweightLog implements OnInit {
  private bodyweightService = inject(BodyweightService);
  private settingsService = inject(SettingsService);
  private toast = inject(ToastService);

  entries = this.bodyweightService.entries;
  newValue = signal<number | null>(null);
  saving = signal<boolean>(false);

  unit = computed<string>(
    () =>
      this.settingsService.settings().find((s) => s.slug === SETTINGS.WEIGHT_UNIT)?.value ||
      SETTINGS_DEFAULT_VALUES[SETTINGS.WEIGHT_UNIT],
  );

  /** Entries in display unit, newest first. */
  displayEntries = computed(() =>
    [...this.entries()]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map((e) => ({
        ...e,
        display: round1(fromKg(e.value, this.unit())),
        ago: durationFromDate(new Date(e.date)),
      })),
  );

  latest = computed(() => this.displayEntries()[0]);

  change = computed(() => {
    const list = this.displayEntries();
    if (list.length < 2) return null;
    return round1(list[0].display - list[list.length - 1].display);
  });

  ngOnInit() {
    this.bodyweightService.getEntries().subscribe({
      next: (data) => this.bodyweightService.entries.set(data),
      error: (err) => console.error('Failed to load bodyweight entries', err),
    });
  }

  logWeight() {
    const value = this.newValue();
    if (!value || value <= 0) {
      this.toast.add({
        severity: 'warn',
        summary: 'Invalid weight',
        detail: 'Enter a weight greater than 0.',
        life: 3000,
      });
      return;
    }

    this.saving.set(true);
    const valueKg = toKg(value, this.unit());

    this.bodyweightService.addEntry({ value: valueKg }).subscribe({
      next: (entry) => {
        this.bodyweightService.entries.set([...this.entries(), entry]);
        this.syncCurrentWeightSetting(value);
        this.newValue.set(null);
        this.saving.set(false);
        this.toast.add({
          severity: 'success',
          summary: 'Weight logged',
          detail: `${round1(value)} ${this.unit()} recorded.`,
          life: 3000,
        });
      },
      error: () => {
        this.saving.set(false);
        this.toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to log your weight.',
          life: 3000,
        });
      },
    });
  }

  removeEntry(entry: BodyweightEntry) {
    if (!entry._id) return;
    this.bodyweightService.deleteEntry(entry._id).subscribe({
      next: () => {
        this.bodyweightService.entries.set(this.entries().filter((e) => e._id !== entry._id));
      },
    });
  }

  /** Keep the current-weight setting in sync so BMI/calories use the latest value. */
  private syncCurrentWeightSetting(value: number) {
    const current = this.settingsService.settings();
    const existing = current.find((s) => s.slug === SETTINGS.WEIGHT);
    const next = existing
      ? current.map((s) => (s.slug === SETTINGS.WEIGHT ? { ...s, value } : s))
      : [...current, { slug: SETTINGS.WEIGHT, value }];
    this.settingsService.settings.set(next);
    this.settingsService
      .saveSetting({ _id: existing?._id, slug: SETTINGS.WEIGHT, value })
      .subscribe({ error: (err) => console.error('Failed to sync weight setting', err) });
  }
}
