import { GaussianSplatting, Scene } from "@babylonjs/core";

interface ILumaGaussianSplatting {
  get splat(): GaussianSplatting;

  loadDataWithUuidAsync(uuid: string): Promise<void>;
}

export class LumaGaussianSplatting implements ILumaGaussianSplatting {
  private _splat: GaussianSplatting;

  public get splat() {
    return this._splat;
  }

  public constructor(private name: string, private scene: Scene) {
    this._splat = new GaussianSplatting(name, scene);
  }

  loadDataWithUuidAsync(uuid: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
