import { Module } from '@nestjs/common';
import { FileManagerController } from './file-manager.controller';
import { FileManagerService } from './file-manager.service';
import { MongooseModule } from '@nestjs/mongoose';
import { FilesSchema } from './schema/files.schema';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        { name: 'Files', schema: FilesSchema },
      ]
    ),
  ],
  controllers: [FileManagerController],
  providers: [FileManagerService]
})
export class FileManagerModule {}
