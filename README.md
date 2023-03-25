# allday

allday is a TypeScript and grimoire-based script for automating a full day of Kingdom of Loathing Community Service looping. This includes farming, ascending into Community Service, completing the run, then farming some more.

# Development

```bash
yarn run build
```

Then you can automatically create symlinks to your built files by running

```bash
yarn run install-mafia
```

When you're developing you can have your files automatically rebuild by keeping

```bash
yarn run dev
```

running in the background. If you've already built symlinks, your up-to-date script can be run instantly by entering `allday` into the KoLmafia CLI.
