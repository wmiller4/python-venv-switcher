# Python Venv Switcher

*Automatic virtual environment switching for Python monorepos.*

Venv Switcher automatically finds and activates the correct Python virtual environment in VS Code for the current file.

## Features

:white_check_mark: Automatically detects virtual environments managed by:

* [PDM](https://pdm-project.org/)
* [Poetry](https://python-poetry.org)
* [Pipenv](https://pipenv.pypa.io/)
* And more, with [custom providers](#custom-provider)

:mag_right: Locates virtual environments outside (and inside) of the VS Code workspace.<br />
:arrows_counterclockwise: Handles [multiple environments](#activate-python-environment) per file.<br />
:test_tube: Updates the [working directory](#cwd-template) used for test discovery based on the active file's Python project.

## Settings

### Custom Provider

Setting key: `python.venv.switcher.customProvider`

A command that returns the full path to the virtual environment's Python executable.
If set, overrides the default environment resolution logic.

For example, use `uv python find` to resolve an environment managed by uv.

### CWD Template

Setting key: `python.testing.cwdTemplate`
  
If set, update the `python.testing.cwd` setting used by the Python extension to discover tests based on the active project.
Use `${projectRoot}` as a placeholder for the root directory of the active project.

For example, use `${projectRoot}` to locate tests in a tests directory:

```
project1/
    project1/
        __init__.py
        code.py
    tests/
        __init__.py
        test_code.py
    pyproject.toml
```

## Commands

### Activate Python Environment

Manually trigger the environment resolution for the current file.
Run this command if the environment has changed, such as after running `poetry env use`.

### Reset Venv Switcher Cache

Re-check for supported virtual environment providers and forget previously resolved environments.
Run this command after installing a supported environment provider, such as Poetry.
(Providers are checked when the extension is first activated, and when the Custom Provider setting is modified.)
