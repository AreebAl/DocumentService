import { Controller, HttpCode, HttpException, HttpStatus, Post, Res, UploadedFile, UploadedFiles, UseFilters, UseInterceptors } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { DocumentService } from './document.service';
import { DocumentResponseDto } from './dto/document-response.dto';
import { FileSizeLimitExceptionFilter } from 'src/exception/file-size.exception';

@Controller('sadc')
@UseFilters(FileSizeLimitExceptionFilter)
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post('document')
  @UseInterceptors(FileInterceptor('file', {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5 MB file size limit
    },
  }))
  @HttpCode(HttpStatus.OK)
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Res() res: Response): Promise<DocumentResponseDto | any> {
   try{
    if (!file) {
      throw new HttpException('File is missing', HttpStatus.BAD_REQUEST);
    }

    const documentResponse: DocumentResponseDto = await this.documentService.handleFileUpload(file);
    res.status(HttpStatus.OK).json(documentResponse);
    return documentResponse
    
   }catch(err){
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: err.message || 'An error occurred while processing the file',
    });
   }
  }

  @Post('documents')
  @UseInterceptors(FilesInterceptor('files', 4, {
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB file size limit
  }))
  @HttpCode(HttpStatus.OK)
  async uploadFiles(
    @UploadedFiles() files: Express.Multer.File[], @Res() res: Response
  ): Promise<DocumentResponseDto[] | any> {
   try{
    
      let documentResponse=await this.documentService.handleFileUploads(files);
      console.log(documentResponse)
      res.status(HttpStatus.OK).json(documentResponse);
      return documentResponse

   }catch(err){
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: err.message || 'An error occurred while processing the file',
    });
   }
  }

}
