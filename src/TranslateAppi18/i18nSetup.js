import { dirname } from 'path';
import { fileURLToPath } from 'url';
import i18n from 'i18n';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

i18n.configure({
  locales: ['ru', 'en', 'ar', 'fr', 'pl', 'de','uz'],
  directory: __dirname + '/../locales',
  defaultLocale: 'en',
  objectNotation: true,
  autoReload: true, // Автоматическая перезагрузка файлов переводов
  syncFiles: true,  // Синхронизация файлов переводов
});
//university fucntion (account, .., ..)
export  async function translate(LanCode,key ) {

  
  try {
    i18n.setLocale(LanCode || 'ru');
    return i18n.__(key);
  } catch (error) {
      console.log('ошибка в функции tranlate',error);
  }
    
  }

  // use in BuyBot.js
  export async function translateBuyBot (lang){
    const LanCode=lang
    i18n.setLocale(LanCode || 'en');
      const result = i18n.__('BUYBOT');
     return  result;
  }
    // use in BuyBot.js
    export async function translateStatusPay (ctx){
      const LanCode=ctx.message.from.language_code
      i18n.setLocale(LanCode || 'en');
        const result = await  i18n.__('STATUS_PAY');
       return  result;
    }


// !noy
    export async function translateInfoCommand(ctx) {
      const LanCode=ctx.message.from.language_code
      i18n.setLocale(LanCode || 'en');
        const result = i18n.__('INFO');
       await ctx.reply(`${result}`);
    }

    
  //main.js

  //main.js
  
// !noy
  export async function translateCooperationCommand(ctx) {
    const LanCode=ctx.message.from.language_code
     i18n.setLocale(LanCode || 'en');
       const result = i18n.__('OWNER');
       ctx.reply(`${result}`);
 }
 
// !noy
   // chatGPT catch(textHandler and voiceHandler)
   export async function translateEndFreeQuestions (ctx){
     const LanCode=ctx.message.from.language_code
     i18n.setLocale(LanCode || 'en');
       const result = i18n.__('PAY_LIMIT');
       ctx.reply(`${result}`);
   }
   // !other files
   // use in startCommand.js
   
// !noy
   export async function translateStartInfo (ctx){
     const LanCode=ctx.message.from.language_code
     i18n.setLocale(LanCode || 'en');
       const result = i18n.__('START');
       ctx.replyWithSticker(stikerHello);
      return await ctx.reply(`${result}`);
   }
 
 