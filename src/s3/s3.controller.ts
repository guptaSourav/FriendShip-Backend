import { Body, Controller, Post, BadRequestException } from '@nestjs/common';
import { S3Service } from './s3.service';
import { GenerateMultipleUploadUrlsDto } from './dto/generate-upload-urls.dto';

@Controller('s3')
export class S3Controller {
  constructor(private readonly s3Service: S3Service) {}

  // Single or multiple files
  @Post('upload-urls')
  async getUploadUrls(@Body() body: GenerateMultipleUploadUrlsDto) {
    const { userId, files } = body;

    if (!files || files.length === 0) {
      throw new BadRequestException('Files metadata is required');
    }

    const uploadUrls = await this.s3Service.generateMultipleUploadUrls({
      userId,
      files,
    });
    
    return { uploadUrls };
  }
  
  @Post('documents/upload-url')
  async getDocUploadUrls(@Body() body: GenerateMultipleUploadUrlsDto) {
    const { userId, files } = body;
    if (!files || files.length === 0) {
      throw new BadRequestException('Files metadata is required');
    }
    const uploadUrls = await this.s3Service.generateUserDocUploadUrl({
      userId,
      files,
    });
    return { uploadUrls };
  }
}
