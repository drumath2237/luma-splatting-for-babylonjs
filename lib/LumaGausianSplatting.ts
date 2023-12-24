import { GaussianSplatting, Scene } from "@babylonjs/core";
import { IGSPointCloudMeta, getSplatAndMetaDataUrlsAsync } from "./api";
import { convertLumaPlyToSplatData } from "./plyUtils";

export interface ILumaGaussianSplatting {
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

  public async loadDataWithUuidAsync(uuid: string): Promise<void> {
    const artifacts = await getSplatAndMetaDataUrlsAsync(uuid);
    if (!artifacts) {
      return;
    }

    const { metaFileUrl, plyFilesUrl } = artifacts;
    const [plyBinary, metaData] = await Promise.all([
      fetch(plyFilesUrl).then((res) => res.arrayBuffer()),
      fetch(metaFileUrl).then(
        (res) => res.json() as Promise<IGSPointCloudMeta>
      ),
    ]);

    const splatBinaryData = await convertLumaPlyToSplatData(
      plyBinary,
      metaData
    );

    this._splat = new GaussianSplatting(this.name, this.scene);
    await this._splat.loadDataAsync(splatBinaryData);
  }
}
