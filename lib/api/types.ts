export type LumaSplattingResponseType = {
  response?: {
    artifacts?: { type: string; url: string }[];
  };
};

export type SplatDataUrlsType = {
  plyFilesUrl: string;
  metaFileUrl: string;
};

type arr3 = [number, number, number];
type arr4 = [number, number, number, number];

export interface IGSPointCloudMeta {
  gaussians: {
    bounds: {
      xyz_min: arr3;
      xyz_max: arr3;
      f_dc_min: arr3;
      f_dc_max: arr3;
      opacity_min: [number];
      opacity_max: [number];
      scale_min: arr3;
      scale_max: arr3;
      rotation_min: arr4;
      rotation_max: arr4;
    };
  };
}
