import path from "path";
import { exec } from "child_process";

/**
 * Builds a project by installing dependencies and running the build command.
 * @param id - The ID of the project.
 * @returns A promise that resolves when the build process is completed.
 */
export function buildProject(id: string) {
    return new Promise((resolve) => {
        const child = exec(`cd ${path.join(__dirname, `output/${id}`)} && npm install && npm run build`);

        child.stdout?.on('data', function(data) {
            console.log('stdout: ' + data);
        });
        child.stderr?.on('data', function(data) {
            console.log('stderr: ' + data);
        });

        child.on('close', function(code) {
           resolve("")
        });
    })
}