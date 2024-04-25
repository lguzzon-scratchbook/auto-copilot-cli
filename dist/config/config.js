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
exports.getConfig = exports.setConfigByKey = exports.setConfig = void 0
const fs = __importStar(require('fs'))
const path = __importStar(require('path'))
const configPath = path.join(__dirname, '../../config.json')
const defaultConfig = {
  OPENAI_API_KEY: 'sk-xxx',
  TEMPERATURE: 0,
  MODEL: 'gpt-3.5-turbo-0613',
  EDITOR: 'code',
  OPEN_AI_BASE_URL: 'https://api.openai.com/v1',
  INCLUDE_COMMIT_DESCRIPTION: 'no',
  PACKAGE_MANAGER: 'brew'
}
function setConfig(config) {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8')
}
exports.setConfig = setConfig
// Set a specific configuration property by key
function setConfigByKey(key, value) {
  const config = getConfig()
  config[key] = value
  setConfig(config)
}
exports.setConfigByKey = setConfigByKey
function getConfig() {
  if (!fs.existsSync(configPath)) {
    setConfig(defaultConfig)
  }
  const existingConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'))
  if (!existingConfig.OPENAI_API_KEY) {
    existingConfig.OPENAI_API_KEY = defaultConfig.OPENAI_API_KEY
    setConfig(existingConfig)
  }
  return { ...defaultConfig, ...existingConfig }
}
exports.getConfig = getConfig
