var __importDefault =
  (this && this.__importDefault) ||
  ((mod) => (mod && mod.__esModule ? mod : { default: mod }))
Object.defineProperty(exports, '__esModule', { value: true })
exports.RefactorCommand = void 0
const child_process_1 = require('child_process')
const fs_1 = __importDefault(require('fs'))
const chalk_1 = __importDefault(require('chalk'))
const ora_1 = __importDefault(require('ora'))
const llm_1 = require('../llm')
const types_1 = require('../types')
const utils_1 = require('../utils')
class RefactorCommand extends types_1.Command {
  async execute(filePath, { prompt, output }) {
    if (!fs_1.default.existsSync(filePath)) {
      console.error(
        `${chalk_1.default.red('✘')} no such file or directory: ${filePath}`
      )
      return
    }
    const fileType = filePath.split('.').pop()
    if (!fileType) {
      console.error(
        `${chalk_1.default.red('✘')} invalid file type: ${filePath}`
      )
      return
    }
    output =
      output || filePath.replace(`.${fileType}`, `.refactored.${fileType}`)
    const questionOpenCode = await (0, utils_1.askOpenEditor)()
    if (questionOpenCode) {
      ;(0, child_process_1.exec)(`${this.config.EDITOR || 'code'} ${output}`)
    }
    const spinner = (0, ora_1.default)('Refactoring')
    const content = fs_1.default.readFileSync(filePath, 'utf-8')
    const handleLLMStart = () => spinner.start()
    const handleLLMEnd = () => spinner.succeed('Successfully refactored')
    const handleLLMError = () => spinner.fail()
    await llm_1.LLMCode.refactor({
      config: this.config,
      content,
      prompt: prompt,
      output: output,
      handleLLMStart,
      handleLLMEnd,
      handleLLMError
    })
    const answer = await (0, utils_1.askRetryRefactor)()
    if (answer) {
      const input = await (0, utils_1.inputRefactor)()
      await this.execute(output, {
        prompt: input,
        output
      })
    }
  }
}
exports.RefactorCommand = RefactorCommand
