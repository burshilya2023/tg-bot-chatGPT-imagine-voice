import { unlink } from 'fs/promises'
import { UserModel } from './MongoModel.js';

// Ваша функция для команды /timeout
export const timeoutCommand = async (ctx) => {
  const userId = String(ctx.from.id);
  const user = await UserModel.findOne({ userId });
  try {
    if (user.statusPay === 'succeeded' && user.paymentDate) {
      let remainingTime;
      if (user.paymentDateOut === 30) {
        remainingTime = calculateRemainingTime(user.paymentDate, 30);
      } else if (user.paymentDateOut === 365) {
        remainingTime = calculateRemainingTime(user.paymentDate, 365);
      }

  
      ctx.reply(`Статус подписки: ✅ Оплачено.
Осталось времени использования бота: ${formatTime(remainingTime)}  /donation - если хотите помочь развитию бота.`);
    } else {
      ctx.reply('У вас нет активной оплаты. Чтобы получить доступ к боту, выполните оплату.');
    }
  } catch (error) {
    console.error('Error retrieving user data:', error);
    ctx.reply('Произошла ошибка при получении данных пользователя. Попробуйте позже.');
  }
}
// Функция для вычисления оставшегося времени оплаты
function calculateRemainingTime(paymentDate, paymentDateOut) {
  const currentDate = new Date();
         const endDate = new Date(paymentDate.getTime() + paymentDateOut * 24 * 60 * 60 * 1000);
          const remainingTimeInMilliseconds = endDate - currentDate;
  return remainingTimeInMilliseconds;
}

// Функция для форматирования времени в дни, часы и минуты
function formatTime(timeInMilliseconds) {
  const days = Math.floor(timeInMilliseconds / (24 * 60 * 60 * 1000));
             const hours = Math.floor((timeInMilliseconds % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((timeInMilliseconds % (60 * 60 * 1000)) / (60 * 1000));
  let formattedTime = '';
  if (days > 0) {
    formattedTime += `${days} дней `;
  }
  if (hours > 0) {
    formattedTime += `${hours} часов `;
  }
  formattedTime += `${minutes} минут`;
  return formattedTime;
}
export async function checkPaymentStatus(userId) {
  try {
    const user = await UserModel.findOne({ userId });
    if (user.paymentDate) {
      const currentDate = new Date();
      const paymentDate = new Date(user.paymentDate);
      let expirationDate;

      if (user.paymentDateOut === 30) {
        expirationDate = new Date(paymentDate.getTime() + 30 * 24 * 60 * 60 * 1000);
      } else if (user.paymentDateOut === 365) {
        expirationDate = new Date(paymentDate.getTime() + 365 * 24 * 60 * 60 * 1000);
      }

      if (currentDate >= expirationDate) {
        user.statusPay = 'pending';
        await user.save();
        console.log('Статус оплаты обновлен на "pending"');
      }
    }
  } catch (error) {
    console.error('Error checking payment status:', error);
  }
}
export async function removeFile(path) {
  try {
    await unlink(path)
  } catch (e) {
    console.log('Error while removing file', e.message)
  }
}




























// //?PAY BOTS
// bot.command('paysber',async (ctx) => {  // это обработчик конкретного текста, данном случае это - "pay"
//   const userId = String(ctx.message.from.id)
//   return ctx.replyWithInvoice(getInvoice(userId)) //  метод replyWithInvoice для выставления счета  
// })
// bot.on('pre_checkout_query', (ctx) => ctx.answerPreCheckoutQuery(true)) // ответ на предварительный запрос по оплате

// bot.on('successful_payment', async (ctx) => { // ответ в случае положительной оплаты
//   const userId = String(ctx.message.from.id)
//   const user = await UserModel.findOne({ userId: userId });
//   user.pay=true
//   await user.save();
//   await ctx.reply('SuccessfulPayment, оплата прошла успешно, /info для проверки статуса подписки')
// })

// bot.command('pay1', async (ctx)=>{
//   const userId = String(ctx.message.from.id)
//   ChangePayOnTrue(userId)
//   await ctx.reply('Поздравляю с покупкой бота, проверте статус командйо /info')
// })