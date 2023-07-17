import OpenAI from 'openai';
import { getApiKey } from '../../settings';
import { showError, showInfo } from '../../event';
import { MessageHistory } from '../../aiworkload';

export type ForEachTokenCallback = (token: string) => Promise<void>;

export type OnCompleteCallback = (token: string) => Promise<void>;

export type ChatRole = 'function' | 'system' | 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export type CompletionMessage =
  OpenAI.Chat.CompletionCreateParams.CreateChatCompletionRequestStreaming.Message;

/**
 * Takes in messages and reduces them down to the desired token count, removing oldest histories
 * @param messages List of Chat History messages
 * @returns Copy of reduces messages
 */
function backoffMessages(messages: Array<CompletionMessage>) {
  showInfo('Reducing history for AI');
  const messageCopy = [...messages];
  const BACKOFF_SOFT_CAP = 0.95;
  const BACKOFF_CAP = 3 * 16000;

  while (JSON.stringify(messageCopy).length > BACKOFF_CAP * BACKOFF_SOFT_CAP) {
    messageCopy.shift();
  }
  return messageCopy;
}

/**
 * Cleans up messages
 * @param messages
 */
function cleanMessages(messages: Array<MessageHistory>): Array<CompletionMessage> {
  const messageCopy: Array<CompletionMessage> = [];
  for (let message of messages) {
    messageCopy.push({ role: message.role, content: message.content });
  }
  return messageCopy;
}

//TODO: I want to expose this on the event service but it would mean internal events need to handle replies etc.
export async function streamCompletion(
  messages: Array<MessageHistory>,
  forEachToken: ForEachTokenCallback,
  onComplete: OnCompleteCallback
) {
  let tokens = '';

  //Remove any custom lili history data
  messages = cleanMessages(messages);

  //Reduce message count to the token limit
  messages = backoffMessages(messages);

  try {
    const gpt = new OpenAI({
      apiKey: await getApiKey(),
    });

    console.log('Create completion', messages);
    const chatCompletionStream = await gpt.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      stream: true,
    });

    for await (const token of chatCompletionStream) {
      // FOR DEBUGGING: console.log(JSON.stringify(token));
      const text = token.choices[0]?.delta?.content || '';
      tokens = tokens + text;
      await forEachToken.call(gpt, text); //Needs to await for command line
    }
    if (typeof onComplete === 'function') {
      await onComplete.call(gpt, tokens); //Needs to await for command line
    }
  } catch (e) {
    showError(e as string);
    if (typeof onComplete === 'function') {
      await onComplete.call({}, 'Error: ' + e); //Needs to await for command line
    }
  }

  return tokens;
}
