import fs from 'fs'
import { UserModel } from '../default/MongoModel.js';
import dotenv from 'dotenv';
import { translate } from '../TranslateAppi18/i18nSetup.js';
import cron from 'node-cron'


dotenv.config();
// дешевый генератор
const stable_diffusion512_v15 = 'stable-diffusion-512-v2-1';
// дорогой генератор
const engineId = 'stable-diffusion-xl-1024-v1-0';
const apiHost = 'https://api.stability.ai'; 
const url = `${apiHost}/v1/user/balance`;
const outputDirectory = './out';
if (!fs.existsSync(outputDirectory)) {
    fs.mkdirSync(outputDirectory);
  }
 export async function StableDiffusion(ctx) {

  const text = ctx.message.text.split(' ').slice(1).join(' ');
  const LanCode = ctx.message.from.language_code;
  const userId = String(ctx.message.from.id);
  const user = await UserModel.findOne({ userId });
    try {
      if(!user.imagineGeneration){
        await UserModel.updateOne({ userId: userId }, { imagineGeneration: 0 });
      }
      if (!text) {
        const imagine_PROMT= await translate(LanCode, "imagine_PROMT")
       await ctx.reply(imagine_PROMT);
        return;
      }
      if(user.imagineGeneration>5){

        const FRE_IMAGINE= await translate(LanCode,"FRE_IMAGINE")
       await ctx.reply(FRE_IMAGINE)
        console.log(userId,'сделал 5 картинок');
        return
      }

      ctx.telegram.sendChatAction(ctx.chat.id, "upload_photo");
      const response = await fetch(
        `${apiHost}/v1/generation/${stable_diffusion512_v15}/text-to-image`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${process.env.STABLE_DIFFUSION}`,
          },
          body: JSON.stringify({
            text_prompts: [
              {
                text: text,
              },
            ],
            cfg_scale: 7,
            height: 512,
            width: 512,
            steps: 30,
            samples: 1,
          }),
        }
      );
      if (!response.ok) {
        throw new Error(`Non-200 response: ${await response.text()}`);
      }
      const responseJSON = await response.json();
      const image = responseJSON.artifacts[0]; // Берем первую сгенерированную картинку
      const filePath = `./out/v1_txt2img_0.png`;
      fs.writeFileSync(filePath, Buffer.from(image.base64, 'base64'));
      if(filePath){
          // Отправляем картинку в Telegram
            await ctx.replyWithPhoto({ source: fs.createReadStream(filePath) });
            user.imagineGeneration++
            user.save()
      } 
      else {
        // !translate(Lan)
        const imagine_ERROR=await translate(LanCode,"imagine_ERROR")
        ctx.reply(imagine_ERROR);
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
  }



  

  //balancse token my account
  export async function StableDiffusionBalance() {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.STABLE_DIFFUSION}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Non-200 response: ${await response.text()}`);
      }
      const balance = await response.json();

      return balance.credits
  
    } catch (error) {
      console.error('Error:', error.message);
    }
  }
  
  


  // Функция для обнуления imagineGeneration у всех пользователей
  const resetImagineGeneration = async () => {
    try {
      // Найдите всех пользователей в базе данных
      const users = await UserModel.find();
  
      // Обнулите imagineGeneration для каждого пользователя
      for (const user of users) {
        user.imagineGeneration = 0;
        await user.save();
      }
  
      console.log('Счетчики imagineGeneration обнулены для всех пользователей.');
    } catch (error) {
      console.error('Ошибка при обнулении счетчиков imagineGeneration:', error);
    }
  };
  
  // Запускайте функцию каждый день в определенное время (например, в полночь)
  cron.schedule('0 0 * * *', resetImagineGeneration);
  