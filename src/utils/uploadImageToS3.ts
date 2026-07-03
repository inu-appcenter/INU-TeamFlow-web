// utils/uploadImageToS3.ts
export async function uploadImageToS3(uploadUrl: string, file: File) {
  await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });
}
