export function env(key: string, defaultValue = ""): string {
    return process.env[key] ?? (defaultValue as string);
}
