import { z } from "zod";
import { chatLimits } from "./copy";

const Message = z.discriminatedUnion("role", [
  z.object({ role: z.literal("user"), content: z.string().trim().min(1).max(chatLimits.maxUserChars) }),
  z.object({ role: z.literal("assistant"), content: z.string().trim().min(1).max(chatLimits.maxAssistantChars) }),
]);

export type ChatMessage = z.infer<typeof Message>;

/** A conversation that starts and ends with the visitor and alternates roles. */
export const ChatRequest = z.object({
  messages: z
    .array(Message)
    .min(1)
    .max(chatLimits.maxUserTurns * 2 - 1)
    .refine((messages) => messages.every((message, i) => message.role === (i % 2 === 0 ? "user" : "assistant")), {
      message: "Messages must alternate, starting and ending with the user.",
    })
    .refine((messages) => messages.length % 2 === 1, { message: "The last message must be from the user." }),
});
