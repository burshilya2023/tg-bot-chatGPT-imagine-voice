import fs from 'fs'
import { parentPort } from 'worker_threads';

const engineId = 'stable-diffusion-xl-1024-v1-0';
const stable_diffusion512_v15 = 'stable-diffusion-512-v2-1';
const apiHost = 'https://api.stability.ai'; // Замените на реальный API хост, если не используете переменные среды
const url = `${apiHost}/v1/user/balance`;
const apiKey = 'sk-prHv8TdnggSel7V4GwFE1y31UVSzBpHO2cHO1owwWe5Nu4Jj'; // Замените на ваш реальный API ключ
if (!apiKey) {
  throw new Error('Missing Stability API key.');
}
const outputDirectory = './out';
if (!fs.existsSync(outputDirectory)) {
    fs.mkdirSync(outputDirectory);
  }

  
// Проверяем, что код выполняется как рабочий поток

  // Функция для генерации изображения
   export async function generateImage(text, userId) {
    try {
      const response = await fetch(
        `${apiHost}/v1/generation/${stable_diffusion512_v15}/text-to-image`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            text_prompts: [
              {
                text: text,
              },
            ],
            cfg_scale: 7,
            height: 512,
            width: 512,
            steps: 30,
            samples: 1,
          }),
        }
      );
      if (!response.ok) {
        throw new Error(`Non-200 response: ${await response.text()}`);
      }
      const responseJSON = await response.json();
      const image = responseJSON.artifacts[0];
      const filePath = `./out/${userId}_v1_txt2img_0.png`; 
      fs.writeFileSync(filePath, Buffer.from(image.base64, 'base64'));
      console.log('успех');
      return filePath;
    } catch (error) {
      console.error('Error:', error.message);
      return null;
    }
  }

// Проверяем, что код выполняется как рабочий поток
if (parentPort) {
  parentPort.on('message', async (task) => {
    // Прием задачи и отправка результата
    const result = await generateImage(task.text, task.userId);
    parentPort.postMessage(result);
  });
}



  export async function StableDiffusionBalance() {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });
  
      if (!response.ok) {
        throw new Error(`Non-200 response: ${await response.text()}`);
      }
  
      const balance = await response.json();
      console.log('Balance:', balance.credits);
      return balance.credits
      // Здесь вы можете выполнять дополнительные действия с балансом...
  
    } catch (error) {
      console.error('Error:', error.message);
    }
  }
  
  // Вызываем функцию для получения баланса
  


  // генерация каритнок через StableDiffusion
// bot.command('img', async (ctx) => {
//   const text = ctx.message.text.split(' ').slice(1).join(' ');
//   const userId = String(ctx.message.from.id);
//   if (!text) {
//     ctx.reply('Пожалуйста, введите ваш prompt для генерации картинки.');
//     return;
//   }
//    ctx.telegram.sendChatAction(ctx.chat.id, "upload_photo");
//   const filePath = await generateImage(text);
//   if (filePath) {
//     // Отправляем картинку в Telegram
//     await ctx.replyWithPhoto({ source: fs.createReadStream(filePath) });
//   } else {
//     ctx.reply('Произошла ошибка при генерации картинки.');
//   }
// });
