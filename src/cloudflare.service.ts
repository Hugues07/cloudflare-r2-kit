import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import * as path from "path";
import { lookup } from "mime-types";

export interface CloudflareR2Config {
  bucketName: string;
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
}

export class CloudflareService {
  private readonly s3: S3Client;
  private readonly bucketName: string;

  constructor(config: CloudflareR2Config) {
    this.bucketName = config.bucketName;

    this.s3 = new S3Client({
      endpoint: config.endpoint,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      region: "auto",
    });
  }

  async getUploadUrl(
    fileKey: string,
    expiresIn: number = 3600
  ): Promise<{ fileName: string; uploadUrl: string }> {
    const fileExt = path.extname(fileKey);
    const fileName =
      fileKey.replace(fileExt, "").toLowerCase().split(" ").join("-") +
      Date.now() +
      fileExt;
    const contentType = lookup(fileExt) || "application/octet-stream";

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileName,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(this.s3, command, { expiresIn });
    return { fileName, uploadUrl };
  }

  async getDownloadUrl(
    fileKey: string,
    expiresIn: number = 604800
  ): Promise<string> {
    if (!fileKey) return "";
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
    });
    return await getSignedUrl(this.s3, command, { expiresIn });
  }

  async deleteFile(fileKey: string): Promise<void> {
    if (!fileKey) return;
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
    });
    await this.s3.send(command);
  }
}
