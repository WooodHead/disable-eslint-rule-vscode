'use strict';
/** reference: vscode-hlint */
import * as path from 'path';
import * as fs from 'fs-extra';
import * as cp from 'child_process';
import ChildProcess = cp.ChildProcess;

import * as vscode from 'vscode';

export default class HaskellLintingProvider implements vscode.CodeActionProvider {

	private static commandId: string = 'javascript.runCodeAction';
	// private static reactCommandId: string = 'javascriptreact.runCodeAction';

	private command: vscode.Disposable;
	// private reactCommand: vscode.Disposable;
	private diagnosticCollection: vscode.DiagnosticCollection;

	public activate(subscriptions: vscode.Disposable[]) {
		this.command = vscode.commands.registerCommand(HaskellLintingProvider.commandId, this.runAddRullAction, this);
		// this.reactCommand = vscode.commands.registerCommand(HaskellLintingProvider.reactCommandId, this.runAddRullAction, this);

		subscriptions.push(this);
		this.diagnosticCollection = vscode.languages.createDiagnosticCollection();
	}

	public dispose(): void {
		this.diagnosticCollection.clear();
		this.diagnosticCollection.dispose();
		this.command.dispose();
	}

	public provideCodeActions(document: vscode.TextDocument, range: vscode.Range, context: vscode.CodeActionContext, token: vscode.CancellationToken): vscode.Command[] {
		let diagnostic: vscode.Diagnostic = context.diagnostics[0];

		if (diagnostic.source === 'eslint') {
			return [{
				title: `Disable eslint rule (${diagnostic.code})`,
				command: HaskellLintingProvider.commandId,
				arguments: [document, diagnostic]
			}];
		} else {
			return null;
		}
	}

	private runAddRullAction(document: vscode.TextDocument, diagnostic: vscode.Diagnostic): any {
		const ruleID = diagnostic.code;

		let folders = vscode.workspace.workspaceFolders;
		if (!folders) {
			vscode.window.showErrorMessage('Need a opened workspace folder.');
			return;
		}
		const configFilePaths = [];
		let hasConfigFolders = folders.filter(folder => {
			// let configFiles = ['.eslintrc', '.eslintrc.json', '.eslintrc.js', '.eslintrc.yaml', '.eslintrc.yml'];
			let configFiles = ['.eslintrc', '.eslintrc.json'];
			for (let configFile of configFiles) {
				const filePath = path.join(folder.uri.fsPath, configFile)
				if (fs.existsSync(filePath)) {
					configFilePaths.push(filePath)
					return true;
				}
			}
			return false;
		});

		if (configFilePaths.length > 0) {
			const filePath = configFilePaths[0];
			const eslintFile = fs.readJsonSync(filePath)
			if (eslintFile.rules) {
				delete eslintFile.rules[ruleID];
				eslintFile.rules[ruleID] = 0;
			}
			fs.writeJson(filePath, eslintFile, { spaces: 4 })
		}
	}
}
