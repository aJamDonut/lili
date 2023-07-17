import { WorkloadOptions } from 'app/interfaces/Workload';
import { callService } from '../event';
import { ChatRole, CompletionMessage, streamCompletion } from '../openai/ChatGPT';

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

export interface WorkloadDefinition {
  name: string;
  codename: string;
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

interface ContextFiles {
  files: Array<ContextFile>;
}

export interface JSONFileContext {
  name: string;
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

type CompletionMessages = Array<CompletionMessage>;

type InlineMessages = Array<JsonInlineMessage>;

export async function parseHistoryFile(definition: WorkloadDefinition, history: MessageHistory) {
  if (!history.contentFile) {
    return history;
  }
  history.content = (await callService('Storage:liliReadFile', {
    folderName: `workloads/${definition.codename}`,
    fileName: history.contentFile,
  })) as string;

  return history;
}

export async function parseDefinitionFiles(definition: WorkloadDefinition) {
  for (const history of definition.messageHistory) {
    await parseHistoryFile(definition, history);
  }
  return definition;
}

export async function getWorkloadDefinition(name: string) {
  const definition = (await callService('Storage:liliReadJson', {
    folderName: `workloads/${name}`,
    fileName: 'definition.json',
  })) as WorkloadDefinition;
  return definition;
}

export async function getFullWorkloadDefinition(name: string) {
  const definition = await getWorkloadDefinition(name);

  definition.messageHistory = (await callService('Storage:liliReadJson', {
    folderName: `workloads/${name}`,
    fileName: 'message_history.json',
  })) as Array<MessageHistory>;

  await parseDefinitionFiles(definition);

  return definition;
}

export function newMessage(
  role: string,
  content: string,
  workloadOptions?: WorkloadOptions,
  workloadDefinition?: WorkloadDefinition
): MessageHistory {
  return { role, content, workloadOptions, workloadDefinition };
}

export async function readContextFile(file: string) {
  return (await callService('Storage:readFile', {
    folderName: 'workspaces/default',
    fileName: file,
  })) as string;
}

export async function getFilesContextMessages(prompt: string, workloadOptions: WorkloadOptions) {
  const context = await getContextFiles(prompt);

  const messages: Array<MessageHistory> = [];

  const fileDescriptions: FileDescriptions = {};

  for (const contextFile of context.files) {
    if (!contextFile.files) {
      continue; //Malformed? Record exists but no files
    }
    const files = [];

    for (const file of contextFile.files) {
      fileDescriptions[file] = contextFile.description;
      try {
        files.push({ name: file, content: await readContextFile(file) });
        if (typeof workloadOptions.forEachToken === 'function') {
          await workloadOptions.forEachToken(
            jsonResponse('inline', contextFile.description + ': ' + file, 'success')
          );
        }
      } catch (e) {
        if (typeof workloadOptions.forEachToken === 'function') {
          await workloadOptions.forEachToken(
            jsonResponse('inline', 'This file cannot be found yet: ' + file, 'warning')
          );
        }
        //Cannot find file, it must just not exist yet or not be found.
        //Atleast push it back as a blank reference to retain normality.
        files.push({ name: file, content: '' });
      }
    }

    messages.push(newMessage('system', JSON.stringify(files)));
  }
  return { messages, fileDescriptions };
}

export async function getContextFolders(prompt: string) {
  const contextFolders: string = await runWorkloadRaw(prompt, {
    workload: 'extract_folders',
  });

  let contextFilesObject: ContextFolders = {
    folders: [],
  };

  console.log('Context Folders', contextFolders);

  try {
    contextFilesObject = JSON.parse(contextFolders);
  } catch (e) {
    console.error("Can't parse response");
  }
  return contextFilesObject;
}

export async function getFoldersContextMessages(prompt: string) {
  const context = await getContextFolders(prompt);
  const messages: Array<MessageHistory> = [];

  for (const contextFile of context.folders) {
    if (!contextFile.folders) {
      continue; //Malformed? Record exists but no files
    }

    const folders = [];

    for (const file of contextFile.folders) {
      try {
        const content = await readContextFile(file);

        folders.push({ name: file, content: content });
      } catch (e) {
        //Cannot find file, it must just not exist yet or not be found.
        //Atleast push it back as a blank reference to retain normality.
        folders.push({ name: file, content: '' });
      }
    }

    messages.push(newMessage('system', JSON.stringify(folders)));
  }
  return messages;
}

export async function getContextFiles(prompt: string) {
  const contextFiles: string = await runWorkloadRaw(prompt, {
    workload: 'extract_files',
  });

  let contextFilesObject: ContextFiles = {
    files: [],
  };

  console.log('Context files', contextFiles);

  try {
    contextFilesObject = JSON.parse(contextFiles);
  } catch (e) {
    console.error("Can't parse response");
  }
  return contextFilesObject;
}

const workloadLogs: Array<string> = [];

export function workloadLog(message: string) {
  const WORKLOAD_LOG_LIMIT = 10;

  if (workloadLogs.length >= WORKLOAD_LOG_LIMIT) workloadLogs.shift();

  workloadLogs.push(message);
  callService('Storage:writeFile', {
    folderName: 'logs',
    fileName: 'workload_logs.json',
    contents: JSON.stringify(workloadLogs),
  });
}

export function logMessages(messages: Array<MessageHistory>) {
  callService('Storage:writeFile', {
    folderName: 'logs',
    fileName: 'lastmessages.json',
    contents: JSON.stringify(messages),
  });
}

//TODO: implement AI to extract malformed json later
export function getContextJSON(prompt: string) {
  console.log(prompt);
  return [];
}

export function jsonResponse(type: string, content: string, state = 'success', component = 'default') {
  addInlineMessageHistory(type, content, state, component);
  return JSON.stringify({ type, content, state, component });
}

function addInlineMessageHistory(type: string, content: string, state = 'success', component = 'default') {
  //TODO: For now, we'll stringify since that is how it works on the frontend, and it may make sense
  //for parity of how output operations work.
  INLINE_MESSAGE_HISTORY.push({ type, content, state, component });
  addMessagesHistory('assistant', JSON.stringify({ type, content, state, component }));
}

export async function parseJSONResult(
  fileDescriptions: FileDescriptions,
  files: Array<JSONFileContext>,
  workloadOptions: WorkloadOptions
) {
  for (const file of files) {
    let state = 'success';
    try {
      (await callService('Storage:writeFile', {
        folderName: 'workspaces/default',
        fileName: file.name,
        contents: file.content,
      })) as WorkloadDefinition;
    } catch (e) {
      state = 'failed';
    }

    if (fileDescriptions[file.name] && typeof workloadOptions.forEachToken === 'function') {
      await workloadOptions.forEachToken(
        jsonResponse('inline', fileDescriptions[file.name] + ': ' + file.name, state)
      );
      continue;
    }

    //No file descriptor, just send general message
    if (typeof workloadOptions.forEachToken === 'function')
      await workloadOptions.forEachToken(jsonResponse('inline', `Made changes to ${file.name}`, state));
  }
}

function getCurrentDateTime(): string {
  const now = new Date();
  const year = now.getFullYear().toString().padStart(4, '0');
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');

  return `${year}_${month}_${day}_${hours}_${minutes}_${seconds}`;
}

let COMPLETION_ID = 'default';
let MESSAGE_HISTORY: Array<MessageHistory> = [];
let INLINE_MESSAGE_HISTORY: InlineMessages = [];

export function getNewCompletionId() {
  COMPLETION_ID = getCurrentDateTime();
  return COMPLETION_ID;
}

export async function saveNow(workloadOptions: WorkloadOptions, workloadDefinition: WorkloadDefinition) {
  return await saveHistory(workloadOptions, workloadDefinition, MESSAGE_HISTORY);
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

export async function saveHistory(
  workloadOptions: WorkloadOptions,
  workloadDefinition: WorkloadDefinition,
  completions: Array<MessageHistory>
) {
  const workloadDefinitionCopy: WorkloadDefinition = { ...workloadDefinition, ...{ messageHistory: [] } };

  workloadOptions.id = COMPLETION_ID;

  console.log('Write history...');

  await callService('Storage:writeFile', {
    folderName: 'workload_history/' + workloadOptions.id + '/',
    fileName: 'history.json',
    contents: JSON.stringify(completions),
  });

  console.log('Write definition...');

  const historyFile: HistoryFile = {
    meta: {
      id: workloadOptions.id,
      date: Date.now(),
    },
    workloadDefinition: workloadDefinitionCopy,
    workloadOptions,
  };

  await callService('Storage:writeFile', {
    folderName: 'workload_history/' + workloadOptions.id + '/',
    fileName: 'definition.json',
    contents: JSON.stringify(historyFile),
  });
}
export function showLines() {
  return false;
}
export async function runWorkloadRaw(
  prompt: string,
  workloadOptions: WorkloadOptions,
  workload?: WorkloadDefinition
) {
  workload = workload || (await getFullWorkloadDefinition(workloadOptions.workload));

  const messages = [...workload.messageHistory, newMessage('user', prompt)];

  //Init AI, send the callback function
  //For every token
  const forEachToken = async (token: string) => {
    if (showLines()) {
      console.log(token);
    }
    if (typeof workloadOptions.forEachToken === 'function') {
      workloadOptions.forEachToken(token);
    }
  };
  //... when its finaly doone
  const onComplete = async (allTokens: string) => {
    if (typeof workloadOptions.onComplete === 'function') {
      workloadOptions.onComplete(allTokens);
    }
    (await callService('Storage:writeFile', {
      folderName: 'logs',
      fileName: 'lastrawcompletion.json',
      contents: allTokens,
    })) as WorkloadDefinition;
  };

  return streamCompletion(messages as Array<CompletionMessage>, forEachToken, onComplete);
}

function createMessageHistory(role: ChatRole, content: string) {
  return { role, content };
}

function addMessagesHistory(role: ChatRole, content: string) {
  MESSAGE_HISTORY.push(createMessageHistory('assistant', content));
}

function setHistory(history: Array<MessageHistory>) {
  MESSAGE_HISTORY = history;
}

function resetHistory() {
  MESSAGE_HISTORY = [];
}

/**
 * Run Workload, the main meat. Runs a workload
 * @param prompt The text to send in the next prompt
 * @param workloadOptions
 * @returns void
 */
export async function runWorkload(prompt: string, workloadOptions: WorkloadOptions) {
  (await callService('Storage:writeFile', {
    folderName: `logs`,
    fileName: `lastworkload.json`,
    contents: JSON.stringify({ prompt, workloadOptions }),
  })) as WorkloadDefinition;

  //Non-Existing workload
  if (!workloadOptions.id) {
    resetHistory();
    workloadOptions.id = getNewCompletionId();
  }

  const workload = await getFullWorkloadDefinition(workloadOptions.workload);

  if (workload.type === 'raw') {
    return runWorkloadRaw(prompt, workloadOptions, workload);
  }

  const fileContextMessages = await getFilesContextMessages(prompt, workloadOptions);
  //const folderContextMessages = await getFoldersContextMessages(prompt);

  const messages = [
    ...MESSAGE_HISTORY,
    ...workload.messageHistory,
    newMessage('user', prompt, workloadOptions, workload),
    ...fileContextMessages.messages,
    //...folderContextMessages,
  ];

  setHistory(messages);

  const forEachToken = async (token: string) => {
    if (showLines()) {
      console.log(token);
    }
    if (typeof workloadOptions.forEachToken === 'function') {
      return await workloadOptions.forEachToken(token);
    }
  };
  //... when its finally doone
  const onComplete = async (allTokens: string) => {
    let jsonResult: Array<JSONFileContext> = [];
    try {
      jsonResult = JSON.parse(allTokens);
    } catch (e) {
      //No json result
      console.log('No json result');
      jsonResult = (await getContextJSON(allTokens)) as Array<JSONFileContext>;
    }

    await parseJSONResult(fileContextMessages.fileDescriptions, jsonResult, workloadOptions);

    if (typeof workloadOptions.onComplete === 'function') {
      await workloadOptions.onComplete(allTokens);
    }

    addMessagesHistory('system', allTokens);

    await saveNow(workloadOptions, workload);

    await callService('Storage:writeFile', {
      folderName: `logs`,
      fileName: `lastcompletion.json`,
      contents: allTokens,
    });
  };

  await logMessages(messages);

  return await streamCompletion(messages as Array<CompletionMessage>, forEachToken, onComplete);
}
