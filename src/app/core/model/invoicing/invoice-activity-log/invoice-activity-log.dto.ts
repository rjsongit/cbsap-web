export interface InvActivityLogDto {
  actionName: string;
  invActivityLogEntries: InvActivityLogEntriesDto[];
}

export interface InvActivityLogEntriesDto {
  activityID: number;
  invoiceID: number;
  activity: string | null;
  actionBy: string | null;
  module: string | null;
  oldValue: string | null;
  newValue: string | null;
  tableName: string | null;
  columnName: string | null;
  metaDataOld: string | null;
  metaDataNew: string | null;
  metaData: string | null;
  actionDate: Date;
  createdBy: string | null;
  createdDate: Date;
  lastUpdatedBy: string | null;
  lastUpdatedDate: Date | null;
}
