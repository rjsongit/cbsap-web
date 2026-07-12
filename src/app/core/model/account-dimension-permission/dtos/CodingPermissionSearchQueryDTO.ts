import { BasePaginationQuery } from "@core/model/dynamic-grid/grid.config";

export interface CodingPermissionSearchQueryDTO extends BasePaginationQuery {
    entityProfileID: number;
    roleID: number;
    category: string | undefined;
}