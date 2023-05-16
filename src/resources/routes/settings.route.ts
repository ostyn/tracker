import { UserService } from "./../services/userService";
import { FirestoreCounter } from "resources/dao/FirestoreCounter";
import { autoinject, bindable } from "aurelia-framework";
import { Router } from "aurelia-router";
import gravatarUrl from "gravatar-url";
@autoinject
export class SettingsRoute {
  FirestoreCounter = FirestoreCounter;
  @bindable isDark = false;
  theme: string;
  gravatarUrl(email, params) {
    return gravatarUrl(email, params);
  }
  constructor(public router: Router, public userService: UserService) {
    let theme = localStorage.getItem("theme");
    this.setTheme(theme);
  }
  isDarkChanged() {
    this.toggleNightMode();
  }

  toggleNightMode() {
    let newTheme = localStorage.getItem("theme") === "light" ? "dark" : "light";
    this.setTheme(newTheme);
  }
  logout() {
    this.userService.logout();
  }
  private setTheme(theme: string) {
    this.theme = theme;
    this.isDark = theme === "dark";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }
}
