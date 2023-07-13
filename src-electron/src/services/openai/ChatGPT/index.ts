import OpenAI from 'openai';
import { getApiKey } from '../../settings';

export type ForEachTokenCallback = (token: string) => void;

export type OnCompleteCallback = (token: string) => void;

export interface ChatMessage {
  role: 'role' | 'function';
  content: string;
}

export type CompletionMessage =
  OpenAI.Chat.CompletionCreateParams.CreateChatCompletionRequestStreaming.Message;

//TODO: I want to expose this on the event service but it would mean internal events need to handle replies etc.
export async function streamCompletion(
  messages: Array<OpenAI.Chat.CompletionCreateParams.CreateChatCompletionRequestStreaming.Message>,
  forEachToken: ForEachTokenCallback,
  onComplete: OnCompleteCallback
) {
  const gpt = new OpenAI({
    apiKey: await getApiKey(),
  });

  console.log('Create completion', messages);
  const chatCompletionStream = await gpt.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: messages,
    stream: true,
  });

  let tokens = '';

  for await (const token of chatCompletionStream) {
    console.log(JSON.stringify(token));
    const text = token.choices[0]?.delta?.content || '';
    tokens = token + text;
    forEachToken.call(gpt, text);
  }

  if (typeof onComplete === 'function') {
    onComplete.call(gpt, tokens);
  }
}
