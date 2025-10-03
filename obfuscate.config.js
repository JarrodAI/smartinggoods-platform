// Code Obfuscation Configuration
module.exports = {
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 1,
  numbersToExpressions: true,
  simplify: true,
  stringArrayShuffle: true,
  splitStrings: true,
  stringArrayThreshold: 1,
  rotateStringArray: true,
  stringArray: true,
  stringArrayEncoding: ['base64'],
  unicodeEscapeSequence: false,
  identifierNamesGenerator: 'hexadecimal',
  renameGlobals: false,
  selfDefending: true,
  debugProtection: true,
  debugProtectionInterval: true,
  disableConsoleOutput: true
}