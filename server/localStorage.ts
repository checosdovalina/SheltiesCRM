import { Response } from "express";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";
const DOG_IMAGES_DIR = path.join(UPLOAD_DIR, "dog-images");
const EVIDENCE_DIR = path.join(UPLOAD_DIR, "evidence");

function ensureDirectoryExists(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

ensureDirectoryExists(DOG_IMAGES_DIR);
ensureDirectoryExists(EVIDENCE_DIR);

export class LocalStorageService {
  getDogImageUploadPath(): { fileId: string; filePath: string } {
    const fileId = randomUUID();
    const filePath = path.join(DOG_IMAGES_DIR, fileId);
    return { fileId, filePath };
  }

  getEvidenceUploadPath(): { fileId: string; filePath: string } {
    const fileId = randomUUID();
    const filePath = path.join(EVIDENCE_DIR, fileId);
    return { fileId, filePath };
  }

  async saveFile(filePath: string, buffer: Buffer): Promise<void> {
    await fs.promises.writeFile(filePath, buffer);
  }

  async getFile(filePath: string): Promise<Buffer | null> {
    try {
      return await fs.promises.readFile(filePath);
    } catch {
      return null;
    }
  }

  async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.promises.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async downloadFile(filePath: string, res: Response, contentType?: string) {
    try {
      const exists = await this.fileExists(filePath);
      if (!exists) {
        res.status(404).json({ error: "File not found" });
        return;
      }

      const stats = await fs.promises.stat(filePath);
      const mimeType = contentType || "application/octet-stream";

      res.set({
        "Content-Type": mimeType,
        "Content-Length": stats.size.toString(),
        "Cache-Control": "public, max-age=3600",
      });

      const stream = fs.createReadStream(filePath);
      stream.on("error", (err) => {
        console.error("Stream error:", err);
        if (!res.headersSent) {
          res.status(500).json({ error: "Error streaming file" });
        }
      });

      stream.pipe(res);
    } catch (error) {
      console.error("Error downloading file:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Error downloading file" });
      }
    }
  }

  getFullPath(type: "dog-images" | "evidence", fileId: string): string {
    const baseDir = type === "dog-images" ? DOG_IMAGES_DIR : EVIDENCE_DIR;
    return path.join(baseDir, fileId);
  }
}

export const localStorageService = new LocalStorageService();

export function isReplitEnvironment(): boolean {
  return !!process.env.REPLIT_SIDECAR_ENDPOINT || !!process.env.REPL_ID;
}
