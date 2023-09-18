import { Markup } from "telegraf"
import { translate } from "./TranslateAppi18/i18nSetup.js"
export async function donationCommand(ctx) {
   
    const LanCode = ctx.message.from.language_code

    const PAY_QIWI =await translate(LanCode,'donation_PAY_QIWI')
    const DONAT_INFO = await translate(LanCode,'donation_DONAT_INFO')
    const linkButton = Markup.button.url(PAY_QIWI, 'https://boosty.to/artificial_intelligence_bot')
    ctx.reply(DONAT_INFO, Markup.inlineKeyboard([[linkButton]]))
  }
  
