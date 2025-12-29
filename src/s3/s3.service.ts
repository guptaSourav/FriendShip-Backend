import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';

@Injectable()
export class S3Service {
  private s3: S3Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    this.bucketName = this.configService.getOrThrow('AWS_S3_BUCKET_NAME');

    this.s3 = new S3Client({
      region: this.configService.getOrThrow('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.getOrThrow('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.getOrThrow('AWS_SECRET_ACCESS_KEY'),
      },
    });
  }

  // ------------------------------
  // EXISTING (KEEP THIS)
  // ------------------------------
  async uploadFile(
    fileBuffer: Buffer,
    key: string,
    contentType: string,
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
      ACL: 'private',
    });

    await this.s3.send(command);

    return `https://${this.bucketName}.s3.amazonaws.com/${key}`;
  }

  // ------------------------------
  // NEW: PRESIGNED URL (Single)
  // ------------------------------
  async generateUserPhotoUploadUrl(params: {
    userId: string;
    contentType: string;
    extension: string;
    expiresIn?: number;
  }): Promise<{ key: string; uploadUrl: string }> {
    const { userId, contentType, extension, expiresIn = 300 } = params;

    const key = `user-photos/${userId}/temp/${randomUUID()}.${extension}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
      ACL: 'private',
    });

    const uploadUrl = await getSignedUrl(this.s3, command, {
      expiresIn,
    });

    return { key, uploadUrl };
  }

  // ------------------------------
  // NEW: PRESIGNED URL (Multiple)
  // ------------------------------
  async generateMultipleUploadUrls(params: {
    userId: string;
    files: {
      contentType: string;
      extension: string;
    }[];
  }) {
    const { userId, files } = params;

    return Promise.all(
      files.map((file) =>
        this.generateUserPhotoUploadUrl({
          userId,
          contentType: file.contentType,
          extension: file.extension,
        }),
      ),
    );
  }
}
