import * as vscode from 'vscode';
import path from 'path';
import { PythonExtension } from '@vscode/python-extension';
import fs, { PathLike } from 'fs';
import Venv from './venv';

class EnvironmentLookup {
	private readonly environments = new Map<string, string | undefined>();
	private readonly providers: Venv.Provider[];

	constructor(providers: Venv.Provider[]) {
		this.providers = providers;
	}

	private async findPython(cwd: string): Promise<string | undefined> {
		for (const provider of this.providers) {
			const python = await provider.getPython(cwd).catch(_ => undefined);
			if (python && fs.existsSync(python)) {
				console.log(`Found ${provider.name} environment ${python} for ${cwd}`);
				return python;
			}
		}
		console.log(`No environment found for ${cwd}`);
		return undefined;
	}

	async getPythonPath(sourceFile: PathLike, ignoreCache: boolean = false): Promise<string | undefined> {
		const cwd = path.dirname(sourceFile.toString());
		if (!this.environments.has(cwd) || ignoreCache) {
			const python = await this.findPython(cwd);
			this.environments.set(cwd, python);
		}
		return this.environments.get(cwd);
	}
}

function createLookup(providers: Venv.Provider[]): EnvironmentLookup {
	const filtered = providers.filter(async provider => {
		try {
			await provider.isAvailable();
			console.log(`Enabled ${provider.name}`);
			return true;
		} catch (_) {
			console.log(`Disabled ${provider.name}`);
			return false;
		}
	});
	return new EnvironmentLookup(filtered);
}

class EnvironmentManager {
	private readonly pythonApi: PythonExtension;
	private readonly lookup: EnvironmentLookup;

	constructor(pythonApi: PythonExtension, lookup: EnvironmentLookup) {
		this.pythonApi = pythonApi;
		this.lookup = lookup;
	}

	get activeEnvironment() {
		return this.pythonApi.environments.getActiveEnvironmentPath().path;
	}

	async setEnvironment(editor?: vscode.TextEditor, ignoreCache: boolean = false) {
		if (!editor || editor.document.languageId !== 'python') { return; }
		const targetEnvironment = await this.lookup.getPythonPath(editor.document.uri.fsPath, ignoreCache);
		if (!targetEnvironment) {
			console.log('No virtual environment found.');
			return;
		}
		if (this.activeEnvironment === targetEnvironment) {
			console.log('Target virtual environment is already active.');
			return;
		}
		this.pythonApi.environments.updateActiveEnvironmentPath(targetEnvironment);
		console.log(`Set environment to ${targetEnvironment}`);
	}
}

export async function activate(context: vscode.ExtensionContext) {
	const envManager = new EnvironmentManager(
		await PythonExtension.api(),
		createLookup([...Venv.providers])
	);
	envManager.setEnvironment(vscode.window.activeTextEditor);

	const command = vscode.commands.registerCommand('poetry-multiverse.setEnvironment', () => {
		envManager.setEnvironment(vscode.window.activeTextEditor, true);
	});

	const handler = vscode.window.onDidChangeActiveTextEditor(editor => {
		envManager.setEnvironment(editor);
	});

	context.subscriptions.push(command, handler);
	console.log('Activated poetry-multiverse.');
}

export function deactivate() {
	console.log('Deactivated poetry-multiverse.');
}
