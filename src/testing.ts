import * as vscode from "vscode";
import logger from "./logger";
import paths from "./paths";

export async function setTestingCwd(editor?: vscode.TextEditor) {
    if (!editor) { return; }

    const testing = vscode.workspace.getConfiguration('python.testing');
    const template = testing.get<string>('cwdTemplate');
    if (!template || template.trim() === '') {
        logger.debug('python.testing.cwdTemplate not found.');
        return;
    }

    const root = paths.projectRoot(editor.document.uri.fsPath, { inWorkspace: true });
    const testsDir = root ? paths.cwd(template, root) : undefined;
    await testing.update('cwd', testsDir);
    logger.info(`Set python.testing.cwdTemplate to ${testsDir}`);
}
