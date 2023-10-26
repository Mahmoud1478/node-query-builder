/**
 * Retrieves the value of an environment variable.
 *
 * @param {string} key - The name of the environment variable.
 * @param {string|null} [defaultValue=""] - The default value to return if the environment variable is not set.
 * @return {string} - The value of the environment variable, or the default value if it is not set.
 */
export function env(key: string, defaultValue = ""): string {
    return process.env[key] ?? (defaultValue as string);
}
