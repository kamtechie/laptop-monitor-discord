import { EventEmitter } from "events";
import { spawn } from "child_process";

export class ShutdownMonitor extends EventEmitter {
  private isMonitoring: boolean = false;
  private systemctlProcess: any = null;

  async start(): Promise<void> {
    if (this.isMonitoring) {
      console.warn("Shutdown monitor already running");
      return;
    }

    this.isMonitoring = true;
    console.log("Shutdown monitor started");

    // Listen for system signals that indicate shutdown
    process.on("SIGTERM", () => {
      console.log("SIGTERM received - system shutdown detected");
      this.emit("shutdown-initiated");
    });

    process.on("SIGINT", () => {
      console.log("SIGINT received - graceful shutdown");
      this.emit("shutdown-initiated");
    });

    // Also monitor systemd for shutdown events (Linux-specific)
    try {
      this.monitorSystemd();
    } catch (error) {
      console.warn("Could not set up systemd monitoring:", error);
    }
  }

  private monitorSystemd(): void {
    try {
      // Use journalctl to stream system messages
      this.systemctlProcess = spawn("journalctl", [
        "-f",
        "-u",
        "systemd-logind.service",
        "-o",
        "json"
      ]);

      this.systemctlProcess.stdout.on("data", (data: Buffer) => {
        try {
          const lines = data.toString().split("\n");
          lines.forEach((line: string) => {
            if (!line) return;

            const entry = JSON.parse(line);
            const message = entry.MESSAGE || "";

            // Detect shutdown-related messages
            if (
              message.includes("The system will") ||
              message.includes("Restart") ||
              message.includes("Power off") ||
              message.includes("Halt")
            ) {
              console.log("Shutdown event detected:", message);
              this.emit("shutdown-scheduled", { reason: message });
            }
          });
        } catch (error) {
          // Silently ignore JSON parse errors
        }
      });

      this.systemctlProcess.stderr.on("data", (data: Buffer) => {
        console.warn("journalctl error:", data.toString());
      });
    } catch (error) {
      console.warn("Systemd monitoring not available:", error);
    }
  }

  stop(): void {
    if (this.systemctlProcess) {
      this.systemctlProcess.kill();
      this.systemctlProcess = null;
    }
    this.isMonitoring = false;
    console.log("Shutdown monitor stopped");
  }
}

export default new ShutdownMonitor();
