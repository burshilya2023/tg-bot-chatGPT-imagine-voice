import { SettingLanguare, SettingSpeed } from "./const.js";
import { UserModel } from "./default/MongoModel.js";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
//.oneTime().resize() -for change size inline button
import i18n from 'i18n';
i18n.configure({
  locales: ['ru', 'en', 'ar', 'fr', 'pl', 'de'],
  directory: __dirname + '/locales',
  defaultLocale: 'en',
  objectNotation: true,
  autoReload: true, // Автоматическая перезагрузка файлов переводов
  syncFiles: true,  // Синхронизация файлов переводов
});





// ! команда Setting(кнопки выбора языка и скорости)
export async function settingCommand(ctx){
  const LanCode=ctx.message.from.language_code
  i18n.setLocale(LanCode || 'en')
  const settings_SETTINGS = i18n.__('settings_SETTINGS')
  const on = i18n.__('settings_on')
  const off = i18n.__('settings_off')
    try {
        await ctx.reply(settings_SETTINGS, {
          reply_markup: {
            inline_keyboard: 
            [
              SettingLanguare,
              SettingSpeed,
              [
              {text:on, callback_data:'on'},
              {text:off, callback_data:'off'}
              ],
          ],
          },
        })
      } catch (e) {
        console.log(`ERROR IN seting COMMAND`, e.message)
      }
} 
export async function setSpeakingRate(ctx) {
    const userId = String(ctx.from.id)
    const user = await UserModel.findOne({ userId })
    const speed = ctx.match[0]
    user.speakingRate = speed
    await user.save()
    await ctx.answerCbQuery(`SPEED AUDIO-${speed}`)
  }
  export async function setLanguage(ctx) {
    try {
      const userId = String(ctx.from.id);
      const selectedLanguage = ctx.match[0];
      const user = await UserModel.findOne({ userId });
      if (user) {
        user.languageAssistent = selectedLanguage;
        await user.save();
        await ctx.answerCbQuery(`You choice ${selectedLanguage}`);
      } else {
        await ctx.reply('Пользователь не найден в базе данных');
      }
    } catch (e) {
      console.log('ERROR IN action setLanguage', e.message);
    }
  }
  export async function onOffAssistent(ctx) {
    const userId = String(ctx.from.id)
    const user = await UserModel.findOne({ userId })
    try{
      if(user){
        //ctx.match - catch in  bot.action()
        const onOff = ctx.match[0]
        user.onOffAssistent = onOff
        await user.save()
        await ctx.answerCbQuery(`Assistent-${onOff}`)
      }
      else {
        await ctx.answerCbQuery(`извините, произашла ошибка, скоро мы ее починим`)
      }
    } catch(e){
      console.log(e.message)
    }

  }


  
