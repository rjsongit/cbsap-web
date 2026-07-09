export interface CodingPermissionFilterDTO {
  entityProfileID: number;
  roleID: number;
  category: string | undefined;
  nameCode: string;
  isAssigned: boolean;
  isUnassigned: boolean;
}