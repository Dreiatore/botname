const Discord = require("discord.js");
const ms = require('ms');

const client = new Discord.Client();

const config = require("./config.json");

client.on("ready", () => {
  console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);
  client.user.setActivity(`I'm in ${client.guilds.size} servers, use +commands`);
});

client.on("guildCreate", guild => {
  console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
  client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

client.on("guildDelete", guild => {
  console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
  client.user.setActivity(`Serving ${client.guilds.size} servers`);
});


client.on("message", async message => {

  if(message.author.bot) return;

  if(message.content.indexOf(config.prefix) !== 0) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  if(command === "ping") {
    const m = await message.channel.send("Ping?");
    m.edit(`We dont have ball tho. Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
  }
  if(command === "commands") {
      const m = await message.channel.send("Wait");
      m.edit(`prefix is + and the commands are as follows:
ban - ban User who brake the holy rules,
kick - kick Users ass from here,
say - if you want to talk with bot, feel free to use this command,
and ping - to see how much ping you have`);
  }

  if(command === "say") {
    const sayMessage = args.join(" ");
    message.delete().catch(O_o=>{});
    message.channel.send(sayMessage);
  }

  if(command === "kick") {
    if(!message.member.roles.some(r=>["Administrator", "Moderator"].includes(r.name)) )
      return message.reply("Sorry, you don't have permissions to use this!");

    let member = message.mentions.members.first() || message.guild.members.get(args[0]);
    if(!member)
      return message.reply("Please mention a valid member of this server");
    if(!member.kickable)
      return message.reply("I cannot kick this user! Do they have a higher role? Do I have kick permissions?");

    let reason = args.slice(1).join(' ');
    if(!reason) reason = "No reason provided";

    await member.kick(reason)
      .catch(error => message.reply(`Sorry ${message.author} I couldn't kick because of : ${error}`));
    message.reply(`${member.user.tag} has been kicked because: ${reason}`);

  }

  if (!message.member.roles.some(r => ["Administrator", "Moderator"].includes(r.name))) {
    return message.reply("Sorry, you dont have permissions to use this!");
} else {
    let muterole = message.guild.roles.find(`name`, "muted");
    if (!muterole) {
        try {
            muterole = await message.guild.createRole({
                name: "muted",
                color: "#404547",
                permissions: []
            })
            message.guild.channels.forEach(async (channel, id) => {
                await channel.overwritePermissions(muterole, {
                    SEND_MESSAGES: false,
                    ADD_REACTIONS: false
                });
            })
        } catch (e) {
            console.log(e.stack)
        }
    }
    let mute = message.mentions.members.first();
    let muteTime = message.content.split(' ').slice(2).join(' ')
    if (!mute || !muteTime) return message.reply("how to use: +mute <@user> <time>")
    if (message.guild.member(mute).hasPermission('MANAGE_MESSAGES')) return message.reply('I cannot mute him, sorry');

    await message.guild.member(mute).addRole(muterole).then(() => {
        message.reply(`${mute.user.username} is muted for ${ms(ms(muteTime), {long: true})}.`);
    });
    setTimeout(function() {
        message.guild.member(mute).removeRole(muterole).then(() => {
            message.channel.send(`**${mute}** can freely write again!`);
        })
    }, ms(muteTime));
}


  if(command === "ban") {
    if(!message.member.roles.some(r=>["Administrator","Moderator"].includes(r.name)) )
      return message.reply("Sorry, you don't have permissions to use this!");

    let member = message.mentions.members.first();
    if(!member)
      return message.reply("Please mention a valid member of this server");
    if(!member.bannable)
      return message.reply("I cannot ban this user! Do they have a higher role? Do I have ban permissions?");

    let reason = args.slice(1).join(' ');
    if(!reason) reason = "No reason provided";

    await member.ban(reason)
      .catch(error => message.reply(`Sorry ${message.author} I couldn't ban because of : ${error}`));
    message.reply(`${member.user.tag} has been banned because: ${reason}`);
  }

  if(command === "purge") {
    const deleteCount = parseInt(args[0], 10);

    if(!deleteCount || deleteCount < 2 || deleteCount > 100)
      return message.reply("Please provide a number between 2 and 100 for the number of messages to delete");


    const fetched = await message.channel.fetchMessages({limit: deleteCount});
    message.channel.bulkDelete(fetched)
      .catch(error => message.reply(`Couldn't delete messages because of: ${error}`));
  }
});

client.login(process.env.bot_token);
