import * as mongoose from 'mongoose';

export const FilesSchema = new mongoose.Schema({
    file_name: String,
    original_name: String,
    path: String,
    mime_type: String,
    size: Number,
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now, select: false }
} ,{ collection: 'files' });