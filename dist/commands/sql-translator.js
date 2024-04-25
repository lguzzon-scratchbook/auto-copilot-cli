var __importDefault =
  (this && this.__importDefault) ||
  ((mod) => (mod && mod.__esModule ? mod : { default: mod }))
Object.defineProperty(exports, '__esModule', { value: true })
exports.SqlTranslatorCommand = void 0
const child_process_1 = require('child_process')
const fs_1 = __importDefault(require('fs'))
const chalk_1 = __importDefault(require('chalk'))
const ora_1 = __importDefault(require('ora'))
const llm_1 = require('../llm')
const types_1 = require('../types')
const utils_1 = require('../utils')
class SqlTranslatorCommand extends types_1.Command {
  async execute(query, { output, schemaPath }) {
    if (schemaPath && !fs_1.default.existsSync(schemaPath)) {
      console.error(
        `${chalk_1.default.red('✘')} no such file or directory: ${schemaPath}`
      )
      return
    }
    output = output || 'output.sql'
    const questionOpenCode = await (0, utils_1.askOpenEditor)()
    if (questionOpenCode) {
      ;(0, child_process_1.exec)(`${this.config.EDITOR || 'code'} ${output}`)
    }
    const spinner = (0, ora_1.default)('Translating')
    const schema = schemaPath
      ? fs_1.default.readFileSync(schemaPath, 'utf-8')
      : ''
    const handleLLMStart = () => spinner.start()
    const handleLLMEnd = () => spinner.succeed('Successfully translated')
    const handleLLMError = () => spinner.fail()
    await llm_1.LLMCode.translateSql({
      config: this.config,
      content: schema,
      prompt: query,
      output,
      handleLLMStart,
      handleLLMEnd,
      handleLLMError
    })
    const answer = await (0, utils_1.askRetryRefactor)()
    if (answer) {
      const input = await (0, utils_1.inputRefactor)()
      await this.execute(input, {
        schemaPath,
        output
      })
    }
  }
}
exports.SqlTranslatorCommand = SqlTranslatorCommand
