import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Res,
  Header,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentService } from './document.service';
import { CreateDocumentDto, UpdateDocumentDto } from './dto/document.dto';
import { Response } from 'express';

@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
      fileFilter: (req, file, callback) => {
        if (file.mimetype === 'application/pdf') {
          callback(null, true);
        } else {
          callback(
            new BadRequestException('Only PDF files are allowed'),
            false,
          );
        }
      },
    }),
  )
  async createDocument(
    @Body() dto: CreateDocumentDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return this.documentService.createDocument(dto, file);
  }

  @Get()
  async getAllDocuments(@Query('caseId') caseId?: string) {
    if (caseId) {
      return this.documentService.findDocumentsByCaseId(caseId);
    }
    return this.documentService.findAllDocuments();
  }

  @Get(':id')
  async getDocument(@Param('id') id: string) {
    return this.documentService.findDocumentById(id);
  }

  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
      fileFilter: (req, file, callback) => {
        if (!file || file.mimetype === 'application/pdf') {
          callback(null, true);
        } else {
          callback(
            new BadRequestException('Only PDF files are allowed'),
            false,
          );
        }
      },
    }),
  )
  async updateDocument(
    @Param('id') id: string,
    @Body() dto: UpdateDocumentDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.documentService.updateDocument(id, dto, file);
  }

  @Delete(':id')
  async deleteDocument(@Param('id') id: string) {
    return this.documentService.deleteDocument(id);
  }

  @Get(':id/download')
  @Header('Content-Type', 'application/pdf')
  async downloadDocument(@Param('id') id: string, @Res() res: Response) {
    try {
      const { fileStream, filename, contentType } =
        await this.documentService.getDocumentFile(id);

      res.set({
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
      });

      fileStream.on('error', (err) => {
        console.error('Stream error:', err);
        res.status(500).send('Error streaming file');
      });

      fileStream.pipe(res);
    } catch (error) {
      console.error('Download error:', error);
      if (error instanceof NotFoundException) {
        res.status(404).send('File not found');
      } else {
        res.status(500).send('Download failed');
      }
    }
  }
}
