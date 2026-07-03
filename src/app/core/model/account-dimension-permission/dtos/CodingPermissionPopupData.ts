import { CodingPermissionDTO } from "./CodingPermissionDTO";

export interface CodingPermissionPopupData {
  codingPermissions: CodingPermissionDTO[];
  selectedEntity: number;
  selectedCategory: number;
}