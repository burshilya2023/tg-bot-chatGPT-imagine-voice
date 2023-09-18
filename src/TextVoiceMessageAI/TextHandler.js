import { UserModel } from "../default/MongoModel.js";
import { openai } from "../default/openaiApi.js";
import { textConverter } from "../default/GoogleGloudVoiceAnswer.js";
import { translate } from "../TranslateAppi18/i18nSetup.js";
import cron from 'node-cron'
// этот код решает проблему вывода программного кода пользоватлю, так как Telegraf при отправки сообщения пользователю получал ошибку Bad Request: can't parse entities: Unsupported start tag "=" at byte offset 301
// textStr.replace(/([\#\*\|\~\=\.\\\-\{\}\(\)\!])/g, '\\$1');
export const cleanSpecialSymbols = (textStr) => textStr.replace(/([#*|~=.\-{}()!+<>])/g, '\\$1');
const MAX_FREE_TEXT_REQUESTS = 100;
const userContexts = {}; // Инициализируем объект для хранения контекста пользователей
const lastMessageTimes = {}; // Хранение времени последнего сообщения
const userLocks = {}; // Объект для хранения блокировок пользователей
export async function textHandler(ctx) {
  let typingInterval;
  const userId = String(ctx.message.from.id);
  const LanCode=ctx.message.from.language_code
  const firshName=ctx.message.from.first_name
  const user = await UserModel.findOne({ userId });
  try  {
   
    if(ctx.message.text.length>100){
        ctx.reply('отправлять сообщение(текст больше 100 символов) можно только после покупки, @ilya_bursh, напишите мне по поводу покупки бота')
        return
    }

   // Проверяем, заблокирован ли пользователь, если да, то сказать подождать
   if (userLocks && userLocks[userId]) {
    const responseDelayNotification = await translate(LanCode,'handler_responseDelayNotification')
    await ctx.reply(responseDelayNotification)
    return; 
  }
     // Проверяем время ожидания перед отправкой нового сообщения
     const lastMessageTime = lastMessageTimes[userId] || 0
     const currentTime = Date.now();
     const timeSinceLastMessage = (currentTime - lastMessageTime) / 1000
     if (timeSinceLastMessage < 8) {
      const timeToWait = 8- timeSinceLastMessage;
      const Waiting= await translate(LanCode, 'handler_WAITING_HANDLER')
      await ctx.telegram.sendMessage(
        userId,
        `${timeToWait.toFixed(2)} ${Waiting}`
      )
      return
    }

    const typing= await translate(LanCode,'handler_TYPING')
    // печатаю...
    await ctx.reply(typing)
    // Устанавливаем блокировку для пользователя
    const showTyping = async () => {
      typingInterval = setInterval(async () => {
        await ctx.telegram.sendChatAction(userId, "typing")
      }, 7000);
    };
    showTyping();
    await ctx.telegram.sendChatAction(userId, "typing")
    userLocks[userId] = true
   // Проверяем, существует ли контекст для данного пользователя
   if (!userContexts[userId]) {
    userContexts[userId] = [];
  }
  // Получите контекст текущего пользователя и проверьте на превышение 20 объектов
  const userContext = userContexts[userId];
  if (userContext.length >= 20) {
    userContext.splice(0, 10); // Удалить первые 10 объектов, что бы не хранить много контекста
  }

  userContext.push({ role: 'user', content: ctx.message.text });


    const response = await openai.chatGPT(userContext)
    if(response===undefined){
      const WAITING_ERROR_429=await translate(LanCode,'handler_WAITING_ERROR_429')
      ctx.reply(WAITING_ERROR_429)
      return
    }
    userContext.push({ role: 'assistant', content: response.content });
    if(!user.dayTextAnswer){
      await UserModel.updateOne({ userId: userId }, { imagineGeneration: 0 });
      console.log(`${userId}: dayTextAnswer поле было добавлено`  );

    }
      if (user.dayTextAnswer < 20 || user.statusPay === 'succeeded') {
          //  parse_mode в 'MarkdownV2', что означает, что текст в сообщении будет интерпретироваться как Markdown-разметка, позволяя стилизовать текст с использованием Markdown-синтаксиса и программный код будет моноширным
          await ctx.replyWithHTML(cleanSpecialSymbols(response.content), { parse_mode: 'MarkdownV2' })
        user.textAnswer += 1;
        user.dayTextAnswer+=1;
        await user.save();
        if (user.onOffAssistent === 'on') {
          try {
            await textConverter.textToSpeech(response.content, ctx);
          } catch(e) {
            console.log('ошибка в texthandler при обработки аудио',e.message);
            const LONG_AUDIO_ERROR=await translate(LanCode,'handler_LONG_AUDIO_ERROR')
            await ctx.reply(LONG_AUDIO_ERROR)
          }
        }
      } 
      else {
        const handler_PAY_LIMIT=await translate(LanCode, "handler_PAY_LIMIT")
        await ctx.reply(handler_PAY_LIMIT)
      }
      // !блокировка на новые сообщения(>8sec)
      lastMessageTimes[userId] = currentTime;
      userLocks[userId] = false;
      clearInterval(typingInterval);
      console.log(`язык-${LanCode} ${userId}-${user.dayTextAnswer}: бот ответил успешно`);
    } 
  catch (e) {
    console.error(`ERROR IN TEXT HANDLER`, e.message);
    const ERROR_IN_HANDLER=await translate(LanCode,"handler_ERROR_IN_HANDLER")
    await ctx.reply(ERROR_IN_HANDLER);
    userLocks[userId] = false;
    clearInterval(typingInterval);
  } 
}

  // Функция для обнуления imagineGeneration у всех пользователей
  const resetDayTextAnswerGeneration = async () => {
    try {
      // Найдите всех пользователей в базе данных
      const users = await UserModel.find();
  
      // Обнулите imagineGeneration для каждого пользователя
      for (const user of users) {
        user.dayTextAnswer = 0;
        await user.save();
      }
      
      console.log('Счетчики dayTextAnswer обнулены для всех пользователей.');
    } catch (error) {
      console.error('Ошибка при обнулении счетчиков dayTextAnswer:', error);
    }
  };
  
  // Запускайте функцию каждый день в определенное время (например, в полночь)
  cron.schedule('0 0 * * *', resetDayTextAnswerGeneration);
  