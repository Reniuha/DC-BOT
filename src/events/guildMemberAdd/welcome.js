const { Client, Message } = require('discord.js');
import { Font } from "canvacord";
import { GreetingsCard } from "./GreetingsCard";

/**
 * 
 */

Font.loadDefault();

// create card
const card = new GreetingsCard()
  .setAvatar(targetUserObj.user.displayAvatarURL({ size: 256 }))
  .setDisplayName(targetUserObj.user.username)
  .setType("welcome")
  .setMessage("Sveikas atvykes!");

const image = await card.build({ format: "png" });

message.channel.cache.get('1335242557747232859').send(card);