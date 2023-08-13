import { DefinitionSource, HistoricWorkload, HistoryFile, LiliClientConfig } from 'app/interfaces/Lili';
import { ElectronEngine } from './drivers/Engine/ElectronEngine';
import { HistoryEntry, WorkloadHistory, WorkloadOptions } from 'app/interfaces/Workload';
import { RecallHistoryOptions } from 'app/interfaces/Engine';

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
export async function getHistory(start: number, end: number, type: DefinitionSource): Promise<Array<HistoryFile>> {
  return await LILIAI.engineDriver.getHistory(start, end, type);
}

export async function purgeHistory(): Promise<void> {
  return await LILIAI.engineDriver.purgeHistory();
}

export async function getWorkloads(): Promise<Array<string>> {
  return await LILIAI.engineDriver.getWorkloads();
}

/**
 * Recalls a specific job from the history.
 * @param {number} id - The ID of the history entry to recall.
 */
export async function getHistoricWorkload(id: string): Promise<HistoricWorkload> {
  return await LILIAI.engineDriver.getHistoricWorkload(id);
}

/**
 * Recalls a specific job from the history.
 * @param {number} id - The ID of the history entry to recall.
 */
export async function saveHistoricWorkload(workloadHistory: HistoricWorkload): Promise<string> {
  return await LILIAI.engineDriver.saveHistoricWorkload(workloadHistory);
}

export async function deleteHistoricWorkload(id: string, type: DefinitionSource): Promise<boolean> {
  return await LILIAI.engineDriver.deleteHistoricWorkload(id, type);
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

export async function getVersion() {
  return await LILIAI.engineDriver.getVersion();
}

export async function recallWorkload(options: RecallHistoryOptions): Promise<string> {
  return await LILIAI.engineDriver.recallWorkload(options);
}

export async function getWorkspaceDir(): Promise<string> {
  return await LILIAI.engineDriver.getWorkspaceDir();
}
export async function changeWorkspace(): Promise<string> {
  return await LILIAI.engineDriver.changeWorkspace();
}
export async function setUserRoot(root: string): Promise<boolean> {
  return await LILIAI.engineDriver.setUserRoot(root);
}
export async function showFolder(folder: string): Promise<boolean> {
  return await LILIAI.engineDriver.showFolder(folder);
}
