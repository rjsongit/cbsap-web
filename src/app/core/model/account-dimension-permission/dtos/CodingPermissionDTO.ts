export interface CodingPermissionDTO {
    ID: number,
    entityProfileID: number,
    nameCode: string,
    name: string,
    code: string,
    originallyAssigned: boolean; // Tracking the baseline initial database footprint
    checked: boolean;
}