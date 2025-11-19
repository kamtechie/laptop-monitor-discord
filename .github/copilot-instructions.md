# Project Context
You are assisting with a TypeScript Discord bot that runs on a home server (a laptop).
The bot monitors local system health (CPU, RAM, disk, uptime, service status, network checks)
and sends alerts or responds to slash commands in Discord.

# Technical Stack
- Node.js (ESM)
- TypeScript (strict)
- discord.js v14+ with full TypeScript support
- Slash command architecture
- dotenv for configuration

# Project Structure
src/
  index.ts              # bot entrypoint
  commands/             # modular slash commands
    ping.ts             # example command
  monitor/              # future monitoring modules
.env                    # DISCORD_TOKEN and CLIENT_ID

Commands use this structure:
export default {
  data: SlashCommandBuilder(),
  async execute(interaction) { ... }
}

# Coding Style Rules
- Always use ESM imports: `import ... from`.
- Avoid using `any`; maintain strict typing.
- Prefer async/await over promises.
- Keep functions small, modular, and reusable.
- Put monitoring logic in separate modules, not inside index.ts.
- Follow discord.js best practices for event handling and command routing.
- Use descriptive names, no abbreviations.
- Error-handle all Discord API interactions cleanly.

# Behavior for Copilot
- When writing new commands, always export `{ data, execute }`.
- When generating monitoring functions, keep them pure and return typed results.
- For periodic tasks, suggest an interval loop or scheduler in a dedicated module.
- Automatically generate simple logging or console output for diagnostics.
- Prefer built-in Node APIs for system metrics when possible.
- Generate code that runs efficiently on low-power hardware.

# Features to Support
- Slash commands: /stats, /uptime, /services, /pinghost
- Monitoring helpers: getCpuUsage, getMemoryUsage, getDiskUsage, getUptime
- Optional periodic alerts to a Discord channel
- Expandable modular architecture

# What to Avoid
- Do not hardcode tokens or IDs.
- Do not add heavy dependencies (Prometheus, Grafana, etc).
- Do not mix command logic and monitoring logic.
- Do not generate overly complex class-based designs.

# Goal
Produce clean, maintainable, strongly-typed TypeScript code that expands the
existing monitoring bot while staying lightweight and home-server friendly.
