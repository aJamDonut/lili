import { HistoricWorkload, type HistoryFile } from '../Lili';
import type { HistoryEntry, WorkloadHistory, WorkloadOptions } from '../Workload';
import { ValidLicenseResponse } from 'app/src-electron/src/services/shopify';

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

  getHistory(start: number, end: number): Promise<Array<HistoryFile>>;
  
  purgeHistory(): Promise<void>;

  getHistoricWorkload(id: string): Promise<WorkloadHistory>;

  getWorkloads(): Promise<Array<string>>;

  hasValidLicense(): Promise<boolean>;

  unsetLicense(): Promise<boolean>;
  getLicense(key: string): Promise<ValidLicenseResponse>;
  reset(): void;
  recallWorkload(options: RecallHistoryOptions): Promise<string>;
}
