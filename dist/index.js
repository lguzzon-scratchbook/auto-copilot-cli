var __importDefault =
  (this && this.__importDefault) ||
  ((mod) => (mod && mod.__esModule ? mod : { default: mod }))
Object.defineProperty(exports, '__esModule', { value: true })
const axios_1 = __importDefault(require('axios'))
const chalk_1 = __importDefault(require('chalk'))
const commander_1 = require('commander')
// @ts-ignore
const package_json_1 = require('../package.json')
const chat_1 = require('./commands/chat')
const code_chat_command_1 = require('./commands/code-chat-command')
const code_review_1 = require('./commands/code-review')
const generate_tests_1 = require('./commands/generate-tests')
const pre_commit_1 = require('./commands/pre-commit')
const refactor_1 = require('./commands/refactor')
const shell_1 = require('./commands/shell')
const sql_translator_1 = require('./commands/sql-translator')
const config_1 = require('./config/config')
const utils_1 = require('./utils')
const git_1 = require('./utils/git')
const helpers_1 = require('./utils/helpers')
const update_1 = require('./utils/update')
const program = new commander_1.Command()
  .name('auto-copilot-cli')
  .description('Auto Copilot CLI')
  .version(package_json_1.version)
  .alias('copilot')
const testCommand = {
  name: 'test',
  description: 'Generate test',
  args: '<file>',
  options: [
    {
      name: '-p, --prompt <prompt>',
      description: 'Prompt for AI',
      required: false
    },
    {
      name: '-o, --output <output>',
      description: 'Output file',
      required: false
    }
  ],
  action: async (file, options) => {
    const config = (0, config_1.getConfig)()
    const testCommand = new generate_tests_1.TestCommand(config)
    await testCommand.execute(file, options)
  }
}
const refactorCommand = {
  name: 'refactor',
  description: 'Refactor code',
  args: '<file>',
  options: [
    {
      name: '-p, --prompt <prompt>',
      description: 'Prompt for AI',
      required: false
    },
    {
      name: '-o, --output <output>',
      description: 'Output file',
      required: false
    }
  ],
  action: async (file, options) => {
    const config = (0, config_1.getConfig)()
    const refactorCommand = new refactor_1.RefactorCommand(config)
    await refactorCommand.execute(file, options)
  }
}
const sqlTranslatorCommand = {
  name: 'sql-translator',
  description: 'Translate natural language to SQL',
  args: '<query>',
  options: [
    {
      name: '-o, --output <output>',
      description: 'Output sql file',
      required: false
    },
    {
      name: '-s, --schema-path <schemaPath>',
      description: 'Path to schema file (sql, prisma, any format)',
      required: false
    }
  ],
  action: async (query, options) => {
    const config = (0, config_1.getConfig)()
    const sqlCommand = new sql_translator_1.SqlTranslatorCommand(config)
    await sqlCommand.execute(query, options)
  }
}
const chatCommand = {
  name: 'chat',
  description: 'Chat with AI',
  args: '',
  options: [
    {
      name: '-p, --prompt <prompt>',
      description: 'Prompt for AI',
      required: false
    }
  ],
  action: async (message, options) => {
    const config = (0, config_1.getConfig)()
    const chatCommand = new chat_1.ChatCommand(config)
    await chatCommand.execute(message, options)
  }
}
const shellCommand = {
  name: 'shell',
  description: 'Generate and execute a shell command',
  args: '<goal>',
  options: [],
  action: async (goal) => {
    const config = (0, config_1.getConfig)()
    const shellCommand = new shell_1.ShellCommand(config)
    await shellCommand.execute(goal)
  }
}
const configCommand = {
  name: 'config',
  description: 'Set config',
  args: '<key> <value>',
  options: [],
  action: async (key, value) => (0, config_1.setConfigByKey)(key, value)
}
const getConfigCommand = {
  name: 'get-config',
  description: 'Print config',
  args: '',
  options: [],
  action: async () => {
    const config = (0, config_1.getConfig)()
    console.table(
      Object.keys(config).map((key) => ({ key, value: config[key] }))
    )
  }
}
const preCommitCommand = {
  name: 'pre-commit',
  description: 'Pre commit hook',
  args: '',
  options: [
    {
      name: '-y, --yes',
      description: 'Skip confirmation',
      required: false
    }
  ],
  action: async (options) => {
    await (0, git_1.checkGitExists)()
    const config = (0, config_1.getConfig)()
    const preCommitCommand = new pre_commit_1.PreCommitCommand(config)
    await preCommitCommand.execute('', options)
  }
}
const codeReviewCommand = {
  name: 'code-review',
  description: 'Code review',
  args: '',
  options: [
    {
      name: '-y, --yes',
      description: 'Skip confirmation',
      required: false
    }
  ],
  action: async (options) => {
    await (0, git_1.checkGitExists)()
    const config = (0, config_1.getConfig)()
    const codeReviewCommand = new code_review_1.CodeReviewCommand(config)
    await codeReviewCommand.execute('', options)
  }
}
const codeChatCommand = {
  name: 'code-chat',
  description: 'Chat with AI about code',
  args: '<directory>',
  options: [
    {
      name: '-p, --prompt <prompt>',
      description: 'Prompt for AI',
      required: false
    }
  ],
  action: async (directory, options) => {
    const config = (0, config_1.getConfig)()
    const codeChatCommand = new code_chat_command_1.CodeChatCommand(config)
    await codeChatCommand.execute(directory, options)
  }
}
const commands = [
  testCommand,
  refactorCommand,
  chatCommand,
  shellCommand,
  configCommand,
  getConfigCommand,
  preCommitCommand,
  sqlTranslatorCommand,
  codeReviewCommand,
  codeChatCommand
]
async function main() {
  ;(0, helpers_1.checkNodeVersion)()
  await (0, update_1.checkUpdate)()
  commands.forEach(({ name, description, args, options, action }) => {
    const command = new commander_1.Command(name).description(description)
    if (args) {
      command.arguments(args)
    }
    options.forEach(({ name, description, required }) => {
      command.option(name, description, required)
    })
    const handler = async (...args) => {
      const config = (0, config_1.getConfig)()
      try {
        await action(...args)
      } catch (error) {
        if (axios_1.default.isAxiosError(error)) {
          if (error.response?.status === 401) {
            config.OPENAI_API_KEY = await (0, utils_1.askOpenAIKey)()
            ;(0, config_1.setConfig)(config)
            return handler(...args)
          } else if (error.response?.status === 429) {
            console.log(
              `${chalk_1.default.red('✘')} ${chalk_1.default.yellow(
                'You have reached your OpenAI API usage limit'
              )}`
            )
            return
          } else if (error.response?.status === 500) {
            console.log(
              `${chalk_1.default.red('✘')} ${chalk_1.default.yellow(
                'OpenAI API is down'
              )}`
            )
            return
          }
        }
        console.log(
          `${chalk_1.default.red('✘')} ${
            error.response?.data?.error?.message || error.message
          }`
        )
      }
    }
    command.action(handler)
    program.addCommand(command)
  })
  program.parse(process.argv)
}
main()
