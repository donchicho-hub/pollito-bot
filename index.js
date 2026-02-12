const fs = require('fs');

const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Events,
  EmbedBuilder
} = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// 🔧 CONFIGURACIÓN
const BUTTON_CHANNEL_ID = '1470936514463662354';
const STATUS_CHANNEL_ID = '1470980480055775242';
const COOLDOWN_MINUTES = 30;

const cooldowns = new Map();
const BUTTON_DATA_FILE = './button.json';

client.once(Events.ClientReady, async () => {
  console.log(`🐥 Pollito está vivo como ${client.user.tag}`);

  const buttonChannel = await client.channels.fetch(BUTTON_CHANNEL_ID);
  if (!buttonChannel) return console.log('❌ Canal botón no encontrado');

  const button = new ButtonBuilder()
    .setCustomId('solicitar_abrir_server')
    .setLabel('🟩 Solicitar abrir servidor')
    .setStyle(ButtonStyle.Success);

  const row = new ActionRowBuilder().addComponents(button);

  let buttonMessageId = null;

  // 🔍 1️⃣ Revisar si ya existe archivo guardado
  if (fs.existsSync(BUTTON_DATA_FILE)) {
    const data = JSON.parse(fs.readFileSync(BUTTON_DATA_FILE));
    buttonMessageId = data.messageId;

    try {
      await buttonChannel.messages.fetch(buttonMessageId);
      console.log('✅ Botón ya existe, no se crea otro.');
      return;
    } catch {
      console.log('⚠️ El botón guardado ya no existe, se creará uno nuevo.');
    }
  }

  // 2️⃣ Si no existe, crear botón
  const sentMessage = await buttonChannel.send({
    content: '🐥 **¿Quieres que se abra el servidor de Aternos?**\nPresiona el botón de abajo 👇',
    components: [row]
  });

  // 💾 Guardar ID del mensaje
  fs.writeFileSync(BUTTON_DATA_FILE, JSON.stringify({
    messageId: sentMessage.id
  }));

  console.log('✅ Botón creado y guardado correctamente.');
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isButton()) return;
  if (interaction.customId !== 'solicitar_abrir_server') return;

  const userId = interaction.user.id;
  const now = Date.now();
  const cooldownTime = COOLDOWN_MINUTES * 60 * 1000;

  if (cooldowns.has(userId)) {
    const lastTime = cooldowns.get(userId);
    const remaining = cooldownTime - (now - lastTime);

    if (remaining > 0) {
      const minutes = Math.ceil(remaining / 60000);

      const cooldownEmbed = new EmbedBuilder()
        .setColor(0x5DADE2)
        .setTitle('🔔 Ya hiciste una solicitud')
        .setDescription(`Debes esperar antes de volver a solicitar.\n\n⏳ Intenta nuevamente en **${minutes} minutos**.`)
        .setFooter({ text: 'Pollito • ChichoVerse Server' })
        .setTimestamp();

      return interaction.reply({
        embeds: [cooldownEmbed],
        flags: 64
      });
    }
  }

  cooldowns.set(userId, now);

  const statusChannel = await client.channels.fetch(STATUS_CHANNEL_ID);

  const embed = new EmbedBuilder()
    .setColor(0x57F287)
    .setTitle('🐥 Solicitud recibida')
    .addFields(
      { name: '👤 Usuario', value: `${interaction.user}`, inline: false },
      { name: '🔔 Estado', value: 'Esperando que abra el servidor', inline: false }
    )
    .setFooter({ text: 'Pollito • ChichoVerse Server' })
    .setTimestamp();

  await statusChannel.send({
    content: '@here',
    embeds: [embed]
  });

  await interaction.reply({
    content: '✅ Tu solicitud fue enviada correctamente.',
    flags: 64
  });
});

client.login(process.env.TOKEN);
