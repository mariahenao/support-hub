async function getAccessToken(): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: import.meta.env.VITE_GOOGLE_REFRESH_TOKEN as string,
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID as string,
      client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET as string,
    }),
  });

  const data = await res.json();
  if (!data.access_token)
    throw new Error(data.error_description ?? "Failed to obtain Google access token");
  return data.access_token;
}

export async function uploadToGoogleDrive(
  file: File,
  submissionId?: string,
): Promise<string> {
  const accessToken = await getAccessToken();
  const folderId = import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_ID as string | undefined;

  // Embed submission ID in filename: submissionId_originalname
  const driveName = submissionId
    ? `${submissionId}_${file.name}`
    : `${Date.now()}_${file.name}`;

  const metadata: Record<string, unknown> = { name: driveName };
  if (folderId) metadata.parents = [folderId];

  const body = new FormData();
  body.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
  body.append("file", file);

  const res = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body,
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message ?? "Google Drive upload failed");
  }

  const { id } = await res.json();
  return `https://drive.google.com/file/d/${id}/view`;
}
