const fs = require('fs');
const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Events
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// ⚠️ CAMBIA ESTO POR EL ID DE TU CANAL
const CHANNEL_ID = "AQUI_EL_ID_DEL_CANAL";

client.once('ready', async () => {
  console.log(`🐥 Pollito está vivo como ${client.user.tag}`);

  const buttonChannel = await client.channels.fetch(CHANNEL_ID);
  if (!buttonChannel) return console.log("❌ Canal no encontrado");

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('abrir_servidor')
      .setLabel('🚀 Abrir Servidor')
      .setStyle(ButtonStyle.Success)
  );

  try {
    // 🔍 Buscar si ya existe un botón anterior
    const messages = await buttonChannel.messages.fetch({ limit: 20 });

    const existingMessage = messages.find(
      msg =>
        msg.author.id === client.user.id &&
        msg.components.length > 0
    );

    if (existingMessage) {
      console.log("✅ El botón ya existe, no se enviará otro.");
    } else {
      await buttonChannel.send({
        content: '🐥 **¿Quieres que se abra el servidor de Aternos?**\nPresiona el botón de abajo 👇',
        components: [row]
      });

      console.log("✅ Botón enviado al canal.");
    }

  } catch (error) {
    console.error("❌ Error al enviar/verificar botón:", error);
  }
});

// 🎯 Cuando alguien presiona el botón
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isButton()) return;

  if (interaction.customId === 'abrir_servidor') {
    await interaction.reply({
      content: '🚀 Iniciando servidor... (aquí va tu lógica de Aternos)',
      ephemeral: true
    });
  }
});

client.login(process.env.TOKEN);
