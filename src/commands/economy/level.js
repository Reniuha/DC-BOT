const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
  AttachmentBuilder,
} = require('discord.js');
const { Font, RankCardBuilder } = require('canvacord');
const calculateLevelXp = require('../../utils/calculateLevelXp');
const Level = require('../../models/Level');

module.exports = {
  callback: async (client, interaction) => {
    if (!interaction.inGuild()) {
      interaction.reply('You can only run this command inside a server.');
      return;
    }

    await interaction.deferReply();

    const mentionedUserId = interaction.options.get('target-user')?.value;
    const targetUserId = mentionedUserId || interaction.member.id;

    let targetUserObj;
    try {
      targetUserObj = await interaction.guild.members.fetch(targetUserId);
    } catch (error) {
      console.error('Error fetching user:', error);
      interaction.editReply('Failed to fetch the target user.');
      return;
    }

    let fetchedLevel;
    try {
      fetchedLevel = await Level.findOne({
        userId: targetUserId,
        guildId: interaction.guild.id,
      });
    } catch (error) {
      console.error('Error fetching level data:', error);
      interaction.editReply('There was an error fetching level data.');
      return;
    }

    if (!fetchedLevel) {
      interaction.editReply(
        mentionedUserId
          ? `${targetUserObj.user.tag} doesn't have any levels yet. Try again when they chat a little more.`
          : "You don't have any levels yet. Chat a little more and try again."
      );
      return;
    }

    let allLevels = await Level.find({ guildId: interaction.guild.id }).select(
      '-_id userId level xp'
    );

    allLevels.sort((a, b) => {
      if (a.level === b.level) {
        return b.xp - a.xp;
      } else {
        return b.level - a.level;
      }
    });

    let currentRank = allLevels.findIndex((lvl) => lvl.userId === targetUserId) + 1;

    const avatarUrl = 'https://i.imgur.com/6j2d6gG.png';

    try {
      Font.loadDefault();

      const rank = new RankCardBuilder()
      .setAvatar(targetUserObj.user.displayAvatarURL({ size: 256 }))
      .setRank(currentRank)
      .setLevel(fetchedLevel.level)
      .setCurrentXP(fetchedLevel.xp)
      .setRequiredXP(calculateLevelXp(fetchedLevel.level))
      .setStatus(targetUserObj.presence.status)
      .setUsername(`@${targetUserObj.user.username}`)
      .setDisplayName(targetUserObj.user.username)

      const data = await rank.build();
      const attachment = new AttachmentBuilder(data);
      interaction.editReply({ files: [attachment] });

    } catch (error) {
      console.error('Error generating rank card:', error);
      interaction.editReply('There was an error generating the rank card.');
    }
  },

  name: 'level',
  description: "Shows your/someone's level.",
  options: [
    {
      name: 'target-user',
      description: 'The user whose level you want to see.',
      type: ApplicationCommandOptionType.Mentionable,
    },
  ],
};
