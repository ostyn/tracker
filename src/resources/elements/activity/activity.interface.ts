export interface IActivity {
  type: "number" | "text";
  category: string | undefined;
  name: any;
  emoji: any;
  created: number;
  isArchived: boolean;
  id: string;
}
