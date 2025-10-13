import { TObjectDescription, TObject, Object, EObjectType } from "./object";

export type TStructureDescription = TObjectDescription & {
    type: EObjectType.structure
}
export type TStructure = TObject & {
    description: TStructureDescription
}
export class Structure extends Object {
    declare description: TStructureDescription

    constructor(config: TStructure) {
        super(config as TObject);
    }
}