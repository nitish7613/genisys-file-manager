import { Document } from 'mongoose';

export interface Files extends Document {
    file_name: string,
    original_name: string,
    path: string,
    mime_type: string,
    size: number,
    created_at: Date,
    updated_at: Date
}