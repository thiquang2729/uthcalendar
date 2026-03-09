const TelegramBot = require('node-telegram-bot-api');
const Setting = require('../models/Setting');

/**
 * Gửi thông báo qua Telegram
 * @param {string} message - Nội dung tin nhắn
 */
exports.sendNotification = async (message) => {
  try {
    const setting = await Setting.findOne();
    if (!setting) return;

    const { telegramBotToken, telegramChatId } = setting.automationConfig;
    if (!telegramBotToken || !telegramChatId) return;

    const bot = new TelegramBot(telegramBotToken);
    await bot.sendMessage(telegramChatId, message, { parse_mode: 'HTML' });
  } catch (error) {
    console.error('Lỗi gửi thông báo Telegram:', error.message);
  }
};
