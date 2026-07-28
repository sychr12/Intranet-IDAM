const dailyMessages = [
  "Um bom dia começa com gentileza, presença e disposição para fazer a diferença.",
  "Pequenos avanços, quando constantes, criam resultados que realmente importam.",
  "Compartilhar conhecimento torna o trabalho de toda a equipe mais forte.",
  "Faça o que está ao seu alcance hoje; o próximo passo fica mais claro depois.",
  "Escutar com atenção é uma das formas mais simples de construir boas soluções.",
  "Organização e colaboração transformam desafios em oportunidades de aprendizado.",
  "Reconheça cada conquista: elas ajudam a sustentar a motivação do caminho.",
  "Trabalhar com propósito é encontrar sentido também nas tarefas mais simples.",
  "Uma atitude respeitosa pode melhorar o dia de quem está ao seu redor.",
  "A criatividade aparece quando damos espaço para perguntas e novas ideias.",
  "Cuidar das relações também faz parte de construir bons resultados.",
  "Hoje é uma nova oportunidade para aprender, colaborar e evoluir.",
  "Planeje com calma, execute com atenção e celebre o que foi bem feito.",
  "O serviço público ganha força quando cada pessoa contribui com responsabilidade.",
] as const;

export function getDailyMessage(date = new Date()) {
  const dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  const index = [...dateKey].reduce((total, character) => total + character.charCodeAt(0), 0) % dailyMessages.length;

  return { date: dateKey, message: dailyMessages[index] };
}
