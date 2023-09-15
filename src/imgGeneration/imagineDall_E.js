import { openai } from "../default/openaiApi.js";


export async function imagineDall_E (ctx){
    try {
        const userPrompt = ctx.message.text.split(' ').slice(1).join(' ');
        if (!userPrompt) {
          ctx.reply('Пожалуйста, укажите свой prompt после команды /imagine');
          return;
        }
        await ctx.telegram.sendChatAction(ctx.chat.id, "upload_photo");
             const ress= await openai.imagine(userPrompt);
            await ctx.replyWithPhoto(ress)
      } catch (error) {
        console.error(error);
        ctx.reply('Произошла ошибка при генерации изображения.');
      }
}
