import fs from 'fs'


// const engineId = 'stable-diffusion-xl-1024-v1-0';
const stable_diffusion512_v15 = 'stable-diffusion-512-v2-1';
const stable_diffusionxl_beta = 'stable-diffusion-xl-beta-v2-2-2';
const apiHost = 'https://api.stability.ai'; // Замените на реальный API хост, если не используете переменные среды
//burshilya2023
const url = `${apiHost}/v1/user/balance`;
const apiKey = 'sk-Iu90KL06LwDqDt73cFxtGbaXWnsWXRwRmSarWf70ERpowsMa'; // Замените на ваш реальный API ключ

if (!apiKey) {
  throw new Error('Missing Stability API key.');
}
const outputDirectory = './out';
if (!fs.existsSync(outputDirectory)) {
    fs.mkdirSync(outputDirectory);
  }
 export async function generateImage(text) {
    try {
      const response = await fetch(
        `${apiHost}/v1/generation/${stable_diffusionxl_beta}/text-to-image`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${apiKey}`,
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
    
      return filePath;
    } catch (error) {
      console.error('Error:', error.message);
      return null;
    }
  }

  export async function StableDiffusionBalance() {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });
  
      if (!response.ok) {
        throw new Error(`Non-200 response: ${await response.text()}`);
      }
  
      const balance = await response.json();
      console.log('Balance:', balance.credits);
      return balance.credits
      // Здесь вы можете выполнять дополнительные действия с балансом...
  
    } catch (error) {
      console.error('Error:', error.message);
    }
  }