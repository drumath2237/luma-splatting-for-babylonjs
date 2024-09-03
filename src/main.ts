import "./style.scss";

import { Engine, Scene } from "@babylonjs/core";

import { LumaGaussianSplatting } from "../lib";

const main = async () => {
  const renderCanvas = document.getElementById(
    "renderCanvas",
  ) as HTMLCanvasElement;
  if (!renderCanvas) {
    return;
  }

  const engine = new Engine(renderCanvas);
  const scene = new Scene(engine);
  scene.createDefaultCameraOrLight(true, true, true);

  // 1. Create LumaGaussianSplatting Object.
  // 2. Load splat data with UUID
  //    and put the gaussian splatting into your scene.
  const lumaSplat = new LumaGaussianSplatting("luma splat", scene);
  await lumaSplat.loadDataWithUuidAsync("389ddb1d-e926-49d5-b342-ee4ddbc9a22d");

  lumaSplat.splat.mesh?.rotation.set(0, (3 * Math.PI) / 4, 0);

  window.addEventListener("resize", () => engine.resize());
  engine.runRenderLoop(() => scene.render());
};

main();
