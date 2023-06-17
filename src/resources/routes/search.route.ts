import { EventAggregator, Subscription } from "aurelia-event-aggregator";
import { IEntry } from "resources/elements/entry/entry.interface";
import { autoinject, bindable } from "aurelia-framework";
import { Router } from "aurelia-router";
import { ActivityService } from "resources/services/activityService";
import { EntryDao } from "resources/dao/EntryDao";
import { activationStrategy } from "aurelia-router";
@autoinject
export class SearchRoute {
  @bindable public searchBoxValue: string;
  private searchTerm: string;
  public entryPage: IEntry[];
  public disableNext = true;
  public disablePrev = true;
  public resultsText = "";
  public showLoader = false;
  public isRequesting = false;
  public showResultsText = false;

  private entries: IEntry[] = [];
  private currentPage = 0;
  private pageSize = 20;
  private lastPageIndex = 0;
  private firstEntryIndex = 0;
  private lastEntryIndex = 0;
  private subscribers: any[] = [];
  determineActivationStrategy() {
    return activationStrategy.invokeLifecycle;
  }
  constructor(
    private entryDao: EntryDao,
    private activityService: ActivityService,
    private router: Router,
    private ea: EventAggregator
  ) {}
  attached() {
    this.subscribers.push(
      this.ea.subscribe("entriesUpdated", this.search.bind(this))
    );
  }
  detached() {
    this.subscribers.forEach((sub: Subscription) => sub.dispose());
  }
  activate(params) {
    if (!params.q) {
      this.resetState();
      return;
    }
    this.currentPage = Number.parseInt(params.p);
    if (this.searchTerm !== params.q) {
      this.searchBoxValue = params.q;
      this.searchTerm = params.q;
      this.search();
    } else {
      this.resliceEntries();
    }
  }
  private resetState() {
    this.entries = undefined;
    this.entryPage = undefined;
    this.currentPage = 0;
    this.pageSize = 20;
    this.lastPageIndex = 0;
    this.firstEntryIndex = 0;
    this.lastEntryIndex = 0;
    this.searchTerm = undefined;
    this.searchBoxValue = undefined;
    this.updateVisibility();
  }
  public searchBoxValueChanged() {
    this.currentPage = 0;
    this.router.navigateToRoute("search", {
      p: this.currentPage,
      q: this.searchBoxValue,
    });
  }
  public nextPage() {
    if (this.currentPage < this.lastPageIndex) {
      this.currentPage++;
      this.router.navigateToRoute("search", {
        p: this.currentPage,
        q: this.searchTerm,
      });
    }
  }
  public prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.router.navigateToRoute("search", {
        p: this.currentPage,
        q: this.searchTerm,
      });
    }
  }

  public search(): void {
    if (!this.searchTerm) return;
    this.isRequesting = true;
    this.updateVisibility();
    this.entryDao.getEntriesFromYearAndMonth().then((entries: IEntry[]) => {
      this.entries = entries.filter((entry) => {
        let regex = new RegExp(this.searchTerm, "i");

        return (
          regex.test(entry.note) ||
          regex.test(entry.createdBy) ||
          regex.test(entry.lastUpdatedBy) ||
          Array.from(entry.activities.values())
            .filter((activity) => Array.isArray(activity))
            .some((activityDetail) =>
              (activityDetail as string[]).some(
                (detail) => !this.isNumeric(detail) && regex.test(detail)
              )
            ) ||
          entry.activitiesArray.some((activityId) =>
            regex.test(
              this.activityService.activitiesMap?.get(activityId)?.name
            )
          ) ||
          regex.test(entry.date)
        );
      });
      this.resliceEntries();
      this.isRequesting = false;
      this.updateVisibility();
    });
  }
  private resliceEntries() {
    if (this.entries.length) {
      this.lastPageIndex = Math.ceil(this.entries.length / this.pageSize) - 1;
      this.firstEntryIndex = this.currentPage * this.pageSize;
      this.lastEntryIndex = Math.min(
        (this.currentPage + 1) * this.pageSize,
        this.entries.length
      );
      this.entryPage = this.entries.slice(
        this.firstEntryIndex,
        this.lastEntryIndex
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      this.entryPage = [];
      this.currentPage = 0;
      this.firstEntryIndex = 0;
      this.lastEntryIndex = 0;
      this.lastPageIndex = 0;
    }
    this.updateVisibility();
  }

  private updateVisibility() {
    this.disableNext = this.currentPage === this.lastPageIndex;
    this.disablePrev = this.currentPage === 0;
    this.showLoader = this.isRequesting;
    this.showResultsText = !!this.searchTerm;
    if (this.isRequesting) {
      this.resultsText = "";
    } else {
      this.resultsText = !!this.entries?.length
        ? `Results ${this.firstEntryIndex + 1}-${this.lastEntryIndex} of ${
            this.entries.length
          }`
        : "No results";
    }
  }

  private isNumeric(str) {
    if (typeof str == "number") return true;
    if (typeof str !== "string") return false; // we only process strings!
    return (
      !isNaN(str as any) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
      !isNaN(parseFloat(str))
    ); // ...and ensure strings of whitespace fail
  }
}
