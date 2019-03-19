/*jshint esversion: 6 */
const Discord = require('discord.js');
const bot = new Discord.Client();
const cfg = require('./config.json');
const imgblue = new Discord.Attachment('./images/blue.png', 'blue.png');
const imgred = new Discord.Attachment('./images/red.png', 'red.png');
const imgbanner = new Discord.Attachment('./images/banner.png', 'banner.png');
const adminUsers = cfg.badmins.split(",");
const announceChannels = cfg.channels.split(",");
const channelNames = cfg.channelNames.split(",");
var server;
var image = false;
bot.login(cfg.token);

/*##############Triggers##############*/

bot.on('ready', () => {
  server = bot.guilds.get(cfg.serverId); //Server id
  bot.user.setActivity('Space Invaders');
  console.log("I'm ready!");
});

bot.on('guildMemberAdd', member => {
  newMember(member);
});

bot.on('guildMemberRemove', member => {
  memberLeave(member);
});

bot.on('message', message=>{
  if(message.content.toLowerCase().startsWith(cfg.helpPrefix)){
    help(message);
  }
  if (message.channel.type.toLowerCase() == 'dm') {
    announcements(message);
  }
  if(message.content.toLowerCase().startsWith(cfg.rolePrefix)){
    gameRoles(message);
  }
});

/*##############Functions##############*/

function help(message){
  if(!message.author.bot){
  var messageAvatar = message.author.avatarURL;
  var member = message.author;
  var embed = new Discord.RichEmbed()
  .setColor('#0026E6')
  .attachFile(imgred)
  .setThumbnail('attachment://red.png')
  .addField('Hey', `${member}` +"! Here's some of the things I can do for you:", true)
  .addField('!englan', 'Brings up this help screen, but obviously you knew that!')
  .addField('!role', "Assign yourself game roles, to be used in the '#find-players' channel. Tag on 'remove' if you no longer want that role")
  .addField('E.g.', "'!role Overwatch' & '!role remove Overwatch'")
  .addBlankField(true)
  .setFooter('EngLAN')
  .setTimestamp();

  message.channel.send(embed);
}
}

function announcements(message){
  if(message.author.bot)return;
  var userid = message.author.id;
  if(adminUsers.includes(userid)){
    if(message.content.startsWith(cfg.sayPrefix)){
      var args = message.content.split(" ").slice(1); //create array, args, split it at every space, delet the first element(prefix)

      if(args[0] == cfg.imgPrefix){
        args = args.slice(1);
        image = true;
      }else{image = false;}

      if(channelNames.includes(args[0])){
      switch(args[0]){
        case 'general':
        switchOut = announceChannels[0];
        break;
        case 'announcements':
        switchOut = announceChannels[1];
        break;
        case 'now-streaming':
        switchOut = announceChannels[3];
        break;
        case 'crabs-salty-place':
        switchOut = announceChannels[4];
        break;
        case 'find-players':
        switchOut = announceChannels[5];
        break;
        case 'bot-config':
        switchOut = announceChannels[6];
        break;
        default: message.reply('channel not recognised');
        return;
      }

      var targetChannel = server.channels.get(switchOut);
      args = args.slice(1);
      var sayText = args.join(" ");
      if(image == true){targetChannel.send(sayText, {files: ['./images/send.png']});
      }else{targetChannel.send(sayText);}
      console.log("I'm ready!");
      return;

    }else{message.reply('Target channel required!');}
    }else{return;}
  }else{return;}
}

function newMember(member){
  var channel = member.guild.channels.find(x => x.name === 'general');
  if(!member.user.bot){
    var memberAvatar = member.user.avatarURL;
    if(!channel)return;
    var embed = new Discord.RichEmbed()
    .setColor('#0026E6')
    .setThumbnail(memberAvatar)
    .addField('Hey', `${member}` +'!', true)
    .addField('Welcome to EngLAN, your new home of all things gaming! We hope you enjoy your stay!', '🕹🎮')
    .attachFile(imgbanner)
    .setImage('attachment://banner.png')
    .addField('Head over to our page for info on our next event:', 'https://www.EngLAN.co.uk')
    .setFooter('EngLAN')
    .setTimestamp();

    channel.send(embed);

    var arg = member.guild.roles.find(x => x.name === 'The EngLAN Fam');
    member.addRole(arg.id);

  }else{channel.send('Yay, more bots!');}
}

function memberLeave(member){
  var channel = member.guild.channels.find(x => x.name === 'general');
  channel.send(`${member}`+' BEGONE THOT!');
}

function gameRoles(message){
  if(message.author.bot)return;
  var args = message.content.toLowerCase().split(" ").slice(1);

    if (args[0] != 'remove'){
      method = assignRole;
    }else{
      args = args.slice(1);
      method = deleteRole;
    }

    for(i = 0; i < args.length; i++){
      switch(args[i]){
        case 'list':
          message.channel.send('Game Roles Available: CS:GO, Apex Legends, League of Legends, Overwatch. Roles can be removed with "!role remove"');
          break;
        case 'cs':
        case 'csgo':
        case 'cs:go':
          method('CS:GO', message);
          break;
        case 'ow':
        case 'overwatch':
          method('Overwatch', message);
          break;
        case 'lol':
        case 'league':
          method('League of Legends', message);
          break;
        case 'al':
        case 'apex':
          method('Apex Legends', message);
          break;
        default:
          if(method == assignRole){
          message.channel.send(cfg.noRole).then(sentMessage => {
            sentMessage.delete(10000);});
          }else{
           message.channel.send("That role doesn't exist!").then(sentMessage => {
             sentMessage.delete(5000);});
          }
      }
    }

    message.delete(0);
}

function assignRole(role, message){
  var arg = message.guild.roles.find(x => x.name === role);
  message.member.addRole(arg.id);
  message.channel.send(message.author.tag+', '+role+' role sucessfully added!').then(sentMessage => {
    sentMessage.delete(5000);
});
}

function deleteRole(role, message){
  var arg = message.guild.roles.find(x => x.name === role);
  message.member.removeRole(arg.id);
  message.channel.send(message.author.tag+', '+role+' role sucessfully removed!').then(sentMessage => {
    sentMessage.delete(5000);
});
}
