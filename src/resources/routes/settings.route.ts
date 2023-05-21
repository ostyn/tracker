import { StatsService } from "resources/services/statsService";
import { LocalSettingsService } from "./../services/localSettingsService";
import { UserService } from "./../services/userService";
import { FirestoreCounter } from "resources/dao/FirestoreCounter";
import { autoinject, bindable } from "aurelia-framework";
import { Router } from "aurelia-router";
import gravatarUrl from "gravatar-url";
@autoinject
export class SettingsRoute {
  FirestoreCounter = FirestoreCounter;
  @bindable isDark = this.localSettingsService.isDark;
  theme: string;
  gravatarUrl(email, params) {
    return gravatarUrl(email, params);
  }
  constructor(
    public router: Router,
    public userService: UserService,
    public localSettingsService: LocalSettingsService,
    public statsService: StatsService
  ) {}

  isDarkChanged() {
    this.localSettingsService.toggleNightMode();
  }
  export() {
    this.statsService.exportBackup();
  }

  logout() {
    if (confirm("Are you sure you want to logout?")) this.userService.logout();
  }
}
