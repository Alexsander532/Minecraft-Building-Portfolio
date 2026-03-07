import { Player, Vector3 } from "@minecraft/server";
import { Region, RegionRules, DEFAULT_RULES, isInside } from "./regionData.js";

class RegionManager {

    private regions: Map<string, Region> = new Map();
    private playerRegionCache: Map<string, string[]> = new Map();

    register(region: Region): void {
        if (this.regions.has(region.id)) {
            throw new Error(`Region with id "${region.id}" is already registered.`);
        }
        this.regions.set(region.id, region);
    }

    unregister(regionId: string): boolean {
        return this.regions.delete(regionId);
    }

    getRegionsAt(point: Vector3, dimension: string): Region[] {
        const result: Region[] = [];
        for (const region of this.regions.values()) {
            if (region.dimension === dimension && isInside(point, region)) {
                result.push(region);
            }
        }
        return result;
    }

    getRulesAt(point: Vector3, dimension: string): RegionRules {
        const regions = this.getRegionsAt(point, dimension);
        if (regions.length === 0) return { ...DEFAULT_RULES };

        // Merge rules: if ANY region denies, deny
        const merged: RegionRules = { ...DEFAULT_RULES };
        for (const region of regions) {
            if (!region.rules.pvp) merged.pvp = false;
            if (!region.rules.blockBreak) merged.blockBreak = false;
            if (!region.rules.blockPlace) merged.blockPlace = false;
            if (!region.rules.abilities) merged.abilities = false;
        }
        return merged;
    }

    updatePlayerRegions(player: Player): { entered: Region[]; left: Region[] } {
        const loc = player.location;
        const dim = player.dimension.id;
        const current = this.getRegionsAt(loc, dim).map(r => r.id);
        const previous = this.playerRegionCache.get(player.id) ?? [];

        const entered = current
            .filter(id => !previous.includes(id))
            .map(id => this.regions.get(id)!)
            .filter(Boolean);

        const left = previous
            .filter(id => !current.includes(id))
            .map(id => this.regions.get(id)!)
            .filter(Boolean);

        this.playerRegionCache.set(player.id, current);
        return { entered, left };
    }

    getAll(): Region[] {
        return [...this.regions.values()];
    }
}

export const regionManager = new RegionManager();
