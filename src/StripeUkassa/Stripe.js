import Stripe from 'stripe';
import { UserModel } from '../default/MongoModel.js';
import { checkPaymentStatus } from '../default/utils.js';
import { Markup } from 'telegraf';
import dotenv from 'dotenv';
import { translate } from '../TranslateAppi18/i18nSetup.js';
dotenv.config();
const stripe = new Stripe(process.env.STRIPE_TOKEN_TEST, {
  apiVersion: '2022-11-15'
});

const createStripeSession = async (userId, priceId) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: priceId, // Идентификатор цены в Stripe
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: 'https://t.me/artificial_intelligenceGPT_bot',
      cancel_url: 'https://t.me/artificial_intelligenceGPT_bot',
    });
    await UserModel.findOneAndUpdate({ userId }, { paymentID: session.id });
    return session;
  } catch (error) {
    console.error('Ошибка при создании сессии оплаты:', error);
  }
};

const getStripePaymentStatus = async (sessionId) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return `${session.payment_status === 'paid' ? 'succeeded' : 'В обработке'}`;
  } catch (error) {
    console.error('Ошибка при проверке статуса покупки:', error);
    throw new Error('Произошла ошибка при проверке статуса покупки.');
  }
};



const stripePayCommand = async (ctx) => {
  const linkButton = Markup.button.callback(`1 месяц 3.5$`, 'stripePay1Month');
  const linkButton2 = Markup.button.callback(`12 месяцев 30$`, 'stripePay1Year');
  const returnCallback = Markup.button.callback(`назад`, 'returnbuybot');
    console.log('CTX IN STRIPEpAYcOMMAND',ctx);
  const STRIPE_INFO=translate(LanCode,"STRIPE_INFO")
  const info = `Выберите продолжительность подписки.
  💳 данные тестовой карты:
  5555 5555 5555 4444123
  12/28  123
  `;
  ctx.editMessageText(info, Markup.inlineKeyboard([[linkButton], [linkButton2], [returnCallback]]));
};

export async function stripePay1month(ctx) {
  const paymentDateOut=30
  const userId = String(ctx.update.callback_query.from.id);
  const user = await UserModel.findOne({ userId });
   user.paymentDateOut=paymentDateOut
  await user.save()
  await handleStripePayment(ctx,  'price_1NcrFOBAk5P4PWWUZZqTR3GY', 'Оплата бота на 30 дней');
}

export async function stripePay1Year(ctx) {
  const paymentDateOut=365
  const userId = String(ctx.update.callback_query.from.id);
  const user = await UserModel.findOne({ userId });
   user.paymentDateOut=paymentDateOut
  await user.save()

  await handleStripePayment(ctx,  'price_1Ncrg3BAk5P4PWWUjNwOcCBG', 'Оплата бота на 1 год');
}

const handleStripePayment = async (ctx,  priceId, description) => {
  const userId = String(ctx.update.callback_query.from.id);
  const session = await createStripeSession(userId, priceId);
  const url = session.url;
  const linkButton = Markup.button.url('оплатить', url);
  const payinfo = `${description}, нажмите на кнопку и перейдите на международную платежную систему Stripe. После оплаты проверьте статус оплаты 
  💳 данные тестовой карты:
  5555 5555 5555 4444
  12/28  123
  `;
  const statusStripe = Markup.button.callback(`статус оплаты 🔄`, 'status_stripe');
  const returnPay = Markup.button.callback(`назад`, 'stripe');
  ctx.editMessageText(payinfo, Markup.inlineKeyboard([[linkButton], [statusStripe], [returnPay]]));
}

const stripeStatusPay = async (ctx) => {
  const userId = String(ctx.update.callback_query.from.id);
  const user = await UserModel.findOne({ userId });

  if (!user) {
    ctx.answerCbQuery('Пользователь не найден в базе данных');
    return;
  }

  try {
    const paymentStatus = await getStripePaymentStatus(user.paymentID);

    if (paymentStatus === 'succeeded') {
      user.paymentDate = new Date();
      ctx.editMessageText(`Огромное спасибо за подписку на нашего бота! 🤖🎉 Желаем вам море успехов в его использовании! 💪🚀. время оплаты:${user.paymentDate}} /timeout - проверить оствашиейся время подписки. 
       /donation - если хотите помочь развитию бота.`);
      await checkPaymentStatus(userId);
    } else {
      ctx.answerCbQuery('ПЛАТЕЖ СОЗДАН И ЖДЕТ ОПЛАТЫ');
    }

    user.statusPay = paymentStatus;
    await user.save();
  } catch (error) {
    console.error('Ошибка при проверке статуса покупки:', error);
    ctx.answerCbQuery('Произошла ошибка при получении информации о платеже. Попробуйте позже.');
  }
};

export { stripePayCommand, stripeStatusPay };