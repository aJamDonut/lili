import { ChatRole } from 'app/src-electron/src/services/openai/ChatGPT';
import { EngineDriverInterface } from '../Engine';
import { StorageDriverInterface } from '../Storage';
import { WorkloadOptions } from '../Workload';

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

export interface HistoryMetaData {
  id: string;
  date: number;
}

export interface HistoryFile {
  meta: HistoryMetaData;
  workloadDefinition: WorkloadDefinition;
  workloadOptions: WorkloadOptions;
}

export interface MessageHistory {
  role: ChatRole;
  content: string | null;
  contentFile?: string;
  workloadOptions?: WorkloadOptions;
  workloadDefinition?: WorkloadDefinition;
}

export interface Defaults {
  advanced: {
    repetitiveness: number;
    creativity: number;
    tokenLength: number;
    solutionCount: number;
  };
}

export type AvailableContexts = 'extract_files';

export interface WorkloadDefinition {
  name: string;
  codename: string;
  context?: Array<AvailableContexts>;
  type?: 'raw' | 'normal';
  description: string;
  messageHistory: MessageHistory[];
  defaults: Defaults;
}
export interface ContexFolder {
  description: string;
  folders: Array<string>;
}
export interface ContextFolders {
  folders: Array<ContexFolder>;
}
export interface ContextFile {
  description: string;
  files: Array<string>;
}

export interface ContextFiles {
  files: Array<ContextFile>;
}

export interface JSONFileContext {
  name?: string;
  file?: string;
  content: string;
}
export type FileDescriptions = {
  [key: string]: unknown;
};

export interface JsonInlineMessage {
  type: string;
  content: string;
  state: string;
  component: string;
}

export type InlineMessages = Array<JsonInlineMessage>;

export interface HistoricWorkload {
  definition: HistoryFile;
  history: Array<MessageHistory>;
}
