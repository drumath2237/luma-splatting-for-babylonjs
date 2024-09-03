import type { LumaSplattingResponseType, SplatDataUrlsType } from "./types";

export const getSplatAndMetaDataUrlsAsync = async (
  uuid: string,
): Promise<SplatDataUrlsType | null> => {
  const lumaaiBaseEndpoint: string =
    "https://webapp.engineeringlumalabs.com/api/v3/captures";
  const reqURL = `${lumaaiBaseEndpoint}/${uuid}/public`;
  const lumaResonse = await fetch(reqURL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  }).then((res) => res.json() as Promise<LumaSplattingResponseType>);

  if (!lumaResonse.response?.artifacts) {
    return null;
  }
  const artifacts = lumaResonse.response.artifacts;
  const plyUrl = artifacts.find((a) => a.type === "gs_point_cloud");
  const metaDataUrl = artifacts.find((a) => a.type === "gs_point_cloud_meta");

  if (!plyUrl || !metaDataUrl) {
    return null;
  }

  return {
    metaFileUrl: metaDataUrl.url,
    plyFilesUrl: plyUrl.url,
  };
};
