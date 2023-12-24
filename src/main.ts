import "./style.scss";

import { Engine, MeshBuilder, Scene, Vector3 } from "@babylonjs/core";

import { LumaGaussianSplatting } from "../lib";

const main = async () => {
  const renderCanvas = document.getElementById(
    "renderCanvas"
  ) as HTMLCanvasElement;
  if (!renderCanvas) {
    return;
  }

  const engine = new Engine(renderCanvas, true);
  const scene = new Scene(engine);

  scene.createDefaultCameraOrLight(true, true, true);

  const box = MeshBuilder.CreateBox("box", { size: 0.1 });
  box.position = new Vector3(0, 0.05, 0);

  window.addEventListener("resize", () => engine.resize());
  engine.runRenderLoop(() => scene.render());

  // 1. Create LumaGaussianSplatting Object.
  // 2. Load splat data with UUID and put the gaussian splatting into your scene.
  const lumaSplat = new LumaGaussianSplatting("luma splat", scene);
  await lumaSplat.loadDataWithUuidAsync("ca9ea966-ca24-4ec1-ab0f-af665cb546ff");
};

main();
