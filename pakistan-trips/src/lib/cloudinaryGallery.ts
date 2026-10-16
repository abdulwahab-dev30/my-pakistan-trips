const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "lvv2vfug";

type CloudinaryResource = {
  public_id: string;
  version: number;
  format: string;
};

let galleryResourcesPromise: Promise<CloudinaryResource[]> | null = null;

async function getGalleryResources(): Promise<CloudinaryResource[]> {
  if (!galleryResourcesPromise) {
    galleryResourcesPromise = fetch(
      `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/list/gallery.json`
    )
      .then((response) => (response.ok ? response.json() : null))
      .then((data) =>
        Array.isArray(data?.resources)
          ? data.resources.filter(
              (item: any): item is CloudinaryResource =>
                Boolean(item?.public_id && item?.version && item?.format)
            )
          : []
      )
      .catch(() => []);
  }

  return galleryResourcesPromise;
}

/** Returns a randomly selected, automatically optimized image from the Cloudinary gallery tag. */
export async function getRandomGalleryImage(width = 1200): Promise<string | null> {
  const resources = await getGalleryResources();
  if (!resources.length) return null;

  const item = resources[Math.floor(Math.random() * resources.length)];
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto,w_${width}/v${item.version}/${item.public_id}.${item.format}`;
}
