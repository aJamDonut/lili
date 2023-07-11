import type { LiliConfig } from './interfaces/Lili';
import type { HistoryEntry, WorkloadOptions } from './interfaces/Workload';

import { ElectronEngine } from './drivers/Engine/ElectronEngine';

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
  forEachToken: (line: string) => {
    console.log(line);
  },
  onComplete: (lines: string) => {
    console.log(lines);
  },
};

let LILIAI: LiliConfig = {
  engine: 'chatgpt',
  api_key: 'non',
  engineDriver: new ElectronEngine(),
};

export function setup(config: LiliConfig) {
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
  LILIAI.engineDriver.startWorkload(workloadOptions);
}

/**
 * Retrieves the history entries within the specified range.
 * @param {number} start - The start index of the history entries.
 * @param {number} end - The end index of the history entries.
 * @returns {HistoryEntry[] | Promise<FakeHistoryEntry[]>} The history entries within the specified range.
 */
export async function getHistory(
  start: number,
  end: number
): Promise<Array<HistoryEntry>> {
  LILIAI.engineDriver.getHistory(start, end);
}

/**
 * Recalls a specific job from the history.
 * @param {number} id - The ID of the history entry to recall.
 * @param {WorkloadOptions} workloadCustomOptions - The custom options for the workload.
 */
/*
export function recallJob(id: number, workloadCustomOptions: WorkloadOptions) {}
*/
