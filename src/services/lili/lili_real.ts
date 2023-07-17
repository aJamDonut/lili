import { LiliClientConfig } from 'app/interfaces/Lili';
import { ElectronEngine } from './drivers/Engine/ElectronEngine';
import { HistoryEntry, WorkloadHistory, WorkloadOptions } from 'app/interfaces/Workload';

const LILIAI_DEFAULTWORKLOADOPTIONS = {
  prompt: 'Hi there',
  context: '',
  workload: 'Just say hi',
  outputFormat: 'plaintext',
  outputTo: 'inline',
  creativity: 0.1,
  repetitiveness: 0.1,
  responseLimit: 10,
  solutionCount: 1,
  forEachToken: async (token: string) => {
    console.log(token);
  },
  onComplete: async (token: string) => {
    console.log(token);
  },
};

let LILIAI: LiliClientConfig = {
  engineDriver: new ElectronEngine(),
};

export function setup(config: LiliClientConfig) {
  LILIAI = { ...LILIAI, ...config };
}

/**
 * Starts a workload using custom options.
 * @param {WorkloadOptions} workloadCustomOptions - The custom options for the workload.
 */
export function startWorkload(workloadCustomOptions: WorkloadOptions) {
  const workloadOptions = {
    ...LILIAI_DEFAULTWORKLOADOPTIONS,
    ...workloadCustomOptions,
  };
  return LILIAI.engineDriver.startWorkload(workloadOptions);
}

export function reset() {
  console.log('Reset');
  return LILIAI.engineDriver.reset();
}
/**
 * Retrieves the history entries within the specified range.
 * @param {number} start - The start index of the history entries.
 * @param {number} end - The end index of the history entries.
 * @returns {WorkloadHistory[] | Promise<FakeHistoryEntry[]>} The history entries within the specified range.
 */
export async function getHistory(start: number, end: number): Promise<Array<HistoryEntry>> {
  return await LILIAI.engineDriver.getHistory(start, end);
}

export async function getWorkloads(): Promise<Array<string>> {
  return await LILIAI.engineDriver.getWorkloads();
}

/**
 * Recalls a specific job from the history.
 * @param {number} id - The ID of the history entry to recall.
 */
export async function getHistoricWorkload(id: number): Promise<WorkloadHistory> {
  return await LILIAI.engineDriver.getHistoricWorkload(id);
}

export async function hasValidLicense(): Promise<boolean> {
  return await LILIAI.engineDriver.hasValidLicense();
}

export async function unsetLicense(): Promise<boolean> {
  return await LILIAI.engineDriver.unsetLicense();
}

export async function getLicense(key: string) {
  return await LILIAI.engineDriver.getLicense(key);
}
