type LogLevel = "info" | "error";

type LogFields = Record<string, unknown>;

export function log(level: LogLevel, message: string, fields: LogFields = {}) {
  const entry = {
    level,
    message,
    ...fields,
    timestamp: new Date().toISOString()
  };

  process.stdout.write(`${JSON.stringify(entry)}\n`);
}
