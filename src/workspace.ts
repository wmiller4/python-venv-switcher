import * as vscode from 'vscode';

async function create(root: vscode.Uri) {
    const switcher = vscode.workspace.getConfiguration('python.venv.switcher');
    const createPreference = switcher.get<string>('createWorkspace');
    if (createPreference === 'never') return;
    const response = createPreference === 'always'
        ? 'Create Workspace'
        : await vscode.window.showInformationMessage(
            'Virtual environment found. To activate the environment, create or open a workspace.',
            'Create Workspace',
            'Do not show again',
        );
    if (response === 'Create Workspace') {
        vscode.workspace.updateWorkspaceFolders(0, 0, { uri: root });
    } else if (response === 'Do not show again') {
        switcher.update('createWorkspace', 'never', vscode.ConfigurationTarget.Global);
    }
}

export default {
    create
};
