# Python Venv Switcher

*Automatic virtual environment switching for Python monorepos.*

This extension automatically finds and activates the correct Python virtual environment in VS Code for the current file.
It requires no configuration and does not rely on folder structure conventions.

## Features

This extension supports virtual environments managed by:

* [PDM](https://pdm-project.org/)
* [Poetry](https://python-poetry.org)
* [Pipenv](https://pipenv.pypa.io/)

Since this extension queries the tool to locate the environment, environments can live outside of the VS Code workspace.

Multiple environments for a single file are supported.
Use your tool to switch environments (such as `poetry env use` for Poetry). Then run the `Activate Python Environment` command in VS Code to pick up the new environment.

## Requirements

This extension relies on the official [Python VS Code extension](https://marketplace.visualstudio.com/items?itemName=ms-python.python).

## Extension Settings

This extension does not expose any settings.

## Known Issues

You must reload this extension after installing a supported Python tool.
(Available tools are checked when the extension is first activated.)

If the environment for a given file has changed, the `Activate Python Environment` command must be run.

Manually created virtual environments are currently not supported.

## Release Notes

### 0.1.1

Add extension icon.

### 0.1.0

Initial release.
