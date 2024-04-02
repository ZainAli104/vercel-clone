import express from "express";
import {S3} from "aws-sdk";
import * as dotenv from 'dotenv';

dotenv.config();

const s3 = new S3({
    accessKeyId: process.env.CF_KEY_ID,
    secretAccessKey: process.env.CF_SECRET_KEY,
    endpoint: process.env.CF_ENDPOINT_URL
});

const config = {
    port: 3001
};

const app = express();

// http://zh6ow.localhost:3001/index.html
app.get("/*", async (req, res) => {
    const host = req.hostname;

    const id = host.split(".")[0];
    const filePath = req.path;

    try {
        const contents = await s3.getObject({
            Bucket: "vercel-clone",
            Key: `dist/${id}${filePath}`
        }).promise();

        const type = filePath.endsWith("html") ? "text/html" : filePath.endsWith("css") ? "text/css" : "application/javascript"
        res.set("Content-Type", type);

        res.send(contents.Body);
    } catch (error) {
        res.status(404).send('File not found');
    }
});

const startServer = async () => {
    try {
        app.listen(config.port, () => console.log(`Server has started on port http://localhost:${config.port}`));
    } catch (error) {
        console.log(error, "--------------Error start server------------");
    }
}

startServer();