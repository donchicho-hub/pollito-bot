const { 
  Client, 
  GatewayIntentBits, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  EmbedBuilder 
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages
  ]
});

const TOKEN = process.env.TOKEN;

const CHANNEL_BOTON_ID = "1470936514463662354";
const CHANNEL_SOLICITUDES_ID = "1470980480055775242";

const cooldowns = new Map();
const COOLDOWN_TIME = 30 * 60; // 30 minutos

client.once("clientReady", async () => {
  console.log(`🐥 Bot activo como ${client.user.tag}`);

  const channel = await client.channels.fetch(CHANNEL_BOTON_ID);
  if (!channel) return console.log("❌ Canal botón no encontrado.");

  const messages = await channel.messages.fetch({ limit: 10 });

  const alreadyExists = messages.some(msg =>
    msg.components.length > 0 &&
    msg.components[0].components[0].customId === "boton_explorar"
  );

  if (alreadyExists) {
    console.log("✅ El botón ya existe.");
    return;
  }

  const embed = new EmbedBuilder()
    .setTitle("🌍 Solicitar que el servidor abra")
    .setDescription("Presiona el botón para enviar una solicitud.")
    .setColor("#2ECC71");

  const button = new ButtonBuilder()
    .setCustomId("boton_explorar")
    .setLabel("🟩 Abrir el servidor")
    .setStyle(ButtonStyle.Success);

  const row = new ActionRowBuilder().addComponents(button);

  await channel.send({
    content:
      "**🟢 Información del servidor**\n\n" +
      "**Java**\n" +
      "IP: `ChichoVerse.aternos.me:63137`\n\n" +
      "**Bedrock**\n" +
      "IP: `ChichoVerse.aternos.me`\n" +
      "Puerto: `63137`\n", // 👈 SOLO un \n aquí
    embeds: [embed],
    components: [row]
  });

  console.log("✅ Botón enviado.");
}); // 👈 ESTA LLAVE FALTABA


client.on("interactionCreate", async interaction => {
  if (!interaction.isButton()) return;
  if (interaction.customId !== "boton_explorar") return;

  const userId = interaction.user.id;
  const now = Date.now();

  if (cooldowns.has(userId)) {
    const expiration = cooldowns.get(userId) + COOLDOWN_TIME * 1000;

    if (now < expiration) {
      const remainingMinutes = Math.ceil((expiration - now) / 60000);

      const cooldownEmbed = new EmbedBuilder()
        .setTitle("⏳ Cooldown Activo")
        .setDescription(`Debes esperar **${remainingMinutes} minutos** antes de volver a enviar otra solicitud.`)
        .setColor("#ED4245");

      return interaction.reply({
        embeds: [cooldownEmbed],
        ephemeral: true
      });
    }
  }

  cooldowns.set(userId, now);

  const solicitudChannel = await client.channels.fetch(CHANNEL_SOLICITUDES_ID);
  if (!solicitudChannel) return;

  const solicitudEmbed = new EmbedBuilder()
    .setTitle("📢 Nueva Solicitud")
    .setDescription(
      `👤 Solicitado por: ${interaction.user}\n\n` +
      `📌 Estado: **Esperando que el servidor abra**`
    )
    .setColor("#5865F2")
    .setTimestamp();

  await solicitudChannel.send({
    content: "@here",
    embeds: [solicitudEmbed]
  });

  await interaction.reply({
    content: "✅ Tu solicitud fue enviada correctamente.",
    ephemeral: true
  });

  console.log(`📨 ${interaction.user.tag} hizo una solicitud.`);
});

client.login(TOKEN);

