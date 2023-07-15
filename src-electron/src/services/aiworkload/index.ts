import { WorkloadOptions } from 'app/interfaces/Workload';
import { callService } from '../event';
import { CompletionMessage, streamCompletion } from '../openai/ChatGPT';

interface MessageHistory {
  role: string;
  content?: string | null;
  contentFile?: string;
}

interface Defaults {
  advanced: {
    repetitiveness: number;
    creativity: number;
    tokenLength: number;
    solutionCount: number;
  };
}

interface WorkloadDefinition {
  name: string;
  codename: string;
  type?: 'raw' | 'normal';
  description: string;
  messageHistory: MessageHistory[];
  defaults: Defaults;
}
interface ContexFolder {
  description: string;
  folders: Array<string>;
}
interface ContextFolders {
  folders: Array<ContexFolder>;
}
interface ContextFile {
  description: string;
  files: Array<string>;
}

interface ContextFiles {
  files: Array<ContextFile>;
}

export async function parseHistoryFile(definition: WorkloadDefinition, history: MessageHistory) {
  if (!history.contentFile) {
    return history;
  }
  history.content = (await callService('Storage:liliReadFile', {
    folderName: `workloads/${definition.codename}`,
    fileName: history.contentFile,
  })) as string;

  delete history.contentFile; //Drop property unused in OpenAI

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

  definition.messageHistory = (await callService('Storage:liliReadJson', {
    folderName: `workloads/${name}`,
    fileName: 'message_history.json',
  })) as Array<MessageHistory>;

  await parseDefinitionFiles(definition);

  return definition;
}

export function newMessage(role: string, content: string): MessageHistory {
  return { role, content };
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
          workloadOptions.forEachToken(
            jsonResponse('inline', contextFile.description + ': ' + file, 'success')
          );
        }
      } catch (e) {
        if (typeof workloadOptions.forEachToken === 'function') {
          workloadOptions.forEachToken(
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

interface JSONFileContext {
  name: string;
  content: string;
}
export type FileDescriptions = {
  [key: string]: unknown;
};

export function jsonResponse(type: string, content: string, state = 'success', component = 'default') {
  return JSON.stringify({ type, content, state, component });
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

    if (fileDescriptions[file.name]) {
      if (typeof workloadOptions.forEachToken === 'function') {
        workloadOptions.forEachToken(
          jsonResponse('inline', fileDescriptions[file.name] + ': ' + file.name, state)
        );
      }
    } else {
      if (typeof workloadOptions.forEachToken === 'function') {
        workloadOptions.forEachToken(jsonResponse('inline', `Made changes to ${file.name}`, state));
      }
    }
  }
}

export async function runWorkloadRaw(
  prompt: string,
  workloadOptions: WorkloadOptions,
  workload?: WorkloadDefinition
) {
  workload = workload || (await getWorkloadDefinition(workloadOptions.workload));

  const messages = [...workload.messageHistory, newMessage('user', prompt)];

  //Init AI, send the callback function
  //For every token
  const forEachToken = (token: string) => {
    console.log(token);
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

export async function runWorkload(prompt: string, workloadOptions: WorkloadOptions) {
  (await callService('Storage:writeFile', {
    folderName: `logs`,
    fileName: `lastworkload.json`,
    contents: JSON.stringify({ prompt, workloadOptions }),
  })) as WorkloadDefinition;

  const workload = await getWorkloadDefinition(workloadOptions.workload);

  if (workload.type === 'raw') {
    return runWorkloadRaw(prompt, workloadOptions, workload);
  }

  const fileContextMessages = await getFilesContextMessages(prompt, workloadOptions);
  //const folderContextMessages = await getFoldersContextMessages(prompt);

  const messages = [
    ...workload.messageHistory,
    newMessage('user', prompt),
    ...fileContextMessages.messages,
    //...folderContextMessages,
  ];

  console.log('Messages', messages);

  const forEachToken = (token: string) => {
    console.log(token);
    if (typeof workloadOptions.forEachToken === 'function') {
      workloadOptions.forEachToken(token);
    }
  };
  //... when its finaly doone
  const onComplete = async (allTokens: string) => {
    let jsonResult: Array<JSONFileContext> = [];
    try {
      jsonResult = JSON.parse(allTokens);
    } catch (e) {
      //No json result
      console.log('No json result');
      jsonResult = (await getContextJSON(allTokens)) as Array<JSONFileContext>;
    }

    parseJSONResult(fileContextMessages.fileDescriptions, jsonResult, workloadOptions);

    if (typeof workloadOptions.onComplete === 'function') {
      workloadOptions.onComplete(allTokens);
    }

    (await callService('Storage:writeFile', {
      folderName: `logs`,
      fileName: `lastcompletion.json`,
      contents: allTokens,
    })) as WorkloadDefinition;
  };

  logMessages(messages);

  return streamCompletion(messages as Array<CompletionMessage>, forEachToken, onComplete);
}
//TODO: implementado
//export function createWorkload(workloadOptions) {}

//export function getWorkloads() {}
/*
export function test() {
  runWorkload('Please update package.json so that the type is module', {
    workload: 'change_files',
  } as WorkloadOptions);
}
*/
