import fs from "node:fs/promises";
import path from "node:path";
import { v4 as uuidv4 } from "uuid";
import { del, put } from "@vercel/blob";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

type UploadResult = { url: string; size: number; type: string };

function getUploadType(): "local" | "object" {
  const value = (process.env.UPLOAD_TYPE || "local").toLowerCase().trim();
  return value === "object" ? "object" : "local";
}

function assertBlobToken() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      "UPLOAD_TYPE=object requires BLOB_READ_WRITE_TOKEN to be set",
    );
  }
}

async function saveFileToLocal(
  file: File,
  folder: string,
): Promise<UploadResult> {
  const targetDir = path.join(UPLOAD_DIR, folder);
  try {
    await fs.access(targetDir);
  } catch {
    await fs.mkdir(targetDir, { recursive: true });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split(".").pop();
  const filename = `${uuidv4()}.${ext}`;
  const filePath = path.join(targetDir, filename);

  await fs.writeFile(filePath, buffer);

  return {
    url: `/uploads/${folder}/${filename}`,
    size: file.size,
    type: file.type,
  };
}

async function saveFileToObject(
  file: File,
  folder: string,
): Promise<UploadResult> {
  assertBlobToken();

  const ext = file.name.split(".").pop() || "bin";
  const pathname = `uploads/${folder}/${uuidv4()}.${ext}`;

  const blob = await put(pathname, file, {
    access: "public",
    contentType: file.type || undefined,
  });

  return {
    url: blob.url,
    size: file.size,
    type: file.type,
  };
}

export async function saveFileLocally(
  file: File,
  folder: string = "products",
): Promise<UploadResult> {
  if (getUploadType() === "object") {
    return saveFileToObject(file, folder);
  }
  return saveFileToLocal(file, folder);
}

async function deleteLocalFile(relativeUrl: string) {
  const normalized = relativeUrl.startsWith("/")
    ? relativeUrl.slice(1)
    : relativeUrl;
  const filePath = path.join(process.cwd(), "public", normalized);
  await fs.unlink(filePath);
}

export async function deleteFileLocally(url: string) {
  try {
    if (!url) return;

    if (/^https?:\/\//i.test(url)) {
      if (getUploadType() === "object" || url.includes("blob.vercel-storage.com")) {
        assertBlobToken();
        await del(url);
      }
      return;
    }

    await deleteLocalFile(url);
  } catch (error) {
    console.error("Failed to delete file:", error);
  }
}
