var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? (o, m, k, k2) => {
        if (k2 === undefined) k2 = k
        var desc = Object.getOwnPropertyDescriptor(m, k)
        if (
          !desc ||
          ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: () => m[k]
          }
        }
        Object.defineProperty(o, k2, desc)
      }
    : (o, m, k, k2) => {
        if (k2 === undefined) k2 = k
        o[k2] = m[k]
      })
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? (o, v) => {
        Object.defineProperty(o, 'default', { enumerable: true, value: v })
      }
    : (o, v) => {
        o['default'] = v
      })
var __importStar =
  (this && this.__importStar) ||
  ((mod) => {
    if (mod && mod.__esModule) return mod
    var result = {}
    if (mod != null)
      for (var k in mod)
        if (k !== 'default' && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k)
    __setModuleDefault(result, mod)
    return result
  })
var __importDefault =
  (this && this.__importDefault) ||
  ((mod) => (mod && mod.__esModule ? mod : { default: mod }))
Object.defineProperty(exports, '__esModule', { value: true })
exports.LLMCodeChat =
  exports.LLMCodeReview =
  exports.LLMPreCommit =
  exports.LLMChat =
  exports.LLMCode =
  exports.LLMGenerateShell =
  exports.LLMCommand =
    void 0
const fs_1 = __importDefault(require('fs'))
const os = __importStar(require('os'))
const path_1 = __importDefault(require('path'))
const ai_validator_1 = require('ai-validator')
const directory_1 = require('langchain/document_loaders/fs/directory')
const text_1 = require('langchain/document_loaders/fs/text')
const openai_1 = require('langchain/embeddings/openai')
const openai_2 = require('langchain/llms/openai')
const prompts_1 = require('langchain/prompts')
const text_splitter_1 = require('langchain/text_splitter')
const hnswlib_1 = require('langchain/vectorstores/hnswlib')
const ora_1 = __importDefault(require('ora'))
const process = __importStar(require('process'))
const zod_1 = require('zod')
const utils_1 = require('../utils')
const error_1 = require('../utils/error')
const helpers_1 = require('../utils/helpers')
const language_extensions_1 = require('../utils/language-extensions')
class LLMCommand {
  constructor(config, maxTokens, streaming, temperature = 0) {
    this.config = config
    this.llm = new openai_2.OpenAI(
      {
        modelName: config.MODEL,
        maxTokens,
        temperature,
        openAIApiKey: config.OPENAI_API_KEY,
        streaming
      },
      {
        basePath: config.OPEN_AI_BASE_URL
      }
    )
  }
}
exports.LLMCommand = LLMCommand
class LLMGenerateShell extends LLMCommand {
  constructor(config) {
    super(config, 1024, false)
  }
  static async generateShell(config, prompt) {
    return new LLMGenerateShell(config).generateShell(prompt)
  }
  async generateShell(prompt) {
    const packageManager =
      this.config.PACKAGE_MANAGER || (0, helpers_1.getPackageManagerByOs)()
    const schema = zod_1.z.object({
      shellScript: zod_1.z.string().describe(`shell script with comments`),
      isDangerous: zod_1.z
        .boolean()
        .describe(
          `if the shell is very dangerous, it will be marked as dangerous`
        ),
      description: zod_1.z.string().describe(`short description`)
    })
    const validator = ai_validator_1.AiValidator.input`
Goal: Write the best shell script based on the prompt: \`${prompt}\`

Constraints for the shell script:
- should be compatible with the ${os.platform()}.
- Should work without user intervention and should not require keyboard input.
- Every step should be printed to the console so that the user can understand what is happening.
- Check the installed packages and install the missing packages if necessary.
- If you need to create a file use operator "Here Document" (<<) to create a multiline string:
\`\`\`
cat << EOF > file.txt
{{content}}
EOF
\`\`\`
- Use package manager ${packageManager}
 
Recommendations:
- Use best practices
- Use the best tools for the job
- Use the best practices for writing shell scripts

${schema}
The current time and date is ${new Date().toLocaleString()}
The current working directory is ${process.cwd()}
The current os platform is ${os.platform()}
`
    const response = await this.llm.call(validator.prompt())
    try {
      return validator.parse(response)
    } catch (error) {
      return (0, error_1.throwLLMParseError)()
    }
  }
}
exports.LLMGenerateShell = LLMGenerateShell
class LLMCode extends LLMCommand {
  constructor(config) {
    super(config, 2056, true)
  }
  static async refactor(params) {
    return new LLMCode(params.config).refactor(params)
  }
  static async generateTest(params) {
    return new LLMCode(params.config).generateTest(params)
  }
  static async translateSql(params) {
    return new LLMCode(params.config).translateSql(params)
  }
  async translateSql(params) {
    const promptTemplate = new prompts_1.PromptTemplate({
      template: `
Goal: Based on the following prompt translate the natural language to sql.
Constraints:
- The sql should be formatted according to the standard for that sql language.

Recommendations:
- Use the best practices for writing sql.

Output format:
- Should be only sql, otherwise the answer will be rejected.


The prompt: {prompt}
The schema: {schema}
      `,
      inputVariables: ['output', 'prompt', 'schema']
    })
    const writeStream = fs_1.default.createWriteStream(params.output)
    const input = await promptTemplate.format({
      prompt: params.prompt,
      output: params.output,
      schema: params.content.trim()
    })
    await this.llm.call(input, undefined, [
      {
        handleLLMStart: params.handleLLMStart,
        handleLLMNewToken(token) {
          writeStream.write(token)
        },
        handleLLMEnd() {
          params.handleLLMEnd()
          writeStream.end()
        },
        handleLLMError(e) {
          params.handleLLMError(e)
          writeStream.end()
        }
      }
    ])
  }
  async generateTest({
    content,
    output,
    prompt,
    handleLLMStart,
    handleLLMEnd,
    handleLLMError
  }) {
    const promptTemplate = new prompts_1.PromptTemplate({
      template: `
Goal: Generate tests for the following code as much as possible.
Constraints:
- The code should be formatted according to the standard for that programming language.

Recommendations:
- Use the best testing framework for the programming language.

Output format:
- Should be only tests code, otherwise the answer will be rejected.


${prompt ? `Prompt for generating tests: \`\`\`${prompt}\`\`\`` : ''}
The content: {content}
      `,
      inputVariables: ['content', 'date', 'output']
    })
    const input = await promptTemplate.format({
      content,
      date: new Date().toISOString(),
      prompt,
      output
    })
    const writeStream = fs_1.default.createWriteStream(output)
    await this.llm.call(input, undefined, [
      {
        handleLLMStart,
        handleLLMNewToken(token) {
          writeStream.write(token)
        },
        handleLLMEnd() {
          handleLLMEnd()
          writeStream.end()
        },
        handleLLMError(e) {
          handleLLMError(e)
          writeStream.end()
        }
      }
    ])
  }
  async refactor({
    content,
    output,
    prompt,
    handleLLMStart,
    handleLLMEnd,
    handleLLMError
  }) {
    const promptTemplate = new prompts_1.PromptTemplate({
      template: `Refactor and fix the following content
Constraints:
- If this is code in a programming language, it must be formatted according to the standard for that programming language and run without errors.

Recommendations:
- Use best practices for the content.

Answer format:
- Return only refactored valid content, otherwise the answer will be rejected. 

${prompt ? `Prompt for refactoring: \`\`\`${prompt}\`\`\`` : ''}
The content: {content}
      `,
      inputVariables: ['content', 'date']
    })
    const input = await promptTemplate.format({
      content,
      date: new Date().toISOString(),
      prompt
    })
    const writeStream = fs_1.default.createWriteStream(output)
    await this.llm.call(input, undefined, [
      {
        handleLLMStart,
        handleLLMNewToken(token) {
          writeStream.write(token)
        },
        handleLLMEnd() {
          handleLLMEnd()
          writeStream.end()
        },
        handleLLMError(e) {
          handleLLMError(e)
          writeStream.end()
        }
      }
    ])
  }
}
exports.LLMCode = LLMCode
class LLMChat extends LLMCommand {
  constructor(config) {
    super(config, 1024, false)
    this.llmChat = new openai_2.OpenAIChat({
      prefixMessages: LLMChat.messages,
      modelName: config.MODEL,
      maxTokens: 256,
      temperature: 0,
      openAIApiKey: config.OPENAI_API_KEY,
      streaming: true
    })
  }
  static async chat(params) {
    return new LLMChat(params.config).chat(params)
  }
  async chat({
    input,
    prompt,
    handleLLMNewToken,
    handleLLMStart,
    handleLLMEnd,
    handleLLMError
  }) {
    const messages = LLMChat.messages
    if (input === '') {
      LLMChat.messages = []
      handleLLMStart()
      handleLLMNewToken('Chat history cleared')
      return handleLLMEnd()
    }
    if (messages.length === 0) {
      messages.push({
        role: 'system',
        content:
          prompt ||
          'You are a helpful assistant that answers in language understandable to humans.'
      })
    }
    const answer = await this.llmChat.call(input, undefined, [
      {
        handleLLMNewToken,
        handleLLMStart,
        handleLLMEnd,
        handleLLMError
      }
    ])
    messages.push({
      role: 'user',
      content: input
    })
    messages.push({
      role: 'assistant',
      content: answer
    })
  }
}
exports.LLMChat = LLMChat
LLMChat.messages = []
class LLMPreCommit extends LLMCommand {
  constructor(config) {
    super(config, 256, false, 0.7)
  }
  static async preCommit(params) {
    return new LLMPreCommit(params.config).preCommit(params.diff)
  }
  async preCommit(diff) {
    const schemaWithMessages = zod_1.z.object({
      title: zod_1.z
        .string()
        .describe('The title of short description of the changes'),
      messages: zod_1.z
        .array(zod_1.z.string())
        .describe('paragraphs describing the changes')
    })
    const schemaWithOptionalMessages = zod_1.z.object({
      title: zod_1.z.string().describe('The title of the commit')
    })
    const schema =
      this.config.INCLUDE_COMMIT_DESCRIPTION === 'yes'
        ? schemaWithMessages
        : schemaWithOptionalMessages
    const validator = ai_validator_1.AiValidator.input`You are reviewing the git diff and writing a git commit.
Constraints:
- Use format Conventional Commits.

${schema}
The git diff: 
\`\`\`${diff}\`\`\`
      `
    const response = await this.llm.call(validator.prompt())
    try {
      return await validator.parse(response.replace(/\\n/g, '\n'))
    } catch (error) {
      return (0, error_1.throwLLMParseError)()
    }
  }
}
exports.LLMPreCommit = LLMPreCommit
class LLMCodeReview extends LLMCommand {
  constructor(config) {
    super(config, 256, true, 0)
  }
  static async codeReview(params) {
    return new LLMCodeReview(params.config).codeReview({
      content: params.content,
      filePath: params.filePath,
      handleLLMNewToken: params.handleLLMNewToken,
      handleLLMStart: params.handleLLMStart,
      handleLLMEnd: params.handleLLMEnd,
      handleLLMError: params.handleLLMError
    })
  }
  async codeReview(params) {
    const fullFilePath = path_1.default.resolve(process.cwd(), params.filePath)
    const promptTemplate = new prompts_1.PromptTemplate({
      template: `You are an automatic assistant who helps with Code Review.
The goal is to improve the quality of the code and ensure the effective operation of the application in terms of security, scalability, and ease of maintenance.
During the analysis, you should pay attention to the use of best programming practices, code optimization, security, and compliance with coding standards.

Constraints:
- Always specify where exactly in the code "In ${fullFilePath}:line:column" and what exactly "Need to fix like this".
- Do not suggest fixes that do not improve the code or fix errors.
- Be concise and accurate.

Answer only valid, otherwise the answer will be rejected.
\`\`\`
🤖 ${fullFilePath}:{{line}}:{{column}} 
💡 {{suggestion}}
\`\`\`,

\`\`\`{code}\`\`\``,
      inputVariables: ['code']
    })
    const codeWithLineNumbers = params.content
      .split('\n')
      .map((line, index) => `/*${index + 1}*/ ${line}`)
      .join('\n')
      .trim()
    const input = await promptTemplate.format({
      code: codeWithLineNumbers
    })
    const response = await this.llm.call(input, undefined, [
      {
        handleLLMNewToken: params.handleLLMNewToken,
        handleLLMStart: params.handleLLMStart,
        handleLLMEnd: params.handleLLMEnd,
        handleLLMError: params.handleLLMError
      }
    ])
    return response
  }
}
exports.LLMCodeReview = LLMCodeReview
class LLMCodeChat extends LLMCommand {
  constructor(config) {
    super(config, 1024, true)
  }
  static async chat({ config, directory, ...params }) {
    const llmCodeChat = new LLMCodeChat(config)
    await llmCodeChat.getOrCreateVectorStore(directory)
    return llmCodeChat.chat(params)
  }
  async chat(params) {
    const messages = [
      {
        role: 'system',
        content:
          params.prompt ||
          `You are given from the vector store the most relevant code that you can use to solve the user request. 
Try to answer user questions briefly and clearly.`
      }
    ]
    while (true) {
      const input = await (0, utils_1.inputAsk)()
      const relevantCode = await this.vectorStore
        .asRetriever(4)
        .getRelevantDocuments(input)
      if (relevantCode.length === 0) {
        console.log("🤖 Sorry, I don't found any code for your question.")
        return this.chat(params)
      }
      const llmChat = new openai_2.OpenAIChat({
        prefixMessages: messages.concat({
          role: 'user',
          content: relevantCode
            .map((doc) => doc.pageContent)
            .join('\n')
            .replace(/\n/g, ' ')
            .trim()
        }),
        modelName: this.config.MODEL,
        temperature: 0,
        openAIApiKey: this.config.OPENAI_API_KEY,
        streaming: true
      })
      await llmChat.call(input, undefined, [
        {
          handleLLMNewToken: params.handleLLMNewToken,
          handleLLMStart: params.handleLLMStart,
          handleLLMEnd: params.handleLLMEnd,
          handleLLMError: params.handleLLMError
        }
      ])
      relevantCode.forEach((doc) => {
        console.log(`📄 ${doc.metadata.source}:`)
      })
    }
  }
  async getOrCreateVectorStore(directory) {
    const vectorStorePath = path_1.default.resolve(directory, 'vector-store')
    if (fs_1.default.existsSync(vectorStorePath)) {
      const store = await hnswlib_1.HNSWLib.load(
        vectorStorePath,
        new openai_1.OpenAIEmbeddings({
          openAIApiKey: this.config.OPENAI_API_KEY
        })
      )
      const input = await (0, utils_1.customAsk)(
        `Found existing vector store. Do you want to use it? (y/n) `
      )
      if (input) {
        this.vectorStore = store
        return
      }
    }
    const loader = new directory_1.DirectoryLoader(
      directory,
      language_extensions_1.extensionsList.reduce((acc, ext) => {
        acc[ext] = (path) => new text_1.TextLoader(path)
        return acc
      }, {})
    )
    const rawDocs = await loader.load()
    const textSplitter = new text_splitter_1.RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 50
    })
    const docs = await textSplitter.splitDocuments(rawDocs)
    const cost = await (0, helpers_1.calculateCost)(
      this.config.MODEL,
      docs.map((doc) => doc.pageContent)
    )
    const input = await (0, utils_1.customAsk)(
      `🤖 Creating a vector store for ${
        rawDocs.length
      } documents will cost ~$${cost.toFixed(
        5
      )}. Do you want to continue? (y/n) `
    )
    if (!input) {
      console.log('🤖 Bye!')
      process.exit(0)
    }
    const spinner = (0, ora_1.default)('Loading vector store...').start()
    this.vectorStore = await hnswlib_1.HNSWLib.fromDocuments(
      docs,
      new openai_1.OpenAIEmbeddings({
        openAIApiKey: this.config.OPENAI_API_KEY
      })
    )
    await this.vectorStore.save(vectorStorePath)
    spinner.succeed(`Created vector store with ${rawDocs.length} documents`)
  }
}
exports.LLMCodeChat = LLMCodeChat
