'use strict';
import * as vscode from 'vscode';
import * as path from 'path';
import HaskellLintingProvider from './jsProvider';

export function activate(context: vscode.ExtensionContext) {
    const collection = vscode.languages.createDiagnosticCollection('test');
    if (vscode.window.activeTextEditor) {
        // updateDiagnostics(vscode.window.activeTextEditor.document, collection);
    }
    let linter = new HaskellLintingProvider();
    linter.activate(context.subscriptions);
    vscode.languages.registerCodeActionsProvider('javascriptreact', linter);
    vscode.languages.registerCodeActionsProvider('javascript', linter);
}


// this method is called when your extension is deactivated
export function deactivate() {
}