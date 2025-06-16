# cloudflare-r2-kit

[![npm version](https://img.shields.io/npm/v/cloudflare-r2-kit)](https://www.npmjs.com/package/cloudflare-r2-kit)  
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A powerful and lightweight TypeScript utility for working with [Cloudflare R2](https://developers.cloudflare.com/r2/) object storage.  
Easily upload, download, delete, and manage files with support for presigned URLs and nested object photo mapping — perfect for serverless, edge functions, and modern Node.js apps.

---

## Features

- Generate presigned URLs for uploading files to Cloudflare R2
- Generate presigned URLs for downloading files from Cloudflare R2
- Delete files from Cloudflare R2 bucket
- Manage nested object payloads with automatic file URL injection
- Support for arrays and deeply nested fields
- TypeScript ready with type-safe interfaces
- Works seamlessly with AWS SDK v3 compatible clients

---

## Installation

```bash
npm install cloudflare-r2-kit
# or
yarn add cloudflare-r2-kit
```

# Usage

## 1. Configure Cloudflare R2 Service

```
import { CloudflareService } from "cloudflare-r2-kit";

const config = {
  bucketName: "your-bucket-name",
  endpoint: "https://your-account-id.r2.cloudflarestorage.com",
  accessKeyId: "your-access-key-id",
  secretAccessKey: "your-secret-access-key",
};

const cloudflareService = new CloudflareService(config);

```

## 2. Generate Upload URL

```
const { fileName, uploadUrl } = await cloudflareService.getUploadUrl("photos/image.jpg");
console.log("Upload URL:", uploadUrl);
console.log("File key for storage:", fileName);
```

## 3. Generate Download URL

```
const downloadUrl = await cloudflareService.getDownloadUrl(fileName);
console.log("Download URL:", downloadUrl);
```

## 4. Delete a File

```
await cloudflareService.deleteFile(fileName);
console.log("File deleted");
```

# Advanced: Using FileManager for Nested Object Management

```
import { CloudflareService, FileManager } from "cloudflare-r2-kit";

const fileManager = new FileManager(cloudflareService);

// Example payload with nested photo keys
const payload = {
  profile: {
    avatar: "avatar.jpg",
    gallery: [
      { photo: "gallery1.jpg" },
      { photo: "gallery2.jpg" },
    ],
  },
};

// Fields to manage
const fields = ["profile.avatar", "profile.gallery[].photo"];

// Create upload URLs and update payload keys
const { updatedPayload, uploadUrls } = await fileManager.createFilesFromPayload(payload, fields);
console.log("Updated Payload:", updatedPayload);
console.log("Upload URLs:", uploadUrls);

// Append download URLs into payload as `{field}_url`
const withUrls = await fileManager.appendFileUrls(updatedPayload, fields);
console.log("Payload with URLs:", withUrls);

```

## Other FileManager Methods

- updateFilesFromPayload(input, existing, fields): Update existing files, delete old files if replaced or cleared

- deleteFilesFromPayload(item, fields): Delete files from storage based on given fields

## Contributing

Contributions, issues, and feature requests are welcome!
Feel free to check issues or submit a pull request.

# License

`MIT © Nurul Islam Rimon`

# Links

[GitHub Repository](https://github.com/nurulislamrimon/cloudflare-r2-kit)

[Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
