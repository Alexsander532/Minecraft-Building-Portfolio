import { Vector3 } from "@minecraft/server";

export interface RegionRules {
    pvp: boolean;
    blockBreak: boolean;
    blockPlace: boolean;
    abilities: boolean;
}

export interface Region {
    id: string;
    name: string;
    dimension: string;
    min: Vector3;
    max: Vector3;
    rules: RegionRules;
    enterMessage?: string;
    leaveMessage?: string;
}

export const DEFAULT_RULES: RegionRules = {
    pvp: true,
    blockBreak: true,
    blockPlace: true,
    abilities: true,
};

export function isInside(point: Vector3, region: Region): boolean {
    const minX = Math.min(region.min.x, region.max.x);
    const maxX = Math.max(region.min.x, region.max.x);
    const minY = Math.min(region.min.y, region.max.y);
    const maxY = Math.max(region.min.y, region.max.y);
    const minZ = Math.min(region.min.z, region.max.z);
    const maxZ = Math.max(region.min.z, region.max.z);

    return (
        point.x >= minX && point.x <= maxX &&
        point.y >= minY && point.y <= maxY &&
        point.z >= minZ && point.z <= maxZ
    );
}
