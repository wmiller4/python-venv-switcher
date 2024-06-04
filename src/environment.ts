import * as vscode from 'vscode';
import { PythonExtension } from "@vscode/python-extension";
import fs, { PathLike } from "fs";
import path from "path";
import { VenvProvider } from "./providers";

export class EnvironmentLookup {
	private readonly environments = new Map<string, string | undefined>();
	private readonly providers: VenvProvider[];

	constructor(providers: VenvProvider[]) {
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

export function createLookup(providers: VenvProvider[]): EnvironmentLookup {
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

export class EnvironmentManager {
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
