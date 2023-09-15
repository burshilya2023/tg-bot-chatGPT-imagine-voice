import { translateBuyBot, translateStatusPay } from "./TranslateAppi18/i18nSetup.js";
import { UserModel } from "./default/MongoModel.js";
import { Markup } from 'telegraf';


export const buybotCommand = async (ctx) => {
  const linkButton = Markup.button.callback('оплата в рос.рублях 🇷🇺', `ukassa`);
  const linkButton2 = Markup.button.callback('оплата $ картой 💰', `stripe`);
  const linkButton3 = Markup.button.callback('отменна', 'return_pay')
  const userId = String(ctx.message.from.id);
  const user = await UserModel.findOne({ userId });
  if (user.statusPay==='succeeded') {
    const result= await translateStatusPay(ctx)
    await ctx.reply(result)
  } else{
    ctx.reply(
      await translateBuyBot(ctx),
      Markup.inlineKeyboard([[linkButton], [linkButton2],[linkButton3]])
      );
    }
  };
export async function returnBuy(ctx){
  const lang=ctx.update.callback_query.from.language_code
  const linkButton = Markup.button.callback('Ukassa RUB 🇷🇺', `ukassa`);
  const linkButton2 = Markup.button.callback('stripe $ 💵', `stripe`);
  const linkButton3 = Markup.button.callback('back', 'return_pay')
  ctx.editMessageText(
  await translateBuyBot(lang),
    Markup.inlineKeyboard([[linkButton], [linkButton2], [linkButton3]])
  ); 
}