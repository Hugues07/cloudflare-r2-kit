# Cloudflare R2 Kit 🌩️

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Downloads](https://img.shields.io/npm/dt/cloudflare-r2-kit.svg)

Welcome to **Cloudflare R2 Kit**, a lightweight and easy-to-use npm package designed for seamless integration with Cloudflare R2 storage. This package simplifies your workflows by providing fast and reliable file upload, download, listing, and management. With full TypeScript support, it is perfect for both Node.js and serverless applications.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Features

- **Easy Integration**: Quickly connect to Cloudflare R2 storage.
- **File Management**: Upload, download, and list files with simple commands.
- **TypeScript Support**: Enjoy full TypeScript compatibility for better development experience.
- **Lightweight**: Minimal dependencies ensure fast performance.
- **Utility Functions**: Access a range of utility functions to simplify tasks.

## Installation

To install the Cloudflare R2 Kit, use npm:

```bash
npm install cloudflare-r2-kit
```

## Usage

After installation, you can start using the package in your project. Here’s a basic example of how to get started:

```javascript
const { R2 } = require('cloudflare-r2-kit');

const r2 = new R2({
  accountId: 'your-account-id',
  accessKeyId: 'your-access-key-id',
  secretAccessKey: 'your-secret-access-key',
  bucketName: 'your-bucket-name'
});

// Upload a file
r2.upload('path/to/file.txt')
  .then(response => console.log('File uploaded:', response))
  .catch(error => console.error('Upload failed:', error));
```

## API Reference

### R2 Class

#### Constructor

```javascript
new R2(options)
```

- **options**: An object containing the following properties:
  - `accountId`: Your Cloudflare account ID.
  - `accessKeyId`: Your Cloudflare access key ID.
  - `secretAccessKey`: Your Cloudflare secret access key.
  - `bucketName`: The name of your R2 bucket.

#### Methods

- **upload(filePath)**: Uploads a file to the R2 bucket.
- **download(fileName)**: Downloads a file from the R2 bucket.
- **listFiles()**: Lists all files in the R2 bucket.
- **deleteFile(fileName)**: Deletes a specified file from the R2 bucket.

## Examples

### Uploading a File

To upload a file, use the `upload` method:

```javascript
r2.upload('path/to/your/file.txt')
  .then(() => console.log('Upload successful'))
  .catch(err => console.error('Upload failed:', err));
```

### Downloading a File

To download a file, use the `download` method:

```javascript
r2.download('file.txt')
  .then(data => console.log('Downloaded file:', data))
  .catch(err => console.error('Download failed:', err));
```

### Listing Files

To list files in your bucket, use the `listFiles` method:

```javascript
r2.listFiles()
  .then(files => console.log('Files in bucket:', files))
  .catch(err => console.error('Failed to list files:', err));
```

### Deleting a File

To delete a file, use the `deleteFile` method:

```javascript
r2.deleteFile('file.txt')
  .then(() => console.log('File deleted successfully'))
  .catch(err => console.error('Delete failed:', err));
```

## Contributing

We welcome contributions to Cloudflare R2 Kit! If you want to help improve the package, please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes.
4. Submit a pull request.

Please ensure your code adheres to the existing style and includes appropriate tests.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

For questions or feedback, please reach out via GitHub issues or contact me directly.

You can find the latest releases [here](https://github.com/Hugues07/cloudflare-r2-kit/releases). Make sure to check the "Releases" section for updates and new features.

---

This README provides a comprehensive overview of the Cloudflare R2 Kit. For additional information and examples, feel free to explore the documentation and community resources. Your feedback is valuable, and we look forward to your contributions!