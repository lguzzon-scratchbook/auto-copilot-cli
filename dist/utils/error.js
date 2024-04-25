Object.defineProperty(exports, '__esModule', { value: true })
exports.throwLLMParseError = exports.LLMError = void 0
class BaseError extends Error {
  constructor(message) {
    super(message)
  }
}
class LLMError extends BaseError {
  constructor(message) {
    super(message)
  }
}
exports.LLMError = LLMError
const throwLLMParseError = () => {
  throw new LLMError('Failed to parse the response from the LLM')
}
exports.throwLLMParseError = throwLLMParseError
