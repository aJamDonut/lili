/**
 * @typedef {Object} WorkloadOptions
 * @property {string} prompt - The prompt for the workload.
 * @property {string} context - The context for the workload.
 * @property {string} workload - The workload description.
 * @property {string} outputFormat - The output format for the workload response.
 * @property {string} outputTo - The output destination for the workload response.
 * @property {number} creativity - The creativity level for the workload.
 * @property {number} repetitiveness - The repetitiveness level for the workload.
 * @property {number} responseLimit - The response limit for the workload.
 * @property {number} solutionCount - The number of solutions to generate for the workload.
 * @property {function(string): void} forEachToken - A callback function to process each token.
 * @property {function(string): void} onComplete - A callback function to process the complete response.
 */
export interface WorkloadOptions {
  prompt: string;
  context: string;
  workload: string;
  outputFormat: string;
  outputTo: string;
  creativity: number;
  repetitiveness: number;
  responseLimit: number;
  solutionCount: number;
  forEachToken: (line: string) => void;
  onComplete: (lines: string) => void;
}
/**
 * @typedef {Object} HistoryEntry
 * @property {number} id - The ID of the history entry.
 * @property {string} prompt - The prompt used for the history entry.
 * @property {string} context - The context of the history entry.
 * @property {string} first_workload - The first workload associated with the history entry.
 * @property {string} last_workload - The last workload associated with the history entry.
 * @property {string} response - The response generated for the history entry.
 */
export interface HistoryEntry {
  id: number;
  prompt: string;
  context: string;
  first_workload: string;
  last_workload: string;
  response: string;
}

export interface WorkloadHistoryLine {
  role: string;
  content: string;
}

export interface WorkloadHistory {
  id: number;
  prompt: string;
  history: Array<WorkloadHistoryLine>;
}
