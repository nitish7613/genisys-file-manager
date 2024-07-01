import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Files } from './interface/files.interface';
const ObjectId = require('mongoose').Types.ObjectId;
const sharp = require('sharp');
const fsExtra = require('fs-extra');

@Injectable()
export class FileManagerService {
    constructor(
        @InjectModel('Files')
        private readonly filesCollection: Model<Files>,
    ) {}

    async insertFile(fileData) {
        const file = new this.filesCollection(
          {
            file_name: fileData.filename,
            original_name: fileData.originalname,
            path: fileData.path,
            mime_type: fileData.mimetype,
            size: fileData.size,
          }
        );
        return await file.save();
    }

    async getFileDetail(fileId) {
        let fileDetail = await this.filesCollection.findOne({ _id: new ObjectId(fileId) });
        return fileDetail;
    }

    async deleteFile(fileId) {
        let deleted = await this.filesCollection.deleteOne({ _id: new ObjectId(fileId) });
        return deleted;
    }

    async updateFile(fileId, fileData) {
        const dataToUpdate = {
            file_name: fileData.filename,
            original_name: fileData.originalname,
            path: fileData.path,
            mime_type: fileData.mimetype,
            size: fileData.size,
      }
        let updated = await this.filesCollection.findOneAndUpdate({ _id: new ObjectId(fileId) }, dataToUpdate, { new: true });
        
          return updated;
    }

    async resizeImage(mimeType, path, fileName) {
        try {
            let fileSplit = fileName.split('.')
            let resizedPath = process.env.FILE_UPLOAD_PATH + '/' + fileSplit[0] + '-compressed.' + fileSplit[1];
            let compressed;
            if(mimeType == "image/jpeg") {
                compressed = await sharp(path)
                .jpeg({ quality: 50 })
                .toFile(resizedPath);
            }
            else if(mimeType == "image/jpg") {
                compressed = await sharp(path)
                .jpg({ quality: 50 })
                .toFile(resizedPath);
            }
            else if(mimeType == "image/png") {
                compressed = await sharp(path)
                .png({ quality: 50 })
                .toFile(resizedPath);
            }
            await fsExtra.remove(path);
            return { resizedPath: resizedPath, size: compressed.size };
        } catch (error) {
          console.log(error);
        }
      }

    async getAllFiles(params) {
        const sort = { createdAt: 'desc' };
        const page = Number(params.page ? params.page : 1)
        const limit = Number(params.limit ? params.limit : 10)
        let allFiles = await this.filesCollection.find({}, null, { sort: sort, skip: Number((page - 1) * limit), limit: Number(limit) });
        return allFiles;
    }
}
