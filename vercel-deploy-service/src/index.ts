import { createClient, commandOptions } from "redis";

import { copyFinalDist, downloadS3Folder } from "./aws";
import { buildProject } from "./utils";

const subscriber = createClient();
subscriber.connect();

async function main() {
    while (1) {
        const res = await subscriber.brPop(
            commandOptions({ isolated: true }),
            'build-queue',
            0
        );

        if (!res) {
            continue;
        }

        await downloadS3Folder(`output/${res.element}`);
        await buildProject(res.element);
        copyFinalDist(res.element);
    }
}

main();
