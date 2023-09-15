import { readFileSync } from 'fs'
import  jwt  from 'jsonwebtoken'
import {dirname, resolve} from 'path'
import {fileURLToPath} from 'url'
import axios from 'axios'
import { UserModel } from './MongoModel.js'
const __dirname = dirname(fileURLToPath(import.meta.url))
class TextConverter{
   async getToken(){
        const key = JSON.parse(
            readFileSync(resolve(__dirname, '../../google-cloud.json'), "utf-8")
        )
        const token =  jwt.sign(
            {
              iss: key.client_email,
              scope: 'https://www.googleapis.com/auth/cloud-platform',
              aud: 'https://www.googleapis.com/oauth2/v4/token',
              exp: Math.floor(Date.now() / 1000) + 60 * 60,
              iat: Math.floor(Date.now() / 1000),
            },
            key.private_key,
            { algorithm: 'RS256' }
          )
      const response=  await  axios.post(
            'https://www.googleapis.com/oauth2/v4/token',
            {
              grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
              assertion: token,
            }
          )       
            return response.data.access_token
    }
    async textToSpeech(text, ctx) {
       const userId = String(ctx.message.from.id)
       const user = await UserModel.findOne({ userId: userId });
       if(!text){
        return
       }

       const resultSpeakingRate = () => ({
        "1": 1,
        "1.2": 1.2,
        "1.5": 1.5,
        "1.75": 1.75
      }[user.speakingRate] || 2);

        try {
          const url = 'https://texttospeech.googleapis.com/v1/text:synthesize'
          const data = {
            input: { text },
            voice: {
              languageCode: `${user.languageAssistent==='rus' ? 'ru-RU':'en-US'}`,
              name: `${user.languageAssistent==='rus' ? 'ru-RU-Wavenet-D':'en-US-Studio-M'}`,
            },
            audioConfig: { 
              audioEncoding: 'MP3',
              pitch: 2,
              speakingRate: resultSpeakingRate()
            },
          }
    

          //!google does not accept text more than 400-500, so I broke it into chunks
          // Processing for long text
          const maxTextLength = 400; // Maximum text length per request (approximate value)

          if (text.length > maxTextLength) {
            const textChunks = [];
            for (let i = 0; i < text.length; i += maxTextLength) {
              textChunks.push(text.slice(i, i + maxTextLength));
            }

            const audioChunks = [];
            for (const chunk of textChunks) {
              data.input.text = chunk; // Обновляем текст для каждой части
              const accessToken = await this.getToken();

              const response = await axios({
                url,
                method: 'POST',
                data,
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  'Content-Type': 'application/json',
                },
              });

              const audio = Buffer.from(response.data.audioContent, 'base64');
              audioChunks.push(audio);
            }

            const concatenatedAudio = Buffer.concat(audioChunks);
            const audio = {
              source: concatenatedAudio
            };

            await ctx.sendAudio(audio, {
              title: '🔊',
              performer: `${text}`
            });
          }
          // Processing of short texts
          else {
            const accessToken = await this.getToken();

            const response = await axios({
              url,
              method: 'POST',
              data,
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
            });

            const audio = Buffer.from(response.data.audioContent, 'base64');

            await ctx.sendAudio({
              source: audio
            }, {
              title: '🔊',
              performer: `${text}`
            });
          }

        } catch (e) {
          ctx.reply('текст слишком длинный, что бы его перевести');
          console.error('Error while text2Speech', e.message);
        }
      }
    }

export const textConverter= new TextConverter()
