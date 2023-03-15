import { OPENAI_KEY } from "$env/static/private";
import { getTokens } from "$lib/helpers/tokenizer";
import { json } from "@sveltejs/kit";
import type {
  ChatCompletionRequestMessage,
  CreateChatCompletionRequest,
} from "openai";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request }) => {
  try {
    if (!OPENAI_KEY) {
      throw new Error("OpenAI key not found");
    }

    const requestData = await request.json();

    if (!requestData) {
      throw new Error("No data found");
    }

    const reqMessages: ChatCompletionRequestMessage[] = requestData.messages;

    if (!reqMessages) {
      throw new Error("No messages found");
    }

    let tokenCount = 0;
    reqMessages.forEach((message) => {
      const tokens = getTokens(message.content);
      tokenCount += tokens;
    });

    const moderationRes = await fetch("https://api.openai.com/v1/moderations", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_KEY}`,
      },
      method: "POST",
      body: JSON.stringify({
        input: reqMessages[reqMessages.length - 1].content,
      }),
    });

    const moderationData = await moderationRes.json();
    const [results] = moderationData.results;
    if (results.flagged) {
      throw new Error("Message flagged");
    }

    const prompt =
      "You are a very well spoken english man who works in the coal mines";
    tokenCount += getTokens(prompt);

    if (tokenCount >= 4000) {
      //Maybe remove the first message here? Or figure out a better way to handle this
      throw new Error("Message too long");
    }

    const messages: ChatCompletionRequestMessage[] = [
      { role: "system", content: prompt },
      ...reqMessages,
    ];

    const chatRequestOpts: CreateChatCompletionRequest = {
      model: "gpt-3.5-turbo",
      messages,
      temperature: 0.9,
      stream: true,
    };

    const chatRes = await fetch("https://api.openai.com/v1/chat/completions", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_KEY}`,
      },
      method: "POST",
      body: JSON.stringify(chatRequestOpts),
    });

    if (!chatRes.ok) {
      throw new Error("OpenAI API error");
    }

    return new Response(chatRes.body, {
      headers: {
        "Content-Type": "text/event-stream",
      },
    });
  } catch (error) {
    console.log(error);
    return json({ error: "There was an error" }, { status: 500 });
  }
};
