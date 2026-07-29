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
  "Resiliência é continuar trabalhando com foco mesmo quando os resultados demoram a aparecer.",
  "A transparência nas ações cria mais confiança e mais eficiência no trabalho coletivo.",
  "Peça ajuda sempre que precisar; a colaboração torna o trabalho mais leve e produtivo.",
  "Valorize a diversidade de opiniões, pois elas ajudam a encontrar soluções mais completas.",
  "Permita-se pausar e reavaliar prioridades para trabalhar com mais clareza.",
  "O cuidado com os detalhes faz a diferença em cada serviço prestado à sociedade.",
] as const;

export function getDailyMessageIndex(date = new Date()) {
  const dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  return [...dateKey].reduce((total, character) => total + character.charCodeAt(0), 0) % dailyMessages.length;
}

export function getDailyMessageByIndex(index: number) {
  return dailyMessages[index % dailyMessages.length];
}

export function getDailyMessage(date = new Date()) {
  const dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  const index = getDailyMessageIndex(date);

  return { date: dateKey, message: getDailyMessageByIndex(index) };
}
