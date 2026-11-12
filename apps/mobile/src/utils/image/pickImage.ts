import * as ImagePicker from "expo-image-picker";

/**
 * 사진 선택 공통 옵션
 * - iOS 사진은 기본이 HEIC → 서버(presigned URL)가 거절하고 웹 브라우저도 대부분 못 보여줌
 * - Compatible: 고를 때 JPEG로 변환해서 넘겨줌
 */
export const IMAGE_PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ImagePicker.MediaTypeOptions.Images,
  quality: 0.8,
  preferredAssetRepresentationMode:
    ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
};

const MIME_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  heic: "image/heic",
  heif: "image/heif",
};

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export type UploadableImage = {
  uri: string;
  fileName: string;
  mimeType: string;
};

/**
 * 업로드용 이미지 정보로 정리
 * 변환 후에도 fileName/mimeType이 원본(heic) 값으로 남는 경우가 있어서
 * 실제 파일(uri) 확장자 기준으로 맞춤
 */
export function toUploadableImage(
  asset: ImagePicker.ImagePickerAsset,
  index = 0
): UploadableImage {
  const uriExt = asset.uri.split("?")[0].split(".").pop()?.toLowerCase() ?? "";
  const mimeType = MIME_BY_EXT[uriExt] ?? asset.mimeType ?? "image/jpeg";
  const ext = EXT_BY_MIME[mimeType] ?? "jpg";

  const baseName = (asset.fileName ?? `image-${Date.now()}-${index}`).replace(
    /\.[^.]+$/,
    ""
  );

  return {
    uri: asset.uri,
    fileName: `${baseName}.${ext}`,
    mimeType,
  };
}

/** 서버가 받지 않는 형식인지 (변환이 안 된 경우 대비) */
export function isUnsupportedImage(image: UploadableImage) {
  return image.mimeType === "image/heic" || image.mimeType === "image/heif";
}

/**
 * presigned URL로 이미지 업로드 (S3 PUT)
 * RN은 body가 Blob이면 Content-Type 헤더를 blob.type으로 덮어씀
 * → blob.type이 비어 있으면 빈 Content-Type으로 가서 S3 서명 불일치(403)
 * → type을 명시한 Blob으로 다시 감싸서 보냄
 */
export async function uploadToPresignedUrl(
  uploadUrl: string,
  image: UploadableImage
): Promise<void> {
  const original = await (await fetch(image.uri)).blob();
  const blob = new Blob([original], { type: image.mimeType });

  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": image.mimeType },
    body: blob,
  });

  // fetch는 4xx/5xx에서 throw하지 않으므로 직접 체크
  if (!res.ok) {
    throw new Error(`이미지 업로드 실패 (${res.status})`);
  }
}
