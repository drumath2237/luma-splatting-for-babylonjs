import { Quaternion } from "@babylonjs/core";
import type { IGSPointCloudMeta } from "./api/types";

const remapValue =
  (x: number) =>
  (srcMin: number, srcMax: number) =>
  (dstMin: number, dstMax: number) =>
    ((x - srcMin) / (srcMax - srcMin)) * (dstMax - dstMin) + dstMin;

/**
 * Code from https://github.com/dylanebert/gsplat.js/blob/main/src/loaders/PLYLoader.ts Under MIT license
 * Loads a .ply from data array buffer
 * if data array buffer is not ply, returns the original buffer
 */
export const convertLumaPlyToSplatData = (
  data: ArrayBufferLike,
  metadata: IGSPointCloudMeta,
): ArrayBuffer => {
  const ubuf = new Uint8Array(data);
  const header = new TextDecoder().decode(ubuf.slice(0, 1024 * 10));
  const headerEnd = "end_header\n";
  const headerEndIndex = header.indexOf(headerEnd);
  if (headerEndIndex < 0 || !header) {
    return data;
  }
  const vertexCount = Number.parseInt(
    /element vertex (\d+)\n/.exec(header)![1],
  );

  let rowOffset = 0;
  const offsets: Record<string, number> = {
    double: 8,
    int: 4,
    uint: 4,
    float: 4,
    short: 2,
    ushort: 2,
    uchar: 1,
  };

  type PlyProperty = {
    name: string;
    type: string;
    offset: number;
  };
  const properties: PlyProperty[] = [];
  const filtered = header
    .slice(0, headerEndIndex)
    .split("\n")
    .filter((k) => k.startsWith("property "));
  for (const prop of filtered) {
    const [_p, type, name] = prop.split(" ");
    properties.push({ name, type, offset: rowOffset });
    if (!offsets[type]) throw new Error(`Unsupported property type: ${type}`);
    rowOffset += offsets[type];
  }

  const rowLength = 3 * 4 + 3 * 4 + 4 + 4;
  const SH_C0 = 0.28209479177387814;

  const dataView = new DataView(data, headerEndIndex + headerEnd.length);
  const buffer = new ArrayBuffer(rowLength * vertexCount);
  const q = new Quaternion();

  for (let i = 0; i < vertexCount; i++) {
    const position = new Float32Array(buffer, i * rowLength, 3);
    const scale = new Float32Array(buffer, i * rowLength + 12, 3);
    const rgba = new Uint8ClampedArray(buffer, i * rowLength + 24, 4);
    const rot = new Uint8ClampedArray(buffer, i * rowLength + 28, 4);

    let r0 = 255;
    let r1 = 0;
    let r2 = 0;
    let r3 = 0;

    for (
      let propertyIndex = 0;
      propertyIndex < properties.length;
      propertyIndex++
    ) {
      const property = properties[propertyIndex];
      let value;
      let remapFunc: (x: number, y: number) => number;
      switch (property.type) {
        // case "float":
        //   value = dataView.getFloat32(property.offset + i * rowOffset, true);
        //   break;
        // case "int":
        //   value = dataView.getInt32(property.offset + i * rowOffset, true);
        //   break;
        case "ushort":
          value = dataView.getUint16(property.offset + i * rowOffset, true);
          remapFunc = remapValue(value)(0, 65535);
          break;
        case "uchar":
          value = dataView.getUint8(property.offset + i * rowOffset);
          remapFunc = remapValue(value)(0, 255);
          break;
        default:
          throw new Error(`Unsupported property type: ${property.type}`);
      }

      const {
        f_dc_max,
        f_dc_min,
        opacity_max,
        opacity_min,
        rotation_max,
        rotation_min,
        scale_max,
        scale_min,
        xyz_max,
        xyz_min,
      } = metadata.gaussians.bounds;

      switch (property.name) {
        case "x":
          position[0] = remapFunc(xyz_min[0], xyz_max[0]);
          break;
        case "y":
          position[1] = remapFunc(xyz_min[1], xyz_max[1]);
          break;
        case "z":
          position[2] = remapFunc(xyz_min[2], xyz_max[2]);
          break;
        case "scale_0":
          scale[0] = Math.exp(remapFunc(scale_min[0], scale_max[0]));
          break;
        case "scale_1":
          scale[1] = Math.exp(remapFunc(scale_min[1], scale_max[1]));
          break;
        case "scale_2":
          scale[2] = Math.exp(remapFunc(scale_min[2], scale_max[2]));
          break;
        case "red":
          rgba[0] = value;
          break;
        case "green":
          rgba[1] = value;
          break;
        case "blue":
          rgba[2] = value;
          break;
        case "f_dc_0":
          rgba[0] = (0.5 + SH_C0 * remapFunc(f_dc_min[0], f_dc_max[0])) * 255;
          break;
        case "f_dc_1":
          rgba[1] = (0.5 + SH_C0 * remapFunc(f_dc_min[1], f_dc_max[1])) * 255;
          break;
        case "f_dc_2":
          rgba[2] = (0.5 + SH_C0 * remapFunc(f_dc_min[2], f_dc_max[2])) * 255;
          break;
        case "f_dc_3":
          rgba[3] = (0.5 + SH_C0 * value) * 255;
          break;
        case "opacity":
          rgba[3] =
            (1 / (1 + Math.exp(-remapFunc(opacity_min[0], opacity_max[0])))) *
            255;
          break;
        case "rot_0":
          r0 = remapFunc(rotation_min[0], rotation_max[0]);
          break;
        case "rot_1":
          r1 = remapFunc(rotation_min[1], rotation_max[1]);
          break;
        case "rot_2":
          r2 = remapFunc(rotation_min[2], rotation_max[2]);
          break;
        case "rot_3":
          r3 = remapFunc(rotation_min[3], rotation_max[3]);
          break;
      }
    }

    q.set(r1, r2, r3, r0);
    q.normalize();
    rot[0] = q.w * 128 + 128;
    rot[1] = q.x * 128 + 128;
    rot[2] = q.y * 128 + 128;
    rot[3] = q.z * 128 + 128;
  }

  return buffer;
};
