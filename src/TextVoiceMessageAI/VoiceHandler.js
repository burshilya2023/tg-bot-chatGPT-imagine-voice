
import { UserModel } from "../default/MongoModel.js";
import { openai } from "../default/openaiApi.js";
import { ogg } from "../default/Mp3Converter.js";
import { removeFile } from "../default/utils.js";
import { textConverter } from "../default/GoogleGloudVoiceAnswer.js";
import moment from 'moment';


import { translate, translateEndFreeQuestions } from "../TranslateAppi18/i18nSetup.js";

export const rateLimit = {};

export function setRateLimit(userId) {
    rateLimit[userId] = moment();
}



const MAX_FREE_AUDIO_REQUESTS = 105;
export const INITIAL_SESSION = {
  messages: [],
};
export async function voiceHandler(ctx) {
  let typingInterval;
  const userId = String(ctx.message.from.id);
  const LanCode=ctx.message.from.language_code      
  const user = await UserModel.findOne({ userId });
  const freeAudioRequestsLeft = user.audioAnswer < MAX_FREE_AUDIO_REQUESTS;
    const isUserPaid = user.statusPay;
  ctx.session = ctx.session || INITIAL_SESSION;

  try {
    if (!ctx.session[userId]) {
      ctx.session[userId] = { messages: [] };
    }

    if (freeAudioRequestsLeft || isUserPaid == 'succeeded') {
      const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id);
      const oggPath = await ogg.create(link.href, userId);
      const mp3Path = await ogg.toMp3(oggPath, userId);
      removeFile(oggPath);
      const text = await openai.transcription(mp3Path);

      const typing= await translate(LanCode,"handler_TYPING")
      await ctx.reply(typing)
      const startTime = moment();
      const showTyping = () => {
        typingInterval = setInterval(async () => {
          await ctx.telegram.sendChatAction(ctx.chat.id, "typing");
          if (rateLimit[userId] && moment().diff(rateLimit[userId], 'milliseconds') < 10000) {
            const Waiting= await translate(LanCode,"handler_WAITING_1OSEC")
            await ctx.reply(Waiting);
            return;
          }
        }, 6900);
      };

      showTyping();
      const AUDIO_REQUEST=await translate(LanCode,"handler_AUDIO_REQUEST")
      await ctx.reply(`${AUDIO_REQUEST} ${text}`);
      await ctx.telegram.sendChatAction(ctx.chat.id, "typing");
      ctx.session[userId].messages.push({
        role: openai.roles.USER,
        content: text,
      });
      const response = await openai.chatGPT(ctx.session[userId].messages);
      const endTime = moment();
      const responseTime = endTime.diff(startTime, 'milliseconds') / 1000;
      await ctx.reply(response.content);
      console.log(`${user.username=='пользователь' ? userId: user.username},-задал голосовой ${text} вопрос в ${startTime}, время ответа${responseTime}сек`);
      if (user.onOffAssistent === 'on') {
        await textConverter.textToSpeech(response.content, ctx);
      }
      user.audioAnswer += 1;
      await user.save();
      ctx.session[userId].messages.push({
        role: openai.roles.ASSISTANT,
        content: response.content,
      });
    } else {
      // уведомление о лимите сообщений и оплате
     await translateEndFreeQuestions(ctx)
    }
  } 
  catch (e) {
    console.error(`ERROR IN TEXT HANDLER`, e.message);
    const ERROR_IN_HANDLER=await translate(LanCode,"handler_ERROR_IN_HANDLER")
    await ctx.reply(ERROR_IN_HANDLER);
  }
  finally {
    clearInterval(typingInterval);
    setRateLimit(userId)
  }
}
