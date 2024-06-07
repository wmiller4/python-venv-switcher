import { PythonExtension } from '@vscode/python-extension';
import * as vscode from 'vscode';
import { EnvironmentLookup, EnvironmentManager } from './environment';
import logger from './logger';
import { availableProviders } from './providers';

export async function activate(context: vscode.ExtensionContext) {
	const envManager = new EnvironmentManager(
		await PythonExtension.api(),
		new EnvironmentLookup(await availableProviders())
	);
	envManager.setEnvironment(vscode.window.activeTextEditor);

	const command = vscode.commands.registerCommand('python-venv-switcher.setEnvironment', () => {
		envManager.setEnvironment(vscode.window.activeTextEditor, true);
	});

	const handler = vscode.window.onDidChangeActiveTextEditor(editor => {
		envManager.setEnvironment(editor);
	});

	context.subscriptions.push(command, handler);
	logger.debug('Activated python-venv-switcher.');
}

export function deactivate() {
	logger.debug('Deactivated python-venv-switcher.');
}
