import { Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, Query, Req, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { extname } from 'path';
import { diskStorage } from 'multer';
import { FileManagerService } from './file-manager.service';
const fsExtra = require('fs-extra');

@ApiBearerAuth()
@ApiTags("File Manager")
@Controller('file-manager')
export class FileManagerController {
  constructor(private readonly fileManagerService: FileManagerService) { }

  @Post('/upload')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload file' })
  @ApiResponse({ status: 201, description: 'File uploaded sucessfully' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        }
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: (req: any, file: any, cb: any) => {
        const allowedExt = [
          '.jpg',
          '.jpeg',
          '.png'
        ];
        if (allowedExt.includes(extname(file.originalname).toLowerCase())) {
          // Allow storage of file
          cb(null, true);
        } else {
          // Reject file
          cb(
            new HttpException(
              {
                file: `Unsupported file type! Please upload file in ${allowedExt.join(', ')} only`,
              },
              HttpStatus.UNPROCESSABLE_ENTITY,
            ),
            false,
          );
        }
      },
      storage: diskStorage({
        destination: async (req, file, callback) => {
          const path = process.env.FILE_UPLOAD_PATH;
          await fsExtra.mkdirsSync(path);
          callback(null, path);
        },
        filename: (req, file, cb) => {
          // Generating a 32 random chars long string
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          //Calling the callback passing the random name generated with the original extension name
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async fileUploadForFileManager(@Res() res, @UploadedFile() file) {
    try {
      if (!file) {
        return res.status(HttpStatus.BAD_REQUEST)
          .json({
            success: false,
            message: "File is manadatory.",
            data: null
          })
      }
      let compressed = await this.fileManagerService.resizeImage(file.mimetype, file.path, file.filename);
      file.filename = compressed.resizedPath.split('/').pop()
      file.path = compressed.resizedPath;
      file.size = compressed.size;
      let saved = await this.fileManagerService.insertFile(file);
      return res.status(HttpStatus.CREATED)
        .json({
          success: true,
          message: "File uploaded successfully",
          data: saved
        })
    } catch (error) {
      console.log(`Error while uploading file, Error: ${error}`);
      await fsExtra.remove(file.path);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':file_id')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update files' })
  @ApiResponse({ status: 200, description: 'File updated sucessfully' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        }
      },
    },
  })
  @ApiParam({
    name: 'file_id',
    type: 'string'
  })
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: (req: any, file: any, cb: any) => {
        const allowedExt = [
          '.jpg',
          '.jpeg',
          '.png'
        ];
        if (allowedExt.includes(extname(file.originalname).toLowerCase())) {
          // Allow storage of file
          cb(null, true);
        } else {
          // Reject file
          cb(
            new HttpException(
              {
                file: `Unsupported file type! Please upload file in ${allowedExt.join(', ')} only`,
              },
              HttpStatus.UNPROCESSABLE_ENTITY,
            ),
            false,
          );
        }
      },
      storage: diskStorage({
        destination: async (req, file, callback) => {
          const path = process.env.FILE_UPLOAD_PATH;
          await fsExtra.mkdirsSync(path);
          callback(null, path);
        },
        filename: (req, file, cb) => {
          // Generating a 32 random chars long string
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          //Calling the callback passing the random name generated with the original extension name
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async updateFile(@Res() res, @UploadedFile() file, @Param('file_id') fileId) {
    try {
      if (!file) {
        return res.status(HttpStatus.BAD_REQUEST)
          .json({
            success: false,
            message: "File is manadatory.",
            data: null
          })
      }
      let fileDetail = await this.fileManagerService.getFileDetail(fileId);
      if (!fileDetail) {
        return res.status(HttpStatus.BAD_REQUEST)
          .json({
            success: false,
            message: "There is no matching file with this file ID.",
            data: null
          })
      }

      let compressed = await this.fileManagerService.resizeImage(file.mimetype, file.path, file.filename);
      file.filename = compressed.resizedPath.split('/').pop()
      file.path = compressed.resizedPath;
      file.size = compressed.size;

      let updated = await this.fileManagerService.updateFile(fileId, file);
      await fsExtra.remove(fileDetail.path);
      return res.status(HttpStatus.CREATED)
        .json({
          success: true,
          message: "File updated successfully",
          data: updated
        })
    } catch (error) {
      console.log(`Error while updating file, Error: ${error}`);
      await fsExtra.remove(file.path);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':file_id')
  @ApiParam({
    name: 'file_id',
    type: 'string'
  })
  @ApiOperation({ summary: 'Delete file' })
  @ApiResponse({ status: 200, description: 'File deleted sucessfully' })
  async deleteFile(@Res() res, @Param('file_id') fileId) {
    try {
      let fileDetail = await this.fileManagerService.getFileDetail(fileId);
      if (!fileDetail) {
        return res.status(HttpStatus.BAD_REQUEST)
          .json({
            success: false,
            message: "There is no matching file with this file ID.",
            data: null
          })
      }

      let deleted = await this.fileManagerService.deleteFile(fileId)
      return res.status(HttpStatus.OK)
        .json({
          success: true,
          message: "File removed successfully",
          data: deleted
        })
    }
    catch (error) {
      console.log(`Error while deleting file, Error: ${error}`);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  @ApiParam({
    name: 'page',
    type: 'number',
    required: false
  })
  @ApiParam({
    name: 'limit',
    type: 'number',
    required: false
  })
  @ApiOperation({ summary: 'Listing file with pagination' })
  async getMyList(@Res() res, @Query() params) {
      try {
          let allMyList = await this.fileManagerService.getAllFiles(params)


          return res.status(HttpStatus.OK)
            .json({
              success: true,
              message: "Files fetched successfully",
              data: allMyList
            })
      }
      catch (error) {
        console.log(`Error while getting all file, Error: ${error}`);
        throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
  }

  @Get(':file_id')
  @ApiParam({
    name: 'file_id',
    type: 'string'
  })
  @ApiOperation({ summary: 'Get file detail using file_id' })
  async getFile(@Res() res, @Param('file_id') fileId) {
    try {
      let fileDetail = await this.fileManagerService.getFileDetail(fileId);
      if (!fileDetail) {
        return res.status(HttpStatus.BAD_REQUEST)
          .json({
            success: false,
            message: "There is no matching file with this file ID.",
            data: null
          })
      }
      return res.status(HttpStatus.OK)
        .json({
          success: true,
          message: "File Detail fetched successfully",
          data: fileDetail
        })
    }
    catch (error) {
      console.log(`Error while getting file detail, Error: ${error}`);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('download/:file_id')
  @ApiParam({
    name: 'file_id',
    type: 'string'
  })
  @ApiOperation({ summary: 'Download file' })
  async downloadFile(@Res() res, @Param('file_id') fileId) {
    try {
      let fileDetail = await this.fileManagerService.getFileDetail(fileId);
      if (!fileDetail) {
        return res.status(HttpStatus.BAD_REQUEST)
          .json({
            success: false,
            message: "There is no matching file with this file ID.",
            data: null
          })
      }
      res.download(fileDetail.path);
    }
    catch (error) {
      console.log(`Error while downloading file, Error: ${error}`);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
