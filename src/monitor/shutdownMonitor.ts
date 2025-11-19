import { EventEmitter } from "events";

export class ShutdownMonitor extends EventEmitter {
  private isMonitoring: boolean = false;

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
  }

  stop(): void {
    this.isMonitoring = false;
    console.log("Shutdown monitor stopped");
  }
}

export default new ShutdownMonitor();
