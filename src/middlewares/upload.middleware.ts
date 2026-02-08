import multer from "multer"
export class UploadMiddleware {
    upload = (maxSize: number = 2) => {
        const storage = multer.memoryStorage();

        const limits = {
            fileSize: maxSize * 1024 * 1024, // Max size in MB
        };
        return multer({ storage, limits });
    }
}