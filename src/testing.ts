import * as vscode from "vscode";
import path from "path";
import fs from "fs";
import logger from "./logger";

function projectRoot(filePath: string): string | undefined {
    if (!vscode.workspace.getWorkspaceFolder(vscode.Uri.file(filePath))) {
        return undefined;
    }
    if (fs.existsSync(path.resolve(filePath, 'pyproject.toml'))) {
        return filePath;
    }
    if (fs.existsSync(path.resolve(filePath, 'Pipfile'))) {
        return filePath;
    }
    return projectRoot(path.resolve(filePath, '..'));
}

function cwd(template: string, projectRoot: string): string | undefined {
    const result = template.replaceAll('${projectRoot}', projectRoot);
    if (!fs.existsSync(result)) {
        logger.info(`Test directory ${result} not found`);
        return undefined;
    }
    return result;
}

export async function setTestingCwd(editor?: vscode.TextEditor) {
    if (!editor) { return; }

    const testing = vscode.workspace.getConfiguration('python.testing');
    const template = testing.get<string>('cwdTemplate');
    if (!template || template.trim() === '') {
        logger.debug('python.testing.cwdTemplate not found.');
        return;
    }

    const root = projectRoot(editor.document.uri.fsPath);
    const testsDir = root ? cwd(template, root) : undefined;
    await testing.update('cwd', testsDir);
    logger.info(`Set python.testing.cwdTemplate to ${testsDir}`);
}
