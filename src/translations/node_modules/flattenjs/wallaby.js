module.exports = () => {
  return {
    files: [
      '!lib/**/*.spec.ts',
      'lib/**/*.ts'
    ],
    tests: [
      'lib/**/*.spec.ts'
    ],
    debug: true,
    testFramework: 'jasmine',
    env: {
      type: 'node'
    }
  };
};
