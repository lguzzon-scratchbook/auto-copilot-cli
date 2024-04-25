import { randomUUID } from 'crypto'
import fs from 'fs'
import os from 'os'
import path from 'path'
import chalk from 'chalk'
import { LLMGenerateShell } from '../llm'
import { Command } from '../types'
import { askExecute, askOpenEditor } from '../utils'
import { exFunction, executeCommand, executeShell } from '../utils/helpers'

export class ShellCommand extends Command {
  async execute(goal: string): Promise<void> {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'auto_copilot_cli'))
    const pathToSaveShellScript = path.join(tempDir, `./${randomUUID()}.sh`)
    const shellScript = await exFunction(
      LLMGenerateShell.generateShell.bind(null, this.config, goal),
      'Pending',
      'Done'
    )
    fs.writeFileSync(pathToSaveShellScript, shellScript.shellScript)
    console.log(
      `${shellScript.isDangerous ? chalk.red('✘') : chalk.green('✔')} Safe | ${
        shellScript.description
      }`
    )

    const questionOpenScript = await askOpenEditor()

    if (questionOpenScript) {
      const command = `${this.config.EDITOR || 'code'} ${pathToSaveShellScript}`
      await executeCommand(command)
    }
    const isApproved = await askExecute()
    if (isApproved) {
      const shellScriptModified = fs.readFileSync(
        pathToSaveShellScript,
        'utf-8'
      )
      await executeShell(shellScriptModified.toString())
    }
  }
}
