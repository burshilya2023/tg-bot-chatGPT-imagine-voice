import { translate } from "./TranslateAppi18/i18nSetup.js";
import { UserModel } from "./default/MongoModel.js";

export async function accountCommand(ctx) {
  const { id: userId } = ctx.message.from;
  const user = await UserModel.findOne({ userId });
  const LanCode = ctx.message.from.language_code;

  // Получи переводы для необходимых ключей прямо внутри функции
  const answerVoiceTranslation = await translate(LanCode, "account_ANSWER_VOICE");
  const answerTextTranslation = await translate(LanCode, "account_ANSWER_TEKST");
  const accentAssistentTranslation = await translate(LanCode, "account_ACCENT_ASSISTENT");
  const speedAudioAnswerTranslation = await translate(LanCode, "account_SPEED_AUDIO_ANSWER");
  const audioAnswerOnOffTranslation = await translate(LanCode, "account_AUDIO_ANSWER_ON_OFF");
  const susscribeTranslation = await translate(LanCode, "account_SUSSCRIBE");
  const timeOutTranslation = await translate(LanCode, "account_TIME_OUT");

  await ctx.reply(`STATUS
     ${user.statusPay === 'succeeded' ? '✅ ' + susscribeTranslation + ' YES' : '❌ ' + susscribeTranslation + ' not payed'}
     🖼️image ${user.imagineGeneration}/5 in day
     ✉️ ${answerTextTranslation} ${user.dayTextAnswer}/20
    🎤 ${answerVoiceTranslation} ${user.audioAnswer}/105
    🗣️ ${accentAssistentTranslation} ${user.languageAssistent}
    🎧 ${speedAudioAnswerTranslation} ${user.speakingRate}
    🔊 ${audioAnswerOnOffTranslation} ${user.onOffAssistent === 'on' ? 'ON' : 'OFF'}
    💲  ${susscribeTranslation} ${user.statusPay === 'succeeded' ? `/timeout ${timeOutTranslation}` : '/buybot (free)'}
    `);
}
