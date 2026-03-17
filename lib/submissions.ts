import { rm } from "fs/promises";
import path from "path";

export async function removeSubmissionUploads(submissionId: string) {
  const uploadDir = path.join(process.cwd(), "public", "uploads", submissionId);
  await rm(uploadDir, { recursive: true, force: true });
}
