import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  bytes: number;
  format: string;
}

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(private configService: ConfigService) {
    this.initializeCloudinary();
  }

  private initializeCloudinary() {
    try {
      const { cloudName, apiKey, apiSecret } =
        this.configService.get('cloudinary');

      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
      });
      this.logger.log('Cloudinary initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Cloudinary', error.stack);
      throw new Error('Cloudinary configuration failed');
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    subfolder?: string,
  ): Promise<CloudinaryUploadResult> {
    const { uploadPreset, defaultFolder } =
      this.configService.get('cloudinary');

    // Validate file exists
    if (!file?.buffer) {
      throw new Error('No file buffer provided');
    }

    // Special handling for PDFs
    const isPDF = file.mimetype === 'application/pdf';
    const uploadOptions = {
      upload_preset: uploadPreset,
      folder: subfolder ? `${defaultFolder}/${subfolder}` : defaultFolder,
      resource_type: (isPDF ? 'raw' : 'auto') as 'raw' | 'auto',
      format: isPDF ? 'pdf' : undefined,
      type: 'upload',
      tags: ['legal_documents'],
    };

    this.logger.debug(
      `Uploading file with options: ${JSON.stringify(uploadOptions)}`,
    );

    try {
      return await new Promise<CloudinaryUploadResult>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              this.logger.error('Upload failed', error);
              reject(new Error(`Cloudinary upload failed: ${error.message}`));
              return;
            }
            if (!result) {
              reject(new Error('No result from Cloudinary'));
              return;
            }
            resolve({
              secure_url: result.secure_url,
              public_id: result.public_id,
              bytes: result.bytes,
              format: result.format,
            });
          },
        );

        Readable.from(file.buffer).pipe(uploadStream);
      });
    } catch (error) {
      this.logger.error(`File upload failed: ${error.message}`, error.stack);
      throw new Error(`File upload failed: ${error.message}`);
    }
  }

  async deleteFile(publicId: string): Promise<void> {
    if (!publicId) {
      throw new Error('No public_id provided');
    }

    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        invalidate: true, // Optional: CDN cache invalidation
      });

      if (result.result !== 'ok') {
        throw new Error(`Deletion failed: ${result.result}`);
      }
      this.logger.log(`Successfully deleted file: ${publicId}`);
    } catch (error) {
      this.logger.error(`Failed to delete file ${publicId}`, error.stack);
      throw new Error(`File deletion failed: ${error.message}`);
    }
  }

  async getFileInfo(publicId: string): Promise<any> {
    try {
      return await cloudinary.api.resource(publicId);
    } catch (error) {
      this.logger.error(
        `Failed to fetch file info for ${publicId}`,
        error.stack,
      );
      throw new Error(`File info fetch failed: ${error.message}`);
    }
  }
}
