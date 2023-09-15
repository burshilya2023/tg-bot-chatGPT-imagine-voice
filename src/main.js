import cors from 'cors'
import dotenv from 'dotenv';
import express  from 'express'
import mongoose from 'mongoose'
import { message } from 'telegraf/filters'
import { UserModel } from './default/MongoModel.js'
import { initCommand } from './startCommand.js'
import { textHandler } from './TextVoiceMessageAI/TextHandler.js'
import { voiceHandler } from './TextVoiceMessageAI/VoiceHandler.js'
import { imagineDall_E } from './imgGeneration/imagineDall_E.js'
import { accountCommand } from './account.js'
import { timeoutCommand } from './default/utils.js'
import { donationCommand } from './donation.js'
import { Telegraf,session } from 'telegraf'
import { imagineMidjournel } from './imgGeneration/imagineMidjournel.js'
import { buybotCommand, returnBuy } from './BuyBot.js'
import { StableDiffusion, StableDiffusionBalance } from './imgGeneration/StableDiffusion.js'
import { onOffAssistent, setLanguage, setSpeakingRate, settingCommand } from './settingCommand.js'
import { translate, translateCooperationCommand, translateInfoCommand } from './TranslateAppi18/i18nSetup.js'
import { stripePay1Year, stripePay1month, stripePayCommand, stripeStatusPay } from './StripeUkassa/Stripe.js'
import { UkassaPaymentCommand,  statusUkassa, ukassaPay1Year, ukassaPay1month } from './StripeUkassa/Ukassa.js'
dotenv.config();
const PORT = process.env.PORT || 8080;
mongoose.connect(process.env.MONGO_DB, { useNewUrlParser: true, useUnifiedTopology: true })



const app = express()
app.use(express.json())    
app.use(cors());
const bot = new Telegraf(process.env.TELEGRAM_TOKEN_DEV);
bot.use(session())
// !main command
// узнать колво пользователей
bot.command('getusers', async (ctx) => {
  try {
    const users = await UserModel.find(); // Ищем всех пользователей
    const long=users.length
    const totalTextAnswers = users.reduce((total, user) => total + user.textAnswer, 0);
    const totalaudioAnswer = users.reduce((total, user) => total + user.audioAnswer, 0);
    StableDiffusionBalance()
     const balanceStDif= await StableDiffusionBalance()
    await ctx.reply(`всего ${long} пользователей, и текстовых сообщений ${totalTextAnswers} аудио${totalaudioAnswer} и ${balanceStDif} баланс картинок`)
  } catch (error) {
    console.error('Ошибка при поиске пользователей:', error);
  }
});
bot.command('start', initCommand)
bot.command('account', accountCommand)
bot.command('info', translateInfoCommand)
bot.command('cooperation', translateCooperationCommand)
bot.command('donation',donationCommand);
// !settings
bot.command('settings', settingCommand);
bot.action(/^(1|1\.2|1\.5|1\.75|2)$/, setSpeakingRate);
bot.action(/^(rus|eng)$/, setLanguage);
bot.action(/^(on|off)$/, onOffAssistent);
bot.action('back', async(ctx)=>{ctx.editMessageText('жду ваших вопросов..')})
// !buybot
bot.command('buybot', buybotCommand);
bot.command('timeout', timeoutCommand)
bot.action('returnPay',stripePayCommand )
bot.action('return_pay', async(ctx)=>{
  const LanCode=ctx.update.callback_query.from.language_code
  const RETURN_BUY=await translate(LanCode, "RETURN_BUY")
  ctx.editMessageText(RETURN_BUY)
} )
bot.action('returnbuybot', (ctx)=> returnBuy(ctx)  ); 
//!stripe action
bot.action('stripe',stripePayCommand)
bot.action('status_stripe', stripeStatusPay)
bot.action('stripePay1Month', stripePay1month)
bot.action('stripePay1Year', stripePay1Year)
//!ukassa acion
bot.action('ukassa', UkassaPaymentCommand)
bot.action('statusUkassa', statusUkassa)
bot.action('ukassaPay1Month', ukassaPay1month)
bot.action('ukassaPay1Year', ukassaPay1Year)
// !imagine generation
// генерация картинок через OpenAi(доргое и плохо)
bot.command('imagineDall_E',imagineDall_E);
//генерация картинок по midjournel(НУЖЕН ТОКЕН 40$)
bot.command('imgMidj',imagineMidjournel);
// генерация каритнок через StableDiffusion(дешего и хорошо)
bot.command('imagine', StableDiffusion);





// //!обработчик событий текста в чате(взаимодействие с CHAT GPT и googleCloud асистентом)
  bot.on(('text'), async (ctx) => {
    try {
      textHandler(ctx); // Вызываем обработчик
    } catch (error) {
      console.error(error);
      ctx.reply('Произошла ошибка при обработке сообщения.');
    }
  });
//!обработчик событий аудио в чате(взаимодействие с CHAT GPT и googleCloud асистентом)
bot.on(message('voice'), voiceHandler)
app.listen(PORT, () => console.log('server started on PORT ' + PORT))
bot.launch();
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
