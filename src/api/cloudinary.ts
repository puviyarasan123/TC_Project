export async function uploadLogoToCloudinary(file: File): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET!);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: fd }
  );
  if (!res.ok) throw new Error('Logo upload failed');
  const data = await res.json();
  return data.secure_url as string;
}
