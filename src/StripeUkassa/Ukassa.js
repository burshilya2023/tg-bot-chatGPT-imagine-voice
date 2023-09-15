import { YooCheckout } from '@a2seven/yoo-checkout';
import { checkPaymentStatus, timeoutCommand } from '../default/utils.js';
import { UserModel } from '../default/MongoModel.js';
import { Markup } from 'telegraf';
import { payinfoMounthUkassa, payinfoYearUkassa } from '../const.js';
import dotenv from 'dotenv';
dotenv.config();
const YOO_KASSA_CONFIG = {
  shopId: '236017',
  secretKey: process.env.UKASSA_TOKEN_TEST,
  isTest: true,
};

const yooKassa = new YooCheckout(YOO_KASSA_CONFIG);

const createPayment = async (userId, orderAmount) => {
  const orderId = Math.floor(Math.random() * (10000 - 1 + 1)) + Date.now();
  const description = `Платеж от пользователя ${userId}`;
  
  const createPayload = {
    amount: { value: orderAmount, currency: 'RUB' },
    payment_method_data: { type: 'bank_card' },
    confirmation: { type: 'redirect', return_url: 'https://t.me/artificial_intelligenceGPT_bot' },
    capture: true,
    description,
  }; 
  
  return yooKassa.createPayment(createPayload, orderId);
};

const handlePayment = async (ctx, amount, description) => {
  try {
    const userId = String(ctx.update.callback_query.from.id);
    const payment = await createPayment(userId, amount);
    const paymentInfo = await yooKassa.getPayment(payment.id);
    const user = await UserModel.findOne({ userId });
    user.paymentID = payment.id;
    user.statusPay = paymentInfo.status;
    await user.save();
    
    
    if (paymentInfo.status === 'succeeded') {
      user.paymentDate = new Date();
       timeoutCommand(ctx);
      await user.save();
    } else {
      const paymentUrlUkassa = payment.confirmation.confirmation_url;
      const linkButton = Markup.button.url(`${amount} рос.руб 🇷🇺`, paymentUrlUkassa);
      const statusUkassa = Markup.button.callback(`статус оплаты 🔄`, 'statusUkassa');
      const returnPay = Markup.button.callback(`назад`, 'ukassa');
      ctx.editMessageText(`${description} 
      💳 данные тестовой карты:
      5555 5555 5555 4444
      12/28  123`, Markup.inlineKeyboard([[linkButton], [statusUkassa], [returnPay]]));
    }
  } catch (error) {
    console.error('Ошибка в функции handlePayment:', error);
    ctx.reply('Возникла ошибка, извините');
  }
};

export const UkassaPaymentCommand = async (ctx) => {
  const linkButton = Markup.button.callback(`1 месяц 350 рос.руб 🇷🇺`, 'ukassaPay1Month');
  const linkButton2 = Markup.button.callback(`12 месяцев 3500 рос.руб 🇷🇺`, 'ukassaPay1Year');
  const returnCallback = Markup.button.callback(`назад`, 'returnbuybot');
  const info = `Выберите продолжительность подписки.
  💳 данные тестовой карты:
  5555 5555 5555 4444
  12/28  123
  `;
  ctx.editMessageText(info, Markup.inlineKeyboard([[linkButton], [linkButton2], [returnCallback]]));
};

export async function ukassaPay1month(ctx) {
  const description = payinfoMounthUkassa;
  const paymentDateOut=30
  const userId = String(ctx.update.callback_query.from.id);
  const user = await UserModel.findOne({ userId });
   user.paymentDateOut=paymentDateOut
  await user.save()
  await handlePayment(ctx, 350, description,paymentDateOut);
}

export async function ukassaPay1Year(ctx) {
  const description = payinfoYearUkassa;
  const paymentDateOut=365
  const userId = String(ctx.update.callback_query.from.id);
  const user = await UserModel.findOne({ userId });
   user.paymentDateOut=paymentDateOut
  await user.save()
  await handlePayment(ctx, 3000, description, paymentDateOut);
}

export const statusUkassa = async (ctx) => {
  const userId = String(ctx.update.callback_query.from.id);
  const user = await UserModel.findOne({ userId });

  try {
    const paymentInfo = await yooKassa.getPayment(user.paymentID);
    const getStatus = paymentInfo.status;

    if (getStatus === 'succeeded') {
      const currentDate = new Date();
      user.paymentDate = currentDate; 
      ctx.editMessageText(`${getStatus} Огромное спасибо за подписку на нашего бота! 🤖🎉 Желаем вам море успехов в его использовании! 💪🚀. время оплаты:${user.paymentDate} /timeout - проверить оствашиейся время подписки. 
      /donation - если хотите помочь развитию бота.`);
      user.statusPay = getStatus;
      await user.save();
      await checkPaymentStatus(userId);
    } else {
      ctx.answerCbQuery(`💰СТАТУС ПЛАТЕЖА: ${getStatus.toUpperCase()}`);
      user.statusPay = getStatus;
      await user.save();
    }
  } catch (error) {
    console.error('Ошибка при получении информации о платеже:', error);
    ctx.answerCbQuery('Произошла ошибка при получении информации о платеже. Попробуйте позже.');
  }
};
