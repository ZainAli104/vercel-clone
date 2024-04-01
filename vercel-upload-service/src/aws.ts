import fs from "fs";
import { S3 } from "aws-sdk";
import * as dotenv from 'dotenv';

dotenv.config();

const s3 = new S3({
    accessKeyId: process.env.CF_KEY_ID,
    secretAccessKey: process.env.CF_SECRET_KEY,
    endpoint: process.env.CF_ENDPOINT_URL
});

/**
 * Uploads a file to an AWS S3 bucket.
 * @param fileName - The name of the file in the S3 bucket.
 * @param localFilePath - The local file path of the file to be uploaded.
 */
export const uploadFile = async (fileName: string, localFilePath: string) => {
    const fileContent = fs.readFileSync(localFilePath);
    const response = await s3.upload({
        Body: fileContent,
        Bucket: "vercel-clone",
        Key: fileName,
    }).promise();
    console.log(response);
}