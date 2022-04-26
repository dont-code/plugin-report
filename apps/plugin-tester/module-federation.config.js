module.exports = {
  name: 'plugin-tester',
  exposes: {
    './Module': 'apps/plugin-tester/src/app/remote-entry/entry.module.ts',
  },
};
