import {
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SettingsInputNumber } from '../../components/settings-input-number/settings-input-number';
import { SettingsService } from '../../services/settings.service';
import {
  Setting,
  SETTINGS,
  SETTINGS_DEFAULT_VALUES,
  SETTINGS_INPUT_LABELS,
} from '../../shared/types/Setting';

interface BMIData {
  value: number;
  category: string;
}

@Component({
  selector: 'settings-page',
  imports: [FormsModule, SettingsInputNumber],
  templateUrl: './settings.html',
})
export class SettingsPage implements OnInit {
  settingService = inject(SettingsService);

  SETTINGS_SLUG = SETTINGS;
  SETTINGS_INPUT_LABELS = SETTINGS_INPUT_LABELS;

  @ViewChild('bmiScale') bmiScaleRef!: ElementRef<HTMLElement>;

  private resizeTimer: NodeJS.Timeout | undefined;
  scaleIndicatorPosition = 0;

  ngOnInit(): void {
    this.settingService
      .getSettings()
      .subscribe({ next: (data) => this.settingService.settings.set(data) });
  }

  getSetting(slug: SETTINGS): Setting {
    return (
      this.settingService.settings().find((s) => s.slug === slug) || {
        slug,
        value: SETTINGS_DEFAULT_VALUES[slug],
      }
    );
  }

  getSettingValue(slug: SETTINGS): any {
    return (
      this.settingService.settings().find((s) => s.slug === slug)?.value ||
      SETTINGS_DEFAULT_VALUES[slug]
    );
  }

  @HostListener('window:resize', [])
  OnPageResize() {
    if (this.resizeTimer) {
      clearTimeout(this.resizeTimer);
    }

    setTimeout(() => {
      this.updateIndicatorPosition();
    }, 200);
  }

  updateIndicatorPosition(): void {
    const weight = this.getSettingValue(SETTINGS.WEIGHT);
    const height = this.getSettingValue(SETTINGS.HEIGHT);
    const weightUnit = this.getSettingValue(SETTINGS.WEIGHT_UNIT);
    const heightUnit = this.getSettingValue(SETTINGS.HEIGHT_UNIT);

    if (!weight || !height) {
      this.scaleIndicatorPosition = 0;
      return;
    }

    let weightKg = weight;
    let heightM = height;

    if (weightUnit === 'lbs') weightKg = weight * 0.453592;
    if (heightUnit === 'cm') heightM = height / 100;
    else if (heightUnit === 'ft') heightM = height * 0.3048;

    const bmi = weightKg / (heightM * heightM);

    const minBMI = 15;
    const maxBMI = 35;
    const clampedBMI = Math.max(minBMI, Math.min(maxBMI, bmi));
    const ratio = (clampedBMI - minBMI) / (maxBMI - minBMI);

    const scaleWidth = this.bmiScaleRef?.nativeElement?.offsetWidth;
    this.scaleIndicatorPosition = ratio * scaleWidth;
  }

  bmiData = computed<BMIData | null>(() => {
    const weight = this.getSettingValue(SETTINGS.WEIGHT);
    const height = this.getSettingValue(SETTINGS.HEIGHT);
    const weightUnit = this.getSettingValue(SETTINGS.WEIGHT_UNIT);
    const heightUnit = this.getSettingValue(SETTINGS.HEIGHT_UNIT);

    if (!weight || !height) return null;

    let weightKg = weight;
    let heightM = height;

    if (weightUnit === 'lbs') weightKg = weight * 0.453592;
    if (heightUnit === 'cm') heightM = height / 100;
    else if (heightUnit === 'ft') heightM = height * 0.3048;

    const bmi = weightKg / (heightM * heightM);

    let category = '';

    if (bmi < 18.5) category = 'Underweight';
    else if (bmi < 25) category = 'Healthy';
    else if (bmi < 30) category = 'Overweight';
    else category = 'Obese';

    this.updateIndicatorPosition();

    return {
      value: parseFloat(bmi.toFixed(1)),
      category,
    };
  });
}
