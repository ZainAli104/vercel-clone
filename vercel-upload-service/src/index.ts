const fs = require('fs').promises;
import path from "path";
import express from "express";
import cors from "cors";
import simpleGit from "simple-git";
import * as dotenv from 'dotenv';
import { createClient } from "redis";

import { generate } from "./utils";
import { getAllFiles } from "./file";
import { uploadFile } from "./aws";

dotenv.config();

const publisher = createClient();
publisher.connect();

const config = {
    port: 3000
};

const app = express();
app.use(cors())
app.use(express.json());

app.post("/deploy", async (req, res) => {
    const repoUrl = req.body.repoUrl;
    const id = generate();

    const cloneDir = path.join(__dirname, `output/${id}`);

    try {
        // Clone the repository
        await simpleGit().clone(repoUrl, cloneDir);

        // Remove the .git directory
        await fs.rm(path.join(cloneDir, '.git'), { recursive: true, force: true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Failed to clone repository or remove .git directory"
        });
    }

    const files = getAllFiles(cloneDir);

    for (const file of files) {
        const filePath = file.slice(__dirname.length + 1).replace(/\\/g, "/");
        await uploadFile(filePath, file);
    }

    await publisher.lPush("build-queue", id);

    res.json({
        id: id
    });
});

const startServer = async () => {
    try {
        app.listen(config.port, () => console.log(`Server has started on port http://localhost:${config.port}`));
    } catch (error) {
        console.log(error, "--------------Error start server------------");
    }
}

startServer();