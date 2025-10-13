import { TObjectDescription, TObject, Object, EObjectType } from "./object";

export type TEntityDescription = TObjectDescription & {
    type: EObjectType.entity
}
export type TEntity = TObject & {
    description: TEntityDescription
}
export class Entity extends Object {
    declare description: TEntityDescription

    constructor(config: TEntity) {
        super(config as TObject);
    }
}