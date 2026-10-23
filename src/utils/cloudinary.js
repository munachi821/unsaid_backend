import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "unsaid_images" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      },
    );
    uploadStream.end(fileBuffer);
  });
};

export const deleteFromCloudinary = async (ImageUrl) => {
  if (!ImageUrl) return;

  try {
    const parts = ImageUrl.split("/");
    const filenameWithExt = parts.pop();

    const fileName = filenameWithExt.split(".")[0];
    const folder = parts.pop();
    const publicId = `${folder}/${fileName}`;

    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error("Cloudinary deletion failed:", err.message);
  }
};
