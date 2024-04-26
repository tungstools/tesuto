
import { __DEFAULT_CONFIG_FILE } from "./constants";

function loadConfig(file?: string) {
    file ??= __DEFAULT_CONFIG_FILE;
    return require(file);
}

export { loadConfig };

