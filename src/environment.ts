import { PythonExtension } from "@vscode/python-extension";
import fs, { PathLike } from "fs";
import path from "path";
import * as vscode from 'vscode';
import logger from './logger';
import paths from "./paths";
import { VenvProvider } from "./providers";
import { setTestingCwd } from "./testing";
import workspace from "./workspace";

type PythonEnvironment = {
	providerName: string
	pythonPath: string
};

export class EnvironmentLookup {
	private readonly environments = new Map<string, PythonEnvironment | undefined>();
	private readonly providers: VenvProvider[];

	constructor(providers: VenvProvider[]) {
		this.providers = providers;
	}

	private async findPython(cwd: string): Promise<PythonEnvironment | undefined> {
		for (const provider of this.providers) {
			const python = await provider.getPython(cwd).catch(() => undefined);
			if (python && fs.existsSync(python)) {
				logger.debug(`Found ${provider.name} environment ${python} for ${cwd}`);
				return { providerName: provider.name, pythonPath: python };
			}
			logger.debug(`No ${provider.name} environment found for ${cwd}`);
		}
		return undefined;
	}

	async getPythonPath(
		sourceFile: PathLike,
		ignoreCache: boolean = false
	): Promise<PythonEnvironment | undefined> {
		const cwd = path.dirname(sourceFile.toString());
		if (!this.environments.has(cwd) || ignoreCache) {
			const python = await this.findPython(cwd);
			this.environments.set(cwd, python);
		}
		return this.environments.get(cwd);
	}
}

export class EnvironmentManager {
	private readonly pythonApi: PythonExtension;
	lookup: EnvironmentLookup;
	readonly workspaceRoots: Set<string> = new Set<string>();

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
			logger.info('No virtual environment found.');
			return;
		}
		if (this.activeEnvironment === targetEnvironment.pythonPath) {
			logger.debug('Target virtual environment is already active.');
			if (ignoreCache) {
				setTestingCwd(editor);
			}
			return;
		}
		if (vscode.workspace.getWorkspaceFolder(editor.document.uri)) {
			await this.pythonApi.environments.updateActiveEnvironmentPath(targetEnvironment.pythonPath);
			logger.info(`Activated ${targetEnvironment.providerName} environment ${targetEnvironment.pythonPath}`);
			await setTestingCwd(editor);
		} else {
			const root = paths.projectRoot(editor.document.uri.fsPath);
			if (root && (ignoreCache || !this.workspaceRoots.has(root))) {
				this.workspaceRoots.add(root);
				await workspace.create(vscode.Uri.file(root));
			}
		}
	}
}
