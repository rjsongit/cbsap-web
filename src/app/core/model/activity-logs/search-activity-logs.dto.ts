export interface SearchActivityLogDto {
  actionDate: string;
  action: string;
  activityClass: string;
  previousValue: string;
  newValue: string;
  reason: string;
  actionedBy: string;
}