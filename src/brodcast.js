import { translate } from "./TranslateAppi18/i18nSetup.js";
import { UserModel } from "./default/MongoModel.js";
import { bot } from "./main.js";
import dotenv from 'dotenv';
dotenv.config();
export async function Brodcast(ctx){

    const LanCode=ctx.message.from.language_code  
    if (ctx.from.id == process.env.MY_ID) {

      const descr=await translate(LanCode, 'BRODCAST')

        const users = await UserModel.find();
        // Функция для отправки сообщения пользователю с задержкой
        ctx.reply('отправка началась')
        const sendMessageWithDelay = async (user) => {
          try {
            await bot.telegram.sendMessage(user.userId, descr);
          } catch (error) {
             console.error(`Ошибка при отправке сообщения пользователю ${user.userId}: ${error.message}`);
          }
        };
        // Отправьте сообщение каждому пользователю с задержкой
        for (const user of users) {
          await sendMessageWithDelay(user);
          // Добавьте задержку в 1 секунду перед отправкой следующего сообщения
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
      await ctx.reply('Массовое сообщение отправлено');
      } else {
        ctx.reply('Вы не имеете доступа к этой команде.');
      }
}