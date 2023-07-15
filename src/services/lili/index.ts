/**
 * @typedef {Object} LiliaiConfig
 * @property {string} engine - The engine used by LILIAI.
 * @property {string} api_key - The API key for LILIAI.
 * @property {boolean} storageDriver - Indicates whether a storage driver is enabled or not.
 * @property {boolean} engineDriver - Indicates whether an engine driver is enabled or not.
 */

/** @type {LiliaiConfig} */
let LILIAI = {
  engine: 'chatgpt',
  api_key: 'non',
  storageDriver: false,
  engineDriver: false,
};

/**
 * @typedef {Object} FakeHistoryEntry
 * @property {number} id - The ID of the history entry.
 * @property {string} prompt - The prompt used for the history entry.
 * @property {string} context - The context of the history entry.
 * @property {string} first_workload - The first workload associated with the history entry.
 * @property {string} last_workload - The last workload associated with the history entry.
 * @property {string} response - The response generated for the history entry.
 */

/** @type {FakeHistoryEntry[]} */
const FAKE_HISTORY = [
  {
    id: 1,
    prompt: 'Test prompt',
    context: '',
    first_workload: 'Document Code',
    last_workload: 'Tweak Documentation',
    response: 'I am a fake response',
  },
  {
    id: 4,
    prompt: 'Daves Test prompt',
    context: '',
    first_workload: 'Tweak Documentation',
    last_workload: 'Tweak Documentation',
    response: 'I am a fake response',
  },
  {
    id: 10,
    prompt: 'My Test prompt',
    context: '',
    first_workload: 'Document Code',
    last_workload: 'Document Code',
    response: 'I am a fake response',
  },
  {
    id: 2,
    prompt: 'Steves Test prompt',
    context: '',
    first_workload: 'Document Code',
    last_workload: 'Tweak Documentation',
    response: 'I am a fake response',
  },
];

/**
 * @type {string}
 */
const FAKE_RESPONSE = `
<h1>Hello there</h1>
<p>Thanks for contacting IT Support</p>

\`\`\`javascript
function(runCode){
    runCode();
}
\`\`\`
`;

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
 * @property {function(string[]): void} onComplete - A callback function to process the complete response.
 */

/**
 * @type {WorkloadOptions}
 */
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
  forEachToken: (token: string) => {
    console.log(token);
  },
  onComplete: (token: string) => {
    console.log(token);
  },
};

/**
 * Sets up LILIAI configuration.
 * @param {LiliaiConfig} config - The configuration options for LILIAI.
 */
export function setup(config) {
  LILIAI = { ...LILIAI, ...config };
}

/**
 * Processes the lines of a fake response.
 * @param {string} allLines - The entire fake response.
 * @param {string[]} lines - The lines of the fake response to process.
 * @param {function(string): void} callback - The callback function to call for each line.
 * @param {function(string[]): void} completeCallback - The callback function to call when processing is complete.
 */
function processFakeLines(allLines, lines, callback, completeCallback) {
  callback(lines.shift());
  if (!lines.length) {
    completeCallback(allLines);
    return;
  }
  setTimeout(() => {
    processFakeLines(allLines, lines, callback, completeCallback);
  }, 250);
}

/**
 * Starts a workload using custom options.
 * @param {WorkloadOptions} workloadCustomOptions - The custom options for the workload.
 */
export function startWorkload(workloadCustomOptions) {
  const workloadOptions = {
    ...LILIAI_DEFAULTWORKLOADOPTIONS,
    ...workloadCustomOptions,
  };

  processFakeLines(
    FAKE_RESPONSE,
    FAKE_RESPONSE.split(' '),
    workloadOptions.forEachToken,
    workloadOptions.onComplete
  );
}

/**
 * Retrieves the history entries within the specified range.
 * @param {number} start - The start index of the history entries.
 * @param {number} end - The end index of the history entries.
 * @returns {FakeHistoryEntry[] | Promise<FakeHistoryEntry[]>} The history entries within the specified range.
 */
export async function getHistory(start: number, end: number) {
  if (typeof start !== 'number' && typeof end !== 'number') {
    return FAKE_HISTORY;
  }

  if (typeof end === 'number') {
    return FAKE_HISTORY.slice(start, end);
  }

  return FAKE_HISTORY.slice(start);
}

/**
 * Recalls a specific job from the history.
 * @param {number} id - The ID of the history entry to recall.
 * @param {WorkloadOptions} workloadCustomOptions - The custom options for the workload.
 */
export function getHistoricWorkload(id: number) {
  const history = FAKE_HISTORY.find((history) => history.id === id);
  return history;
}
