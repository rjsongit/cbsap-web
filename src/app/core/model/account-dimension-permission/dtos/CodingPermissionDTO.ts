export interface CodingPermissionDTO {
    id: number,
    entityProfileID: number,
    roleID: number,
    category: string,
    nameCode: string,
    name: string,
    code: string,
    originallyAssigned: boolean;
    checked: boolean;
}