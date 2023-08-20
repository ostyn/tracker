import { EventAggregator, Subscription } from "aurelia-event-aggregator";
import { IEntry } from "resources/elements/entry/entry.interface";
import { autoinject, bindable } from "aurelia-framework";
import { Router } from "aurelia-router";
import { ActivityService } from "resources/services/activityService";
import { EntryDao } from "resources/dao/EntryDao";
import { activationStrategy } from "aurelia-router";
import { DialogService } from "aurelia-dialog";
import { ActivityPromptDialog } from "resources/dialogs/activity-prompt";
import escapeRegExp from "escape-string-regexp";
import { ActivityDetailSelectDialog } from "resources/dialogs/activity-detail-select";
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
  public selectedActivity: number;
  public selectedDetail: string;
  determineActivationStrategy() {
    return activationStrategy.invokeLifecycle;
  }
  constructor(
    private entryDao: EntryDao,
    private activityService: ActivityService,
    private router: Router,
    private ea: EventAggregator,
    private dialogService: DialogService
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
    if (!params.q && !params.a && !params.detail) {
      this.resetState();
      return;
    }
    this.currentPage =
      params.p === undefined
        ? (this.currentPage = 0)
        : Number.parseInt(params.p);
    if (
      this.searchTerm !== params.q ||
      this.selectedActivity !== params.a ||
      this.selectedDetail !== params.detail
    ) {
      this.searchBoxValue = params.q;
      this.searchTerm = params.q;
      this.selectedActivity = parseInt(params.a);
      this.selectedDetail = params.detail;
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
    this.selectedActivity = undefined;
    this.selectedDetail = undefined;
    this.searchBoxValue = undefined;
    this.updateVisibility();
  }
  public searchBoxValueChanged() {
    this.currentPage = 0;
    this.router.navigateToRoute(
      "search",
      this.searchBoxValue || this.selectedActivity || this.selectedDetail
        ? {
            q: this.searchBoxValue,
            a: this.selectedActivity,
            detail: this.selectedDetail,
          }
        : undefined
    );
  }
  public nextPage() {
    if (this.currentPage < this.lastPageIndex) {
      this.currentPage++;
      this.router.navigateToRoute("search", {
        p: this.currentPage,
        q: this.searchTerm,
        a: this.selectedActivity,
        detail: this.selectedDetail,
      });
    }
  }
  public prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.router.navigateToRoute("search", {
        p: this.currentPage,
        q: this.searchTerm,
        a: this.selectedActivity,
        detail: this.selectedDetail,
      });
    }
  }

  public async search() {
    if (!this.searchTerm && !this.selectedActivity && !this.selectedDetail)
      return;
    this.isRequesting = true;
    this.updateVisibility();
    this.entryDao.getAll().then((entries: IEntry[]) => {
      this.entries = entries.filter((entry) => {
        let regex = new RegExp(escapeRegExp(this.searchTerm || ""), "i");
        let containsSearchQuery =
          regex.test(entry.note) ||
          regex.test(entry.createdBy) ||
          regex.test(entry.lastUpdatedBy) ||
          Array.from(entry.activities.values())
            .filter((activity) => Array.isArray(activity))
            .some((activityDetail) =>
              (activityDetail as string[]).some((detail) => regex.test(detail))
            ) ||
          entry.activitiesArray.some((activityId) =>
            regex.test(
              this.activityService.activitiesMap?.get(activityId)?.name
            )
          ) ||
          regex.test(entry.date);
        if (this.selectedActivity) {
          containsSearchQuery =
            entry.activitiesArray.includes(this.selectedActivity) &&
            containsSearchQuery;
          if (this.selectedDetail) {
            containsSearchQuery =
              Array.from(entry.activities.values())
                .filter((activity) => Array.isArray(activity))
                .some((activityDetail) =>
                  (activityDetail as string[]).some(
                    (detail) =>
                      detail.toLocaleLowerCase() ===
                      this.selectedDetail.toLocaleLowerCase()
                  )
                ) && containsSearchQuery;
          }
        }
        return containsSearchQuery;
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
  addFilter() {
    if (!this.selectedActivity) this.openActivityPrompt();
    else this.openDetailSelect();
  }
  public openActivityPrompt(): void {
    const tempActivity = this.selectedActivity;
    this.dialogService
      .open({
        viewModel: ActivityPromptDialog,
        model: this.selectedActivity,
      })
      .whenClosed((response) => {
        if (!response.wasCancelled) {
          this.router.navigateToRoute("search", {
            q: this.searchTerm,
            a: response.output,
          });
        } else {
          this.selectedActivity = tempActivity;
        }
      });
  }
  public clearSelection() {
    if (this.selectedDetail) {
      this.router.navigateToRoute("search", {
        q: this.searchTerm,
        a: this.selectedActivity,
      });
    } else if (this.selectedActivity) {
      this.router.navigateToRoute("search", {
        q: this.searchTerm,
      });
    } else {
      this.router.navigateToRoute("search");
    }
  }

  private updateVisibility() {
    this.disableNext = this.currentPage === this.lastPageIndex;
    this.disablePrev = this.currentPage === 0;
    this.showLoader = this.isRequesting;
    this.showResultsText = !!this.searchTerm || !!this.selectedActivity;
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
  public detailClicked(detail, id) {
    this.router.navigateToRoute("search", {
      detail,
      a: id,
      q: "",
    });
  }
  public openDetailSelect() {
    const tempDetail = this.selectedDetail;
    this.dialogService
      .open({
        viewModel: ActivityDetailSelectDialog,
        model: { id: this.selectedActivity },
      })
      .whenClosed((response) => {
        if (!response.wasCancelled) {
          this.router.navigateToRoute("search", {
            q: this.searchTerm,
            a: this.selectedActivity,
            detail: response.output,
          });
        } else {
          this.selectedDetail = tempDetail;
        }
      });
  }
}
