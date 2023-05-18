import { UserService } from "./../services/userService";
import { autoinject } from "aurelia-framework";
@autoinject
export class LocalSettingsService {
  public isDark: boolean = true;
  constructor(public userService: UserService) {}
  public init() {
    this.setTheme(localStorage.getItem("isDark") == "true");
  }
  public toggleNightMode() {
    this.setTheme(!this.isDark);
  }
  private setTheme(isDark: boolean) {
    this.isDark = isDark;
    document.documentElement.setAttribute(
      "data-theme",
      isDark ? "dark" : "light"
    );
    localStorage.setItem("isDark", isDark.toString());
  }
}
