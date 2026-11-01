import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise'
import { TObjectDescription, TObjectComponents, TObject, Object, EObjectType } from './object'

export type TResourceDescription = TObjectDescription & {
    type: EObjectType.resource
}
export type TResourceGenerator = {
    seed: number
    gap: number
    amp: number
    threshold: number
    should?: (x: number, z: number) => void
}
export type TResourceComponents = TObjectComponents & {
    generator: TResourceGenerator
}

export type TResource = TObject & {
    description: TResourceDescription
    components: TResourceComponents
}

export class Resource extends Object {
    declare description: TResourceDescription
    declare components: TResourceComponents & {
        generator: ResourceGenerator
    }

    constructor(config: TResource) {
        super(config as TObject);
        this.components = {
            ...config.components,
            generator: new ResourceGenerator(config.components.generator)
        }
    }
}

export class ResourceGenerator {
    seed!: number
    gap!: number
    amp!: number
    threshold!: number
    private _should?: (x: number, z: number) => void

    constructor(config: TResourceGenerator) {
        this.seed = config.seed
        this.gap = config.gap
        this.amp = config.amp
        this.threshold = config.threshold
        this._should = config.should
    }

    should(x: number, z: number) {
        if(this._should) return this._should.call(this, x, z)
        const instance = new ImprovedNoise()
        const offset = instance.noise(x / this.gap, z / this.gap, this.seed) * this.amp
        return offset > this.threshold
    }
}