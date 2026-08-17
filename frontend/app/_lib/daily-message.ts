import dailyMessagesJson from "../../data/daily-message.json";

const dailyMessages: string[] = dailyMessagesJson;

function getRandomIndex(): number {
  return Math.floor(Math.random() * dailyMessages.length);
}

export function getDailyMessageIndex(): number {
  return getRandomIndex();
}

export function getDailyMessageByIndex(index: number): string {
  if (dailyMessages.length === 0) {
    return "Tenha um excelente dia!";
  }

  return dailyMessages[index % dailyMessages.length];
}

export function getDailyMessage(date = new Date()) {
  const dateKey = `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

  const index = getDailyMessageIndex();

  return {
    date: dateKey,
    message: getDailyMessageByIndex(index),
  };
}