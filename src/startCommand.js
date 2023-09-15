
import { translate } from './TranslateAppi18/i18nSetup.js';
import { UserModel } from './default/MongoModel.js';




async function createUserInMongo(userId, username) {
  try {
   await UserModel.create({
      userId: userId,
      username: username,
      textAnswer: 0,
      audioAnswer: 0,
      languageAssistent: 'rus',
      speakingRate: "1",
      dateAffiramtion:'07:00',
      statusPay: '',
      paymentID: '',
      paymentDate: '',
      onOffAssistent: 'off',
      paymentDateOut: null,
      imagineGeneration:0
    });
    console.log(`${username} - cоздан успешно`);
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function initCommand(ctx) {
  const userId = String(ctx.message.from.id);
  const LanCode=ctx.message.from.language_code
  const username = ctx.message.chat.username || 'пользователь';
  const lastname = ctx.message.chat.lastname || 'not lastname';
  try {
    const user = await UserModel.findOne({ userId });
    if (user) {
      const START_AGAIN=await translate(LanCode, "start_START_AGAIN")
      await ctx.reply(START_AGAIN);
    } else {
      await createUserInMongo(userId, username);
      // инфо о боте пользователю
      const START=await translate(LanCode, "start_START")
      await ctx.reply(START);
      console.log(lastname,username, 'создан успешно');
    }
  } catch (error) {
    console.error('Error in initCommand:', error);
    const START_ERROR=await translate(LanCode, "start_START_ERROR")
    await ctx.reply(START_ERROR);
  }
}





