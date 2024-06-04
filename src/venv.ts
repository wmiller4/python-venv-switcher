import * as cp from 'child_process';

const exec = async (command: string, cwd?: string) => new Promise<string>((resolve, reject) => {
	cp.exec(command, { cwd }, (err, out) => err ? reject(err) : resolve(out));
});

namespace Venv {
    export type Provider = {
        name: string
        isAvailable: () => Promise<void>
        getPython: (sourceDir: string) => Promise<string>
    };

    export type ToolConfig = {
        name: string
        check: string
        python: string
    };

    export const toolProvider = (config: ToolConfig): Provider => ({
        name: config.name,
        isAvailable: () => exec(config.check).then(_ => {}),
        getPython: (sourceDir) => exec(config.python, sourceDir).then(py => py.trim())
    });

    export const providers = [
        toolProvider({
            name: 'PDM',
            check: 'pdm --version',
            python: 'pdm info --python'
        }),
        toolProvider({
            name: 'Poetry',
            check: 'poetry --version',
            python: 'poetry env info -e'
        }),
        toolProvider({
            name: 'Pipenv',
            check: 'pipenv --version',
            python: 'pipenv --py'
        }),
    ] as const;
}

export = Venv;
