export interface CodingPermissionFilterDTO {
  entityProfileID: number;
  category: string | undefined;
  nameCode: string;
  isAssigned: boolean;
  isUnassigned: boolean;
}