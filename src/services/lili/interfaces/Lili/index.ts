import { EngineDriverInterface } from '../Engine';
import { StorageDriverInterface } from '../Storage';

/**
 * @typedef {Object} LiliConfig
 * @property {string} engine - The engine used by LILIAI.
 * @property {string} api_key - The API key for LILIAI.
 * @property {boolean} storageDriver - Indicates whether a storage driver is enabled or not.
 * @property {boolean} engineDriver - Indicates whether an engine driver is enabled or not.
 */
export interface LiliConfig {
  engine: string;
  api_key: string;
  storageDriver: StorageDriverInterface;
  engineDriver: EngineDriverInterface;
}
