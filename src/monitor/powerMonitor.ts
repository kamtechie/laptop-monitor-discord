import { promises as fs } from "fs";
import { EventEmitter } from "events";

export interface PowerState {
  isCharging: boolean;
  timestamp: Date;
}

export class PowerMonitor extends EventEmitter {
  private lastState: PowerState | null = null;
  private pollInterval: NodeJS.Timeout | null = null;
  private pollIntervalMs: number = 5000; // Check every 5 seconds

  async getCurrentPowerState(): Promise<PowerState> {
    try {
      // Try to read AC adapter status on Linux
      const acPath = "/sys/class/power_supply/AC/online";
      const acOnline = await fs
        .readFile(acPath, "utf-8")
        .then((content) => content.trim() === "1")
        .catch(() => null);

      if (acOnline !== null) {
        return { isCharging: acOnline, timestamp: new Date() };
      }

      // Fallback: check battery status
      const batPath = "/sys/class/power_supply/BAT0/status";
      const status = await fs
        .readFile(batPath, "utf-8")
        .then((content) => content.trim())
        .catch(() => null);

      if (status !== null) {
        const isCharging =
          status === "Charging" || status === "Full" || status === "Not charging";
        return { isCharging, timestamp: new Date() };
      }

      throw new Error("Could not determine power state");
    } catch (error) {
      console.error("Error reading power state:", error);
      return { isCharging: false, timestamp: new Date() };
    }
  }

  async start(): Promise<void> {
    // Get initial state
    this.lastState = await this.getCurrentPowerState();
    console.log(
      `Power monitor started. Current state: ${this.lastState.isCharging ? "Charging" : "On Battery"}`
    );

    // Poll for changes
    this.pollInterval = setInterval(async () => {
      const currentState = await this.getCurrentPowerState();

      if (
        this.lastState &&
        currentState.isCharging !== this.lastState.isCharging
      ) {
        const event = currentState.isCharging ? "plugged" : "unplugged";
        console.log(`Power event: ${event}`);
        this.emit("power-change", {
          event,
          isCharging: currentState.isCharging,
          timestamp: currentState.timestamp
        });
      }

      this.lastState = currentState;
    }, this.pollIntervalMs);
  }

  stop(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
      console.log("Power monitor stopped");
    }
  }

  setPollingInterval(ms: number): void {
    this.pollIntervalMs = ms;
    if (this.pollInterval) {
      this.stop();
      this.start().catch(console.error);
    }
  }
}

export default new PowerMonitor();
