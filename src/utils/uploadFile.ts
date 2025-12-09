
// Mock file upload
export const uploadFileToStorage = async (
  path: string,
  file: Blob,
  bucket: string = "menus-files",
) => {
  // Simulate upload delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Return a random placeholder image or the blob url created locally if possible?
  // Start with a static placeholder to be safe.
  return { url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c", error: null };
};
