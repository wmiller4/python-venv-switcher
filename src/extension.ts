import * as vscode from 'vscode';
import { PythonExtension } from '@vscode/python-extension';
import { defaultProviders } from './providers';
import { EnvironmentManager, createLookup } from './environment';

export async function activate(context: vscode.ExtensionContext) {
	const envManager = new EnvironmentManager(
		await PythonExtension.api(),
		createLookup([...defaultProviders])
	);
	envManager.setEnvironment(vscode.window.activeTextEditor);

	const command = vscode.commands.registerCommand('python-venv-switcher.setEnvironment', () => {
		envManager.setEnvironment(vscode.window.activeTextEditor, true);
	});

	const handler = vscode.window.onDidChangeActiveTextEditor(editor => {
		envManager.setEnvironment(editor);
	});

	context.subscriptions.push(command, handler);
	console.log('Activated python-venv-switcher.');
}

export function deactivate() {
	console.log('Deactivated python-venv-switcher.');
}
