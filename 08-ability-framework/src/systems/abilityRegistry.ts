import type { Player } from "@minecraft/server";

export interface Ability {
    id: string;
    name: string;
    item: string;
    cooldown: number;      // in ticks
    cost: number;
    costItem: string | null;
    toggle: boolean;
    execute: (player: Player, active?: boolean) => void;
    description: string;
}

export type AbilityInput = Pick<Ability, "id" | "item" | "execute"> &
    Partial<Omit<Ability, "id" | "item" | "execute">>;

export class AbilityRegistry {
    private readonly abilities = new Map<string, Ability>();

    register(input: AbilityInput): void {
        const ability: Ability = {
            id: input.id,
            name: input.name ?? input.id,
            item: input.item,
            cooldown: input.cooldown ?? 0,
            cost: input.cost ?? 0,
            costItem: input.costItem ?? null,
            toggle: input.toggle ?? false,
            execute: input.execute,
            description: input.description ?? "",
        };
        this.abilities.set(ability.id, ability);
    }

    get(id: string): Ability | undefined {
        return this.abilities.get(id);
    }

    getAll(): Ability[] {
        return [...this.abilities.values()];
    }

    findByItem(itemTypeId: string): Ability | undefined {
        for (const ability of this.abilities.values()) {
            if (ability.item === itemTypeId) return ability;
        }
        return undefined;
    }
}
