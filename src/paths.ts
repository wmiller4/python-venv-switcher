import * as vscode from "vscode";
import fs from "fs";
import path from "path";
import logger from "./logger";

export type RootOptions = {
    inWorkspace: boolean
};

function projectRoot(filePath: string, options?: RootOptions): string | undefined {
    if (options?.inWorkspace && !vscode.workspace.getWorkspaceFolder(vscode.Uri.file(filePath))) {
        return undefined;
    }
    if (fs.existsSync(path.resolve(filePath, 'pyproject.toml'))) {
        return filePath;
    }
    if (fs.existsSync(path.resolve(filePath, 'Pipfile'))) {
        return filePath;
    }
    if (path.parse(filePath).root === filePath) {
        return undefined;
    }
    return projectRoot(path.resolve(filePath, '..'), options);
}

function cwd(template: string, projectRoot: string): string | undefined {
    const result = template.replaceAll('${projectRoot}', projectRoot);
    if (!fs.existsSync(result)) {
        logger.info(`Test directory ${result} not found`);
        return undefined;
    }
    return result;
}

export default {
    projectRoot,
    cwd
};
