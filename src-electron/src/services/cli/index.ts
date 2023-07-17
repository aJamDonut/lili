import { app } from 'electron';
import { getHistory, runWorkload } from '../aiworkload';
import { callService } from '../event';

//Create aliases
const hasParam = app?.commandLine.hasSwitch;
const param = app?.commandLine.getSwitchValue;

export type CliSettings = {
  id: string;
  action: string;
  prompt: string;
  workload: string;
  [key: string]: string | number | boolean | Array<string | number | boolean>;
};
const defaults: CliSettings = {
  id: 'none',
  action: 'help',
  prompt: '',
  workload: '',
  help: false,
  gptKey: false,
  getLicense: false,
  verbose: false,
};

export type CliCommands = {
  [key: string]: (settings: CliSettings) => void;
};

//Incase verbose removes console.log
const finalOutput = console.log;

const commands: CliCommands = {
  help: function () {
    finalOutput(' ');
    finalOutput(' Lili CLI Help');
    finalOutput(' ------');
    finalOutput(' ');
    finalOutput(' \tCommands');
    finalOutput(' \t------');
    finalOutput(' ');
    finalOutput(' \t--help  Show this help message');
    finalOutput(' \t--action  The action to run from the list below');
    finalOutput(' ');
    finalOutput(' \t            RunWorkload - Run a workload');
    finalOutput(' \t            GetWorkloads - Get a list of workloads');
    finalOutput(' ');
    finalOutput(" \t--workload  The workload to run if running a workload Default: ''");
    finalOutput(" \t--prompt  Prompt message to send with workloads. Default: ''");
    finalOutput(" \t--context  Context settings to send with workloads. Default: ''");
    finalOutput(' \t--verbose  Output extra logging information. Default: false');
    finalOutput(' ');
    finalOutput(' Example command');
    finalOutput(' ------');
    finalOutput(
      ' liliflux.exe --cli=true --action=RunWorkload --prompt="Delete file.csv" --workload=extract_files'
    );
  },
  RunWorkload: async function (settings: CliSettings) {
    if (!settings.workload) {
      cliOut('Must provide workload!');
      return;
    }
    await runWorkload(settings.prompt, {
      ...settings,
      onComplete: async (tokens) => {
        finalOutput(tokens);
      },
    });
  },
  GetHistory: async function (settings: CliSettings) {
    const history = await callService('Engine:getHistory', { start: 0, end: 10 });
    console.log('-----------------------');
    console.log(history);
    console.log('-----------------------');
  },
};

const settings = { ...defaults };

export function cliOut(message: string) {
  if (settings.verbose) console.log(message);
}
//quasar dev -m electron -- --cli=true --action=RunWorkload --prompt="Take file.csv and join the names to people.csv" --workload=extract_files
export async function injectCLIApp() {
  for (const key in defaults) {
    settings[key] = hasParam(key) ? param(key) : defaults[key];
    if (settings[key] === 'false' || settings[key] === '') {
      settings[key] = false;
    }
    if (settings[key] === 'true') {
      settings[key] = true;
    }
  }

  let lastMessage = '';
  function filterz(filter: string) {
    lastMessage = filter;
  }

  if (!settings.verbose) {
    console.log = filterz;
    console.error = console.log;
    console.info = console.log;
  }

  //Execute command
  let response = await commands[settings.action](settings);
  filterz(response as unknown as string);

  app.quit();
}
