import * as cp from 'child_process';
import * as vscode from "vscode";
import logger from './logger';

const exec = async (command: string, cwd?: string) => new Promise<string>((resolve, reject) => {
    cp.exec(command, { cwd }, (err, out) => {
        logger.trace('Executed shell command', command, err, out);
        return err ? reject(err) : resolve(out);
    });
});

export type VenvProvider = {
    name: string
    getPython: (sourceDir: string) => Promise<string>
};

export type ToolConfig = {
    name: string
    check: string
    python: string
};

export const toolProvider = async (config: ToolConfig): Promise<VenvProvider> => {
    try {
        await exec(config.check);
        logger.info(`Found provider: ${config.name}`);
        return {
            name: config.name,
            getPython: (sourceDir) => exec(config.python, sourceDir).then(py => py.trim())
        };
    } catch (err) {
        logger.info(`Unable to locate provider: ${config.name}`);
        return Promise.reject(err);
    }
};

const defaultProviders: ToolConfig[] = [
    {
        name: 'PDM',
        check: 'pdm --version',
        python: 'pdm info --python'
    },
    {
        name: 'Poetry',
        check: 'poetry --version',
        python: 'poetry env info -e'
    },
    {
        name: 'Pipenv',
        check: 'pipenv --version',
        python: 'pipenv --py'
    },
] as const;

const customProvider: () => VenvProvider | null = () => {
    const config = vscode.workspace.getConfiguration('python.venv.switcher');
    const tool = config.get<string>('customProvider');
    return tool ? {
        name: 'Custom',
        getPython: (sourceDir) => exec(tool, sourceDir).then(py => py.trim())
    } : null;
};

export const availableProviders = async (providers: ToolConfig[] = defaultProviders) => {
    const custom = customProvider();
    if (custom) { return [custom]; }

    const results = await Promise.allSettled(providers.map(toolProvider));
    return results.flatMap(result => result.status === 'fulfilled' ? [result.value] : []);
};
