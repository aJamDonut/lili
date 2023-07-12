import { EngineDriverInterface } from '../Engine';
import { StorageDriverInterface } from '../Storage';

/**
 * @typedef {Object} LiliClientConfig
 * @property {object} engineDriver - The Engine to use for Lili
 */
export interface LiliClientConfig {
  engineDriver: EngineDriverInterface;
}

/**
 * @typedef {Object} LiliServerConfig
 * @property {object} storageDriver - The Engine to use for lili
 * @property {object} engineDriver - The storage engine to use for handling files
 */
export interface LiliServerConfig {
  engineDriver: EngineDriverInterface;
  storageDriver: StorageDriverInterface;
}
