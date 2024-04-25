var __importDefault =
  (this && this.__importDefault) ||
  ((mod) => (mod && mod.__esModule ? mod : { default: mod }))
Object.defineProperty(exports, '__esModule', { value: true })
exports.askRetryCommit =
  exports.askCommit =
  exports.inputAsk =
  exports.customAsk =
  exports.inputTest =
  exports.askTest =
  exports.inputRefactor =
  exports.askRetryRefactor =
  exports.askOpenAIKey =
  exports.askGoal =
  exports.askOpenEditor =
  exports.askExecute =
    void 0
const chalk_1 = __importDefault(require('chalk'))
const inquirer_1 = __importDefault(require('inquirer'))
const askExecute = async () => {
  const { execute } = await inquirer_1.default.prompt([
    {
      type: 'list',
      name: 'execute',
      message: `🚀 Execute?`,
      choices: ['Yes', 'No']
    }
  ])
  return execute === 'Yes'
}
exports.askExecute = askExecute
const askOpenEditor = async () => {
  const { openEditor } = await inquirer_1.default.prompt([
    {
      type: 'list',
      name: 'openEditor',
      message: `💻 Open in editor?`,
      choices: ['Yes', 'No']
    }
  ])
  return openEditor === 'Yes'
}
exports.askOpenEditor = askOpenEditor
const askGoal = async () => {
  const { goal } = await inquirer_1.default.prompt([
    {
      type: 'input',
      name: 'goal',
      message: '🎯 Input your goal:'
    }
  ])
  return goal
}
exports.askGoal = askGoal
const askOpenAIKey = async () => {
  const { openAIKey } = await inquirer_1.default.prompt([
    {
      type: 'input',
      name: 'openAIKey',
      message:
        '🔑 Enter your OpenAI API key. You can get your API key from https://beta.openai.com/account/api-keys:'
    }
  ])
  return openAIKey
}
exports.askOpenAIKey = askOpenAIKey
const askRetryRefactor = async () => {
  const { refactor } = await inquirer_1.default.prompt([
    {
      type: 'list',
      name: 'refactor',
      message: `🔁 Retry refactor?`,
      choices: ['Yes', 'No']
    }
  ])
  return refactor === 'Yes'
}
exports.askRetryRefactor = askRetryRefactor
const inputRefactor = async () => {
  const { refactor } = await inquirer_1.default.prompt([
    {
      type: 'input',
      name: 'refactor',
      message: '🎯 Input your refactor plan:'
    }
  ])
  return refactor
}
exports.inputRefactor = inputRefactor
const askTest = async () => {
  const { test } = await inquirer_1.default.prompt([
    {
      type: 'list',
      name: 'test',
      message: `🔁 Retry generate tests?`,
      choices: ['Yes', 'No']
    }
  ])
  return test === 'Yes'
}
exports.askTest = askTest
const inputTest = async () => {
  const { input } = await inquirer_1.default.prompt([
    {
      type: 'input',
      name: 'input',
      message: '🎯 Input your test plan:'
    }
  ])
  return input
}
exports.inputTest = inputTest
const customAsk = async (message) => {
  const { ask } = await inquirer_1.default.prompt([
    {
      type: 'list',
      name: 'ask',
      message,
      choices: ['Yes', 'No']
    }
  ])
  return ask === 'Yes'
}
exports.customAsk = customAsk
const inputAsk = async () => {
  const { ask } = await inquirer_1.default.prompt([
    {
      type: 'input',
      name: 'ask',
      message: '👉'
    }
  ])
  return ask
}
exports.inputAsk = inputAsk
const askCommit = async (commit) => {
  const { ask } = await inquirer_1.default.prompt([
    {
      type: 'list',
      name: 'ask',
      message: `Do you want to commit with the following message?
${chalk_1.default.green(commit)}
      `,
      choices: ['Yes', 'No']
    }
  ])
  return ask === 'Yes'
}
exports.askCommit = askCommit
const askRetryCommit = async () => {
  const { ask } = await inquirer_1.default.prompt([
    {
      type: 'list',
      name: 'ask',
      message: `Do you want to retry generating commit message?`,
      choices: ['Yes', 'No']
    }
  ])
  return ask === 'Yes'
}
exports.askRetryCommit = askRetryCommit
