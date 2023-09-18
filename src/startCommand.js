import { translate } from './TranslateAppi18/i18nSetup.js';
import { UserModel } from './default/MongoModel.js';
import { join } from 'path'; 
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import NodeCache from 'node-cache';
import { readFile } from 'fs/promises';
import { setCommand } from './main.js';



const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);




async function createUserInMongo( userId, username ) {
  const userParams = {
    userId,
    username,
    textAnswer: 0,
    audioAnswer: 0,
    languageAssistent: 'rus',
    speakingRate: '1',
    dateAffiramtion: '07:00',
    statusPay: '',
    paymentID: '',
    paymentDate: '',
    onOffAssistent: 'off',
    paymentDateOut: null,
    imagineGeneration: 0,
    Language:LanCode,
    dayTextAnswer:0
  };

  try {
    await UserModel.create(userParams);
    console.log(`${username} - создан успешно`);
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}
async function getUserInfo(ctx) {
  const userId = String(ctx.message.from.id);
  const LanCode = ctx.message.from.language_code;
  const username = ctx.message.chat.username || 'пользователь';
  const START_ERROR = await translate(LanCode, "start_START_ERROR");
  const START_AGAIN = await translate(LanCode, "start_START_AGAIN");

  return { userId, LanCode, username, START_ERROR, START_AGAIN };
}

const imageCache = new NodeCache();
async function loadImage(filename) {
  const cachedImage = imageCache.get(filename);
  if (cachedImage) {
    return cachedImage;
  }
  // Если изображение не найдено в кеше, загрузите его и добавьте в кеш
  const imagePath = join(__dirname, 'default', 'img', filename);
  const imageBuffer =  await readFile(imagePath);
   imageCache.set(filename, imageBuffer);
  return imageBuffer;
}
export async function initCommand(ctx) {
  const { userId,LanCode, username, START_ERROR, START_AGAIN } = await getUserInfo(ctx);
  try {
    const mediaFiles = [
      'settings_text.png',
      'settings_audio.png',
      'imagine_promt.png',
    ];
    const MediaGroup = await Promise.all(mediaFiles.map(async (filename) => ({
      media: { source: await loadImage(filename) },
      type: 'photo',
      caption: '',
    })));
    ctx.telegram.sendChatAction(ctx.chat.id, "upload_photo");
    const user = await UserModel.findOne({ userId });
    if (!user) {
      await createUserInMongo(userId, username, LanCode);
      await ctx.reply('🥳 You are create sussces')
    }
    await ctx.replyWithMediaGroup(MediaGroup);
    await ctx.reply(START_AGAIN);
    await setCommand(ctx)
  } catch (error) {
    console.error('Error in initCommand:', error.message);
    await ctx.reply(START_ERROR);
  }
}




