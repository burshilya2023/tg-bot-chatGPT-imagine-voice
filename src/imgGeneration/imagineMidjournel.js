


export async function imagineMidjournel (ctx){
     // Парсим аргументы после команды
  const args = ctx.message.text.split(' ').slice(1).join(' ');
  // Проверяем, что аргументы (prompt) не пусты
  if (!args) {
    ctx.reply('Пожалуйста, введите ваш prompt для генерации картинки.');
    return;
  }
  // Ваш код для отправки данных на API и получения ответа
  try {
    const response = await axios.post('https://api.thenextleg.io/v2/imagine', {
      msg: args,
      ref: '',
      webhookOverride: '',
      ignorePrefilter: 'false'
    }, {
      headers: {accept: 'application/json', authorization: 'Bearer qwejkqwejl1j2eoi1j2eoi1'}
    });
    // Отправляем пользователю ответ от API
    ctx.reply(`Ответ от API: ${JSON.stringify(response.data)}`);
  } catch (error) {
    console.error(error);
    ctx.reply('Произошла ошибка при обработке вашего запроса.');
  }
}