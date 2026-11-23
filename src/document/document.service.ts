import { Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateDocumentDto, UpdateDocumentDto } from './dto/document.dto';
import * as fs from 'fs';
import * as path from 'path';
import { createReadStream } from 'fs';
import { join } from 'path';
import { stat } from 'fs/promises';

@Injectable()
export class DocumentService {
  constructor(private prisma: DatabaseService) {}

  private readonly uploadDirectory = path.join(process.cwd(), 'uploads');

  private ensureUploadDirectoryExists(caseId: string) {
    const caseDirectory = path.join(this.uploadDirectory, 'documents', caseId);
    if (!fs.existsSync(caseDirectory)) {
      fs.mkdirSync(caseDirectory, { recursive: true });
    }
    return caseDirectory;
  }

  private async saveFileToDisk(caseId: string, file: Express.Multer.File) {
    const caseDirectory = this.ensureUploadDirectoryExists(caseId);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = `${uniqueSuffix}-${file.originalname}`;
    const filePath = path.join(caseDirectory, filename);

    await fs.promises.writeFile(filePath, file.buffer);
    return {
      filename, // Just the filename without path
      filePath: path.join('documents', caseId, filename), // relative path for DB
    };
  }

  private async deleteFileFromDisk(filePath: string) {
    const fullPath = path.join(this.uploadDirectory, filePath);
    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
    }
  }

  async createDocument(dto: CreateDocumentDto, file: Express.Multer.File) {
    // Verify case exists
    const caseExists = await this.prisma.case.findUnique({
      where: { id: dto.case_id },
    });
    if (!caseExists) {
      throw new NotFoundException('Case not found');
    }

    // Save file to local storage
    const { filename, filePath } = await this.saveFileToDisk(dto.case_id, file);

    const document = await this.prisma.document.create({
      data: {
        case_id: dto.case_id,
        filename: filePath, // storing relative path
        file_type: file.mimetype,
      },
      include: {
        case: true,
      },
    });

    return {
      message: 'Document created successfully',
      data: document,
    };
  }

  async findAllDocuments() {
    return this.prisma.document.findMany({
      include: {
        case: true,
      },
    });
  }

  async findDocumentsByCaseId(caseId: string) {
    return this.prisma.document.findMany({
      where: { case_id: caseId },
      include: {
        case: true,
      },
    });
  }

  async findDocumentById(id: string) {
    const document = await this.prisma.document.findUnique({
      where: { id },
      include: {
        case: true,
      },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return document;
  }

  async updateDocument(
    id: string,
    dto: UpdateDocumentDto,
    file?: Express.Multer.File,
  ) {
    const existingDoc = await this.prisma.document.findUnique({
      where: { id },
    });

    if (!existingDoc) {
      throw new NotFoundException('Document not found');
    }

    let updateData: any = {
      filename: dto.filename,
      file_type: dto.file_type,
    };

    // If new file is provided, save it and update the references
    if (file) {
      // First delete the old file from disk if it exists
      if (existingDoc.filename) {
        await this.deleteFileFromDisk(existingDoc.filename);
      }

      // Save new file
      const { filename, filePath } = await this.saveFileToDisk(
        existingDoc.case_id,
        file,
      );
      updateData = {
        filename: filePath,
        file_type: file.mimetype,
      };
    }

    const updatedDoc = await this.prisma.document.update({
      where: { id },
      data: updateData,
    });

    return {
      message: 'Document updated successfully',
      data: updatedDoc,
    };
  }

  async deleteDocument(id: string) {
    const document = await this.prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // Delete file from disk first if it exists
    if (document.filename) {
      await this.deleteFileFromDisk(document.filename);
    }

    await this.prisma.document.delete({
      where: { id },
    });

    return {
      message: 'Document deleted successfully',
    };
  }

  async getDocumentFile(id: string) {
    const document = await this.prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // Construct the full path correctly
    const fullPath = path.join(this.uploadDirectory, document.filename);

    try {
      await stat(fullPath); // Check if file exists
    } catch {
      throw new NotFoundException('File not found on server');
    }

    // Extract original filename
    const originalFilename =
      document.filename.split('/').pop() ||
      document.filename.split('\\').pop() ||
      document.filename;

    const fileStream = createReadStream(fullPath);
    const stats = await stat(fullPath);

    return {
      fileStream,
      filename: originalFilename,
      contentType: 'application/pdf',
      size: stats.size,
    };
  }
}
