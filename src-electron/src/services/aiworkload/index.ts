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
  description: string;
  messageHistory: MessageHistory[];
  defaults: Defaults;
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

  await parseDefinitionFiles(definition);

  return definition;
}

export function newMessage(role: string, content: string): MessageHistory {
  return { role, content };
}

export async function runWorkloadRaw(prompt: string, workloadOptions: WorkloadOptions) {
  const workload = await getWorkloadDefinition(workloadOptions.workload);

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

export async function readContextFile(file: string) {
  return (await callService('Storage:readFile', {
    folderName: 'workspaces/default',
    fileName: file,
  })) as string;
}

export async function getFilesContextMessages(prompt: string) {
  //TODO: could this effect prompts sent by different languages?
  const DEFAULT_DESCRIPTION = 'The file the user provided';
  const DESCRIPTION_PREFIX = '';
  const DESCRIPTION_SEPERATOR = '\r\n';
  const FILE_SEPERATOR = '\r\n--------------\r\n';
  const context = await getContextFiles(prompt);
  let message = '';

  const messages: Array<MessageHistory> = [];

  for (const contextFile of context.files) {
    if (!contextFile.files) {
      continue; //Malformed? Record exists but no files
    }
    const description = contextFile.description || DEFAULT_DESCRIPTION;

    message = DESCRIPTION_PREFIX + description + DESCRIPTION_SEPERATOR;

    const files = [];

    for (const file of contextFile.files) {
      try {
        const content = await readContextFile(file);
        message = message + file + FILE_SEPERATOR;
        message = message + content;

        files.push({ name: file, content: content });
      } catch (e) {
        //Cannot find file, it must just not exist yet or not be found.
        //Atleast push it back as a blank reference to retain normality.
        files.push({ name: file, content: '' });
      }
    }

    //CLASSIC, uses text
    //messages.push(newMessage('system', message));

    //ADVANCED, uses JSON
    messages.push(newMessage('system', JSON.stringify(files)));
  }
  return messages;
}

export async function getContextFiles(prompt: string) {
  const contextFiles: string = await runWorkloadRaw(prompt, {
    workload: 'extract_files',
  } as WorkloadOptions);

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
    folderName: `logs`,
    fileName: `lastmessages.json`,
    contents: JSON.stringify(messages),
  });
}

//TODO: implement AI to extract malformed json later
export function getContextJSON(prompt: string) {
  return [];
}

interface JSONFileContext {
  name: string;
  content: string;
}

export async function parseJSONResult(files: Array<JSONFileContext>) {
  for (const file of files) {
    console.log('Write ' + file.name, file.content.length);
    (await callService('Storage:writeFile', {
      folderName: `workspaces/default`,
      fileName: file.name,
      contents: file.content,
    })) as WorkloadDefinition;
  }
}

export async function runWorkload(prompt: string, workloadOptions: WorkloadOptions) {
  (await callService('Storage:writeFile', {
    folderName: `logs`,
    fileName: `lastworkload.json`,
    contents: JSON.stringify({ prompt, workloadOptions }),
  })) as WorkloadDefinition;

  if (workloadOptions.workload === 'extract_files') {
    return runWorkloadRaw(prompt, workloadOptions);
  }

  const workload = await getWorkloadDefinition(workloadOptions.workload);

  const fileContextMessages = await getFilesContextMessages(prompt);

  const messages = [...workload.messageHistory, newMessage('user', prompt), ...fileContextMessages];

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

    parseJSONResult(jsonResult);

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
