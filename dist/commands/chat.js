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
Object.defineProperty(exports, '__esModule', { value: true })
exports.ChatCommand = void 0
const readline = __importStar(require('readline'))
const llm_1 = require('../llm')
const types_1 = require('../types')
const utils_1 = require('../utils')
class ChatCommand extends types_1.Command {
  async execute(message, options) {
    const { prompt } = options
    let input = ''
    while (input !== 'exit') {
      input = await (0, utils_1.inputAsk)()
      await llm_1.LLMChat.chat({
        config: this.config,
        input,
        prompt,
        handleLLMStart: () => {
          readline.cursorTo(process.stdout, 0)
          process.stdout.write('🤖 ')
        },
        handleLLMEnd: () => {
          process.stdout.write('\n')
        },
        handleLLMError: () => {
          process.stdout.write('\n')
        },
        handleLLMNewToken: (token) => {
          process.stdout.write(token)
        }
      })
    }
  }
}
exports.ChatCommand = ChatCommand
