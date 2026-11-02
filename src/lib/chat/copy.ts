/** Fixed replies shared by the API route and the widget. */
export const chatCopy = {
  offTopic:
    "I'm just here to chat about Juan's work, so I'll have to skip that one. Happy to tell you about his projects, the teams he's led or the tech he works with, though!",
  failure: "Sorry, something went wrong on my side. Give it another try, or feel free to email Juan.",
  busy: "I'm a bit swamped right now. Try again in a minute, or feel free to email Juan.",
  limit:
    "You've asked a lot of great questions! Let's take a short break. Try again in about 10 minutes, or email Juan directly.",
};

/** Conversation caps, enforced by the API and shown in the widget. */
export const chatLimits = {
  maxUserTurns: 10,
  maxUserChars: 1000,
  maxAssistantChars: 4000,
  maxBodyBytes: 32 * 1024,
};
