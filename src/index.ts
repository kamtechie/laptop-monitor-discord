import { Client, GatewayIntentBits, REST, Routes } from "discord.js";
import "dotenv/config";
import pingCommand from "./commands/ping";
import powerMonitor from "./monitor/powerMonitor";
import shutdownMonitor from "./monitor/shutdownMonitor";
import { sendAlert } from "./monitor/alertsManager";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages]
});

const commands = [pingCommand.data];

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN!);

async function registerCommands() {
  await rest.put(
    Routes.applicationCommands(process.env.CLIENT_ID!),
    { body: commands }
  );
  console.log("✓ Slash commands registered");
}

client.once("clientReady", async () => {
  console.log(`✓ Logged in as ${client.user?.tag}`);
  if (process.env.NODE_ENV === "production")
    await sendAlert(client, "🤖 Bot has started");

  // Start power monitoring
  powerMonitor.start().catch(console.error);

  // Listen for power events
  powerMonitor.on("power-change", async (data) => {
    const emoji = data.isCharging ? "🔌" : "🔋";
    const message =
      data.event === "plugged"
        ? `${emoji} Power plugged in`
        : `${emoji} Power unplugged`;

    await sendAlert(client, message);
  });

  // Start shutdown monitoring
  shutdownMonitor.start().catch(console.error);

  // Listen for shutdown events
  shutdownMonitor.on("shutdown-initiated", async () => {
    await sendAlert(client, "🛑 System shutdown initiated");
  });

  shutdownMonitor.on("shutdown-scheduled", async (data) => {
    await sendAlert(client, `⏰ Shutdown scheduled: ${data.reason}`);
  });
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = {
    ping: pingCommand
  }[interaction.commandName];

  if (command) {
    await command.execute(interaction);
  }
});

client.on("error", (error) => {
  console.error("Client error:", error);
});

process.on("SIGINT", () => {
  console.log("Shutting down...");
  powerMonitor.stop();
  shutdownMonitor.stop();
  client.destroy();
  process.exit(0);
});

registerCommands();
client.login(process.env.DISCORD_TOKEN);
