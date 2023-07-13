import type {
  HistoryEntry,
  WorkloadHistory,
  WorkloadOptions,
} from '../Workload';

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

  getHistory(start: number, end: number): Promise<Array<HistoryEntry>>;

  getHistoricWorkload(id: number): Promise<WorkloadHistory>;
}