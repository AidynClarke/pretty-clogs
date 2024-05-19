module.exports = {
  preset: 'ts-jest',
  collectCoverageFrom: ['src/**/*.ts', '!**/node_modules/**'],
  coverageReporters: ['text', 'text-summary', 'cobertura']
};
