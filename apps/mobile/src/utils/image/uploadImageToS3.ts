// apps/mobile/src/utils/uploadImageToS3.ts
export async function uploadImageToS3(
  uploadUrl: string,
  fileUri: string,
  contentType: string
) {
  const response = await fetch(fileUri);
  const blob = await response.blob();

  await fetch(uploadUrl, {
    method: "PUT",
    body: blob,
    headers: { "Content-Type": contentType },
  });
}
