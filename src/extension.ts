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
	envManager.setEnvironment(vscode.window.activeTextEditor, true);

	const setEnvCommand = vscode.commands.registerCommand('python-venv-switcher.setEnvironment', () => {
		envManager.setEnvironment(vscode.window.activeTextEditor, true);
	});

	const resetLookupCommand = vscode.commands.registerCommand('python-venv-switcher.resetLookup', async () => {
		envManager.lookup = new EnvironmentLookup(await availableProviders());
		envManager.setEnvironment(vscode.window.activeTextEditor, true);
	});

	const configHandler = vscode.workspace.onDidChangeConfiguration(async e => {
		logger.debug('Configuration changed.');
		if (!e.affectsConfiguration('python.venv.switcher.customProvider')) { return; }
		logger.info('Reloading environment lookup due to configuration change.');
		envManager.lookup = new EnvironmentLookup(await availableProviders());
		envManager.setEnvironment(vscode.window.activeTextEditor, true);
	});

	const editorHandler = vscode.window.onDidChangeActiveTextEditor(editor => {
		envManager.setEnvironment(editor);
	});

	context.subscriptions.push(setEnvCommand, resetLookupCommand, configHandler, editorHandler);
	logger.debug('Activated python-venv-switcher.');
}

export function deactivate() {
	logger.debug('Deactivated python-venv-switcher.');
}
