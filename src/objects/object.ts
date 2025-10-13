export enum EObjectType {
    resource = 'resource', // Minerals, Materials
    item = 'item', // Food, Grass, Seeds
    entity = 'entity', // Players, Animals
    structure = 'structure',  // Trees
}

export type TObjectDescription = {
    id: string,
    type: EObjectType,
    realm?: string,
    kind?: string
}

export type TObjectComponents = {
    feature: object
}

export type TObject = {
    description: TObjectDescription
    components?: TObjectComponents
};

export class Object {
    description!: TObjectDescription 
    components?: TObjectComponents

    constructor(config?: TObject) {
        this.description = config?.description ?? {id: 'air', type: EObjectType.resource}
        this.components = config?.components
    }
}

/*
"brewing_stand",
"cartography_table"
"crafting_table",
"deprecated"
"smithing_table",
"stonecutter",
"blast_furnace",
"furnace",
"smoker",
"campfire",
"soul_campfire"
*/