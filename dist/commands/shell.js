var __importDefault =
  (this && this.__importDefault) ||
  ((mod) => (mod && mod.__esModule ? mod : { default: mod }))
Object.defineProperty(exports, '__esModule', { value: true })
exports.ShellCommand = void 0
const crypto_1 = require('crypto')
const fs_1 = __importDefault(require('fs'))
const os_1 = __importDefault(require('os'))
const path_1 = __importDefault(require('path'))
const chalk_1 = __importDefault(require('chalk'))
const llm_1 = require('../llm')
const types_1 = require('../types')
const utils_1 = require('../utils')
const helpers_1 = require('../utils/helpers')
class ShellCommand extends types_1.Command {
  async execute(goal) {
    const tempDir = fs_1.default.mkdtempSync(
      path_1.default.join(os_1.default.tmpdir(), 'auto_copilot_cli')
    )
    const pathToSaveShellScript = path_1.default.join(
      tempDir,
      `./${(0, crypto_1.randomUUID)()}.sh`
    )
    const shellScript = await (0, helpers_1.exFunction)(
      llm_1.LLMGenerateShell.generateShell.bind(null, this.config, goal),
      'Pending',
      'Done'
    )
    fs_1.default.writeFileSync(pathToSaveShellScript, shellScript.shellScript)
    console.log(
      `${
        shellScript.isDangerous
          ? chalk_1.default.red('✘')
          : chalk_1.default.green('✔')
      } Safe | ${shellScript.description}`
    )
    const questionOpenScript = await (0, utils_1.askOpenEditor)()
    if (questionOpenScript) {
      const command = `${this.config.EDITOR || 'code'} ${pathToSaveShellScript}`
      await (0, helpers_1.executeCommand)(command)
    }
    const isApproved = await (0, utils_1.askExecute)()
    if (isApproved) {
      const shellScriptModified = fs_1.default.readFileSync(
        pathToSaveShellScript,
        'utf-8'
      )
      await (0, helpers_1.executeShell)(shellScriptModified.toString())
    }
  }
}
exports.ShellCommand = ShellCommand
