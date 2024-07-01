# Genisys File Manager

## Features

1. **Upload Image File**
   - Feature to upload image files with proper validation of file extensions (png, jpg, jpeg).
   - Handles all error scenarios. If there is any error during file upload, the uploaded file is deleted to prevent unnecessary space consumption.
   - Uses the Sharp library to compress images.
  
2. **Update Image File using File ID**
   - Users can upload a new file to update an existing file. The old file is replaced in the MongoDB database and the physical location.
   - Includes all validations for the upload file.
   - Uses the Sharp library to compress images.
   
3. **Delete Image File using File ID**
   - Provides a proper validation message if no file exists with the given file ID.
   - Permanently deletes the file from MongoDB and the physical location.
   
4. **List Files with Pagination**
   - Lists files with pagination (page number and number of records per page).
   - Default values: page = 1 and limit = 10.
   
5. **Get File Detail using File ID**
   - Fetches file metadata details from the MongoDB database.
   - Provides validation if the file does not exist with the given file ID.
   
6. **Download File using File ID**
   - Downloads the physical image file with the given file ID.
   - Provides validation if the file does not exist.

**Note**: All the above features are authorized using a static Bearer Auth token.

## Setup Instructions

1. **Setup Node.js**
   - Ensure Node.js version > 18 is installed on your local machine.

2. **Setup MongoDB**
   - Ensure MongoDB version > 4.4 is installed on your local machine.

3. **Clone the Repository**
   - Run `git clone https://github.com/nitish7613/genisys-file-manager.git`
   
4. **Navigate to Project Directory**
   - Run `cd genisys-file-manager`

5. **Install Dependencies**
   - Run `npm install --include=optional`
   
6. **Configure Environment Variables**
   - Edit the `.env` file at the root level and set `MONGO_URI` according to your MongoDB database URI.
   - Set `FILE_UPLOAD_PATH` in the `.env` file to the path where you want to store all locally uploaded files. Ensure the necessary permissions to store files are provided using `sudo chmod -R 777 <FILE_UPLOAD_PATH>`.

7. **Start the Server**
   - Run `npm start`

8. **Access API Documentation**
   - Once the server has started successfully, you can access the API documentation at `http://localhost:3000/documentation`.

9. **Authorization**
   - Each endpoint is protected with a static Bearer Token. The token value is `a9f8e6b3c5d4f2e8b1c3d9a7f6b8e5c4`, as specified in the `AUTH_TOKEN` in the `.env` file. Ensure to add this token in the Authorization header.

10. **Ready to Use**
    - You can now use any API as per your requirement.

Feel free to explore and utilize the features of the Genisys File Manager!
