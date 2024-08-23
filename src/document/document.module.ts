import { Module } from '@nestjs/common';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads',
      // limits: {
      //   fileSize: 5 * 1024 * 1024, // 5 MB
      // },
    }),
  ],
  controllers: [DocumentController],
  providers: [DocumentService],
})
export class DocumentModule {}
