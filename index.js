require('dotenv').config();

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
const BUTTON_CHANNEL_ID = '1470936514463662354'; // 📩 abrir-servidor
const STATUS_CHANNEL_ID = '1470980480055775242'; // 📩 estatus-servidor
const COOLDOWN_MINUTES = 30;

// 🧠 Memoria simple para cooldowns
const cooldowns = new Map();

client.once(Events.ClientReady, async () => {
  console.log(`🐥 Pollito está vivo como ${client.user.tag}`);

  try {
    const buttonChannel = await client.channels.fetch(BUTTON_CHANNEL_ID);
    if (!buttonChannel) return console.log('❌ No encontré el canal del botón');

    const button = new ButtonBuilder()
      .setCustomId('solicitar_abrir_server')
      .setLabel('🟩 Solicitar abrir servidor')
      .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder().addComponents(button);

    await buttonChannel.send({
      content: '🐥 **¿Quieres que se abra el servidor de Aternos?**\nPresiona el botón de abajo 👇',
      components: [row]
    });

    console.log('✅ Botón enviado al canal abrir-servidor');
  } catch (err) {
    console.error('❌ Error enviando el botón:', err);
  }
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isButton()) return;
  if (interaction.customId !== 'solicitar_abrir_server') return;

  const userId = interaction.user.id;
  const now = Date.now();
  const cooldownTime = COOLDOWN_MINUTES * 60 * 1000;

  // 🔵 Cooldown
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
        ephemeral: true
      });
    }
  }

  cooldowns.set(userId, now);

  // 🟢 Embed verde que va al canal de estatus
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

  // Confirmación privada en canal del botón
  await interaction.reply({
    content: '✅ Tu solicitud fue enviada correctamente.',
    ephemeral: true
  });
});

// 🔑 LOGIN SIEMPRE AL FINAL
client.login(process.env.TOKEN);
