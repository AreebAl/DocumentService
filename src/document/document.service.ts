// src/document/document.service.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';
import { DocumentResponseDto } from './dto/document-response.dto';
//import { FileSizeLimitExceptionFilter } from 'src/exception/file-size.exception';

@Injectable()
export class DocumentService {
  private readonly uploadPath = path.resolve(process.cwd(), 'uploads');
  private readonly tempPath = path.resolve(process.cwd(), 'temp'); // Temporary path for processing
  private readonly allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf','application/zip']; // Allowed file types
  private readonly maxFileSize = 5 * 1024 * 1024; // 5 MB
  constructor() {
    // Ensure the upload and temp directories exist
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
    if (!fs.existsSync(this.tempPath)) {
      fs.mkdirSync(this.tempPath, { recursive: true });
    }
  }

  async handleFileUpload(file: Express.Multer.File): Promise<DocumentResponseDto> {
   try{
    if (!file) {
      throw new HttpException('File is missing', HttpStatus.BAD_REQUEST);
    }

    //Validate file size
    if (file.size > this.maxFileSize) {
      // throw new HttpException('File size exceeds the maximum limit of 5 MB', HttpStatus.BAD_REQUEST);
      console.log('file size exceeds')
     // throw new FileSizeExceptionFilter();
    }

    // Validate file type
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new HttpException('Invalid file type', HttpStatus.BAD_REQUEST);
    }

    // Rename file to replace spaces with underscores
    const originalFilename = file.originalname.replace(/\s+/g, '_');
    const tempFilePath = path.join(this.tempPath, originalFilename);
    const finalFilePath = path.join(this.uploadPath, originalFilename);

    // Move the file to the temporary directory
    fs.renameSync(file.path, tempFilePath);

    if (file.mimetype === 'application/zip') {
      // Simply move the ZIP file to the final directory
      fs.renameSync(tempFilePath, finalFilePath);
    } else {
      // Process other file types with sharp
      await sharp(tempFilePath)
        .resize({ width: 800 }) // Adjust resize options as needed
        .toFile(finalFilePath); // Save compressed file to the final directory
    }
    // Remove the temporary file if it exists
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }

    // Construct the URL for accessing the file
    const url = `http://localhost:3000/api/sadc/document/${originalFilename}`;

    return {
      fileName: originalFilename,
      url,
    };
   }catch(err){
      console.log(err.message,"error in service while uploading file")
      throw new Error(err.message)
   }
  }

  async handleFileUploads(files: Express.Multer.File[]): Promise<DocumentResponseDto[]> {
    try{
      if (!files || files.length === 0) {
        throw new HttpException('No files uploaded', HttpStatus.BAD_REQUEST);
      }
  
      const documentResponses: DocumentResponseDto[] = [];
  
      for (const file of files) {
        // Validate file type
        if (!this.allowedMimeTypes.includes(file.mimetype)) {
          throw new HttpException('Invalid file type', HttpStatus.BAD_REQUEST);
        }
  
        //Validate file size
        if (file.size > this.maxFileSize) {
          // throw new HttpException('File size exceeds the maximum limit of 5 MB', HttpStatus.BAD_REQUEST);
        //  throw new FileSizeExceptionFilter();
        }
  
        // Rename file to replace spaces with underscores
        const originalFilename = file.originalname.replace(/\s+/g, '_');
        const tempFilePath = path.join(this.tempPath, originalFilename);
        const finalFilePath = path.join(this.uploadPath, originalFilename);
  
        // Move the file to the temporary directory
        fs.renameSync(file.path, tempFilePath);
  
        // Compress the file using sharp and save it to the final directory
        await sharp(tempFilePath)
          .resize({ width: 800 }) // Adjust resize options as needed
          .toFile(finalFilePath); // Save compressed file to the final directory
  
        // Remove the temporary file
        fs.unlinkSync(tempFilePath);
  
        // Construct the URL for accessing the file
        const url = `http://localhost:3000/api/sadc/documents/${originalFilename}`;
  
        documentResponses.push({
          fileName: originalFilename,
          url,
        });
      }
  
      return documentResponses;
    }
    catch(err){
      console.log(err.message,"error in service while uploading file")
      throw new Error(err.message)
    }
  }
}
