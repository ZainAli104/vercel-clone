import fs from "fs";
import path from "path";
import { S3 } from "aws-sdk";
import * as dotenv from 'dotenv';

dotenv.config();

const s3 = new S3({
    accessKeyId: process.env.CF_KEY_ID,
    secretAccessKey: process.env.CF_SECRET_KEY,
    endpoint: process.env.CF_ENDPOINT_URL
});

/**
 * Downloads all files in a specified S3 folder.
 * @param prefix - The prefix of the S3 folder.
 */
export async function downloadS3Folder(prefix: string) {
    const allFiles = await s3.listObjectsV2({
        Bucket: "vercel-clone",
        Prefix: prefix
    }).promise();

    const allPromises = allFiles.Contents?.map(async ({ Key }) => {
        return new Promise(async (resolve) => {
            if (!Key) {
                resolve("");
                return;
            }
            const finalOutputPath = path.join(__dirname, Key);
            const dirName = path.dirname(finalOutputPath);
            if (!fs.existsSync(dirName)) {
                fs.mkdirSync(dirName, { recursive: true });
            }
            const outputFile = fs.createWriteStream(finalOutputPath);
            s3.getObject({
                Bucket: "vercel-clone",
                Key
            }).createReadStream().pipe(outputFile).on("finish", () => {
                resolve("");
            })
        })
    }) || []
    console.log("awaiting");

    await Promise.all(allPromises?.filter(x => x !== undefined));
}

export function copyFinalDist(id: string) {
    const folderPath = path.join(__dirname, `output/${id}/dist`);
    const allFiles = getAllFiles(folderPath);
    allFiles.forEach(file => {
        const filePath = `dist/${id}/` + file.slice(folderPath.length + 1).replace(/\\/g, "/");
        uploadFile(filePath, file)
    })
}

const getAllFiles = (folderPath: string) => {
    let response: string[] = [];

    const allFilesAndFolders = fs.readdirSync(folderPath);
    allFilesAndFolders.forEach(file => {
        const fullFilePath = path.join(folderPath, file);
        if (fs.statSync(fullFilePath).isDirectory()) {
            response = response.concat(getAllFiles(fullFilePath))
        } else {
            response.push(fullFilePath);
        }
    });
    return response;
}

const uploadFile = async (fileName: string, localFilePath: string) => {
    const fileContent = fs.readFileSync(localFilePath);
    const response = await s3.upload({
        Body: fileContent,
        Bucket: "vercel-clone",
        Key: fileName,
    }).promise();
    console.log(response);
}