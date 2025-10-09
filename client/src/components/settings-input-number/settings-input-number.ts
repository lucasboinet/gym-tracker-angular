import { Component, inject, input, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../../services/settings.service';
import { Setting, SETTINGS } from '../../shared/types/Setting';

@Component({
  selector: 'settings-input-number',
  imports: [FormsModule],
  templateUrl: './settings-input-number.html',
})
export class SettingsInputNumber {
  model = model.required<Setting>();

  label = input.required<string>();
  unit = input.required<Setting>();
  units = input.required<string[]>();

  updateTimer: NodeJS.Timeout | undefined = undefined;
  saved = signal<boolean>(false);
  loading = signal<boolean>(false);

  private settingService = inject(SettingsService);

  handleModelChange(value: any) {
    this.updateSetting(this.model().slug, value);
  }

  handleUnitChange(value: string) {
    this.updateSetting(this.unit().slug, value);
  }

  updateSetting(slug: SETTINGS, value: any) {
    this.loading.set(true);
    if (this.updateTimer) {
      clearTimeout(this.updateTimer);
    }

    const current = this.settingService.settings();
    const settingExist = current.find((s) => s.slug === slug);

    if (settingExist) {
      const updated = current.map((s) => (s.slug === slug ? { ...s, value } : s));
      this.settingService.settings.set(updated);
      this.updateTimer = setTimeout(() => this.saveSetting({ ...settingExist, value }), 500);
      return;
    }

    this.settingService.settings.set([...current, { slug, value }]);
    this.updateTimer = setTimeout(() => this.saveSetting({ slug, value }), 500);
  }

  saveSetting(setting: Setting) {
    this.settingService.saveSetting(setting).subscribe({
      next: () => {
        this.loading.set(false);
        this.saved.set(true);
        setTimeout(() => {
          this.saved.set(false);
        }, 500);
      },
    });
  }
}
