import { Client, ChannelType, TextChannel } from "discord.js";

let cachedChannel: TextChannel | null = null;

export async function getAlertsChannel(
  client: Client
): Promise<TextChannel | null> {
  const channelId = process.env.ALERT_CHANNEL_ID;

  if (!channelId) {
    console.warn("ALERT_CHANNEL_ID not set");
    return null;
  }

  // Return cached channel if still valid
  if (cachedChannel && cachedChannel.id === channelId) {
    return cachedChannel;
  }

  try {
    const channel = await client.channels.fetch(channelId);

    if (!channel || channel.type !== ChannelType.GuildText) {
      console.error(
        "Alerts channel is invalid or not a text channel:",
        channelId
      );
      return null;
    }

    cachedChannel = channel as TextChannel;
    return cachedChannel;
  } catch (error) {
    console.error("Failed to fetch alerts channel:", error);
    return null;
  }
}

export async function sendAlert(
  client: Client,
  message: string
): Promise<boolean> {
  const channel = await getAlertsChannel(client);

  if (!channel) {
    return false;
  }

  try {
    await channel.send(message);
    return true;
  } catch (error) {
    console.error("Failed to send alert:", error);
    return false;
  }
}
