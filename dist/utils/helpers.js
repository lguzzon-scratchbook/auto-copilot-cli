var __importDefault =
  (this && this.__importDefault) ||
  ((mod) => (mod && mod.__esModule ? mod : { default: mod }))
Object.defineProperty(exports, '__esModule', { value: true })
exports.calculateCost =
  exports.getPackageManagerByOs =
  exports.checkNodeVersion =
  exports.executeShell =
  exports.executeCommand =
  exports.exFunction =
    void 0
const child_process_1 = require('child_process')
const lite_1 = require('@dqbd/tiktoken/lite')
const load_1 = require('@dqbd/tiktoken/load')
const model_to_encoding_json_1 = __importDefault(
  require('@dqbd/tiktoken/model_to_encoding.json')
)
const registry_json_1 = __importDefault(require('@dqbd/tiktoken/registry.json'))
const chalk_1 = __importDefault(require('chalk'))
const ora_1 = __importDefault(require('ora'))
const exFunction = async (fn, message, successMessage) => {
  const spinner = (0, ora_1.default)(message).start()
  try {
    const result = await fn()
    spinner.succeed(successMessage)
    return result
  } catch (error) {
    spinner.fail()
    throw error
  }
}
exports.exFunction = exFunction
function executeCommand(command) {
  return new Promise((resolve) => {
    const child = (0, child_process_1.exec)(command)
    child.stdout?.on('data', (data) => {
      process.stdout.write(data)
    })
    child.stderr?.on('data', (data) => {
      process.stderr.write(data)
    })
    child.on('close', (code) => {
      resolve(code)
    })
  })
}
exports.executeCommand = executeCommand
function executeShell(command) {
  return new Promise((resolve) => {
    const child = (0, child_process_1.spawn)(command, [], { shell: true })
    child.stdout.pipe(process.stdout)
    child.stderr.pipe(process.stderr)
    child.stdin.pipe(process.stdin)
    process.stdin.pipe(child.stdin)
    child.on('close', (code) => {
      resolve(code)
    })
  })
}
exports.executeShell = executeShell
function checkNodeVersion() {
  const nodeVersion = process.versions.node.split('.')[0]
  if (Number(nodeVersion) < 18) {
    console.log(
      `${chalk_1.default.red(
        '✘'
      )} Please update your node version to 18 or above\nCurrent version: ${nodeVersion}`
    )
    process.exit(1)
  }
}
exports.checkNodeVersion = checkNodeVersion
function getPackageManagerByOs() {
  const os = process.platform
  const packageManager = {
    linux: 'apt-get',
    darwin: 'brew',
    win32: 'choco'
  }
  return packageManager[os] || 'apt-get'
}
exports.getPackageManagerByOs = getPackageManagerByOs
async function calculateCost(modelName, docs) {
  const spinner = (0, ora_1.default)('Calculating cost').start()
  try {
    const { bpe_ranks, special_tokens, pat_str } = await (0, load_1.load)(
      registry_json_1.default[model_to_encoding_json_1.default[modelName]]
    )
    const encoder = new lite_1.Tiktoken(bpe_ranks, special_tokens, pat_str)
    const tokenCount = encoder.encode(JSON.stringify(docs)).length
    const cost = (tokenCount / 1000) * 0.0005
    encoder.free()
    return cost
  } finally {
    spinner.stop()
  }
}
exports.calculateCost = calculateCost
