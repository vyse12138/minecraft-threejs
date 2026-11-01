import { TObjectDescription, TObject, Object, EObjectType } from "./object";

export type TItemDescription = TObjectDescription & {
    type: EObjectType.item
}

export type TItem = TObject & {
    description: TItemDescription
}

export class Item extends Object {
    declare description: TItemDescription

    constructor(config: TItem) {
        super(config as TObject);
    }
}