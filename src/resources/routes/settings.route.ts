import { StatsService } from "resources/services/statsService";
import { LocalSettingsService } from "./../services/localSettingsService";
import { autoinject, bindable } from "aurelia-framework";
import { Router } from "aurelia-router";
@autoinject
export class SettingsRoute {
  @bindable isDark = this.localSettingsService.isDark;
  theme: string;
  constructor(
    public router: Router,
    public localSettingsService: LocalSettingsService,
    public statsService: StatsService
  ) {}

  isDarkChanged() {
    this.localSettingsService.toggleNightMode();
  }
  export() {
    this.statsService.exportBackup();
  }
}
