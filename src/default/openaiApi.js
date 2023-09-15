import { Configuration, OpenAIApi } from 'openai'
import { createReadStream } from 'fs'
import dotenv from 'dotenv';
dotenv.config();




class OpenAI {
  roles = {
    ASSISTANT: 'assistant',
    USER: 'user',
    SYSTEM: 'system',
  }


 
  constructor(apiKey) {
    const configuration = new Configuration({
      apiKey,
    })
    this.openai = new OpenAIApi(configuration)
  }
  async chatGPT(messages) {
    try {
      const response = await this.openai.createChatCompletion({
         model: 'gpt-3.5-turbo',
        messages,

      })
      return response.data.choices[0].message
    } catch (e) {
      console.log('Error while gpt chat', e.message)
    }
  }
    async imagine(prompt){
     const response= await this.openai.createImage({
        prompt:prompt,
        n:1,
        size:'512x512'
      })
      const resultImage=await response.data.data[0].url
      return resultImage    
    }

  async transcription(filepath) {
    try {
      const response = await this.openai.createTranscription(
        createReadStream(filepath),
        'whisper-1'
      )
      return response.data.text
    } catch (e) {
      console.log('Error while transcription', e.message)
    }
  }
}
export const openai = new OpenAI(process.env.OPEN_AI_KEY)





  //gpt-3.5-turbo-0301
 //gpt-3.5-turbo-16k
  //gpt-3.5-turbo