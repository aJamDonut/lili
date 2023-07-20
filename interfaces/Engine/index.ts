import type { DefinitionSource, HistoricWorkload, HistoryFile } from '../Lili';
import type { WorkloadOptions } from '../Workload';
import type { ValidLicenseResponse } from 'app/src-electron/src/services/shopify';

export interface RecallHistoryOptions extends WorkloadOptions {
  workloadHistory: HistoricWorkload;
  forEachUserPrompt: (options: WorkloadOptions) => Promise<void>;
}

/**
 * Represents the interface for an engine driver.
 * @interface EngineDriverInterface
 */
export interface EngineDriverInterface {
  /**
   * The name of the engine driver.
   * @type {string}
   */
  name: string;
  /**
   * Runs the engine with the specified options.
   * @param {WorkloadOptions} options - The options for the workload.
   */
  startWorkload(options: WorkloadOptions): void;

  getHistory(start: number, end: number, type: DefinitionSource): Promise<Array<HistoryFile>>;

  purgeHistory(): Promise<void>;

  getHistoricWorkload(id: string): Promise<HistoricWorkload>;

  getWorkloads(): Promise<Array<string>>;

  hasValidLicense(): Promise<boolean>;

  unsetLicense(): Promise<boolean>;
  getLicense(key: string): Promise<ValidLicenseResponse>;
  reset(): void;
  recallWorkload(options: RecallHistoryOptions): Promise<string>;
  saveHistoricWorkload(workloadHistory: HistoricWorkload): Promise<string>;
  deleteHistoricWorkload(id: string, type: DefinitionSource): Promise<boolean>;
}
