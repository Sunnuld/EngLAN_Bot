/*jshint esversion: 6 */
/*##############Init##############*/
const Discord = require('discord.js');
const bot = new Discord.Client();
const cfg = require('./config.json');
bot.login(cfg.token);
/*##############Depends##############*/
const request = require('request');
const cheerio = require('cheerio');
/*##############Images##############*/
const imgred = new Discord.Attachment('./images/Logo.png', 'Logo.png');
const imgbanner = new Discord.Attachment('./images/banner.png', 'banner.png');
/*##############CFG DATA##############*/
const adminUsers = cfg.badmins.split(",");
const announceChannels = cfg.channels.split(",");
const channelNames = cfg.channelNames.split(",");
/*##############Vars##############*/
var participantArray = 0;
var length;
var server;
var newList;
var oldList;
var image = false;
var userid;
var event_string = 'tlp-3';
var intervalVar

/*##############Triggers##############*/

bot.on('ready', () => {
  server = bot.guilds.get(cfg.serverId); //Server id
  bot.user.setActivity('Space Invaders');
  console.log("I'm ready!");

  checkTickets();
});

bot.on('guildMemberAdd', member => {
  newMember(member);
});

bot.on('guildMemberRemove', member => {
  memberLeave(member);
});

bot.on('message', message => {
  if (message.content.toLowerCase().startsWith(cfg.helpPrefix)) {
    help(message);
  }

  if (message.channel.type.toLowerCase() == 'dm') {
    if (message.author.bot) return;
    userid = message.author.id;
    if (adminUsers.includes(userid)) {
        announcements(message);
    }
  }

  if (message.content.toLowerCase().startsWith('.watch')) {
    if (message.author.bot) return;
    userid = message.author.id;
    if (adminUsers.includes(userid)) {
        watchTickets(message);
    } else {
      message.channel.send('U No A Badmin!');
    }
  }

  if (message.content.toLowerCase().startsWith('.stop')) {
    if (message.author.bot) return;
    userid = message.author.id;
    if (adminUsers.includes(userid)) {
        stopTickets(message);
    } else {
      message.channel.send('U No A Badmin!');
    }
  }

  if (message.content.toLowerCase().startsWith(cfg.rolePrefix)) {
    gameRoles(message);
  }

  if (message.content.toLowerCase().startsWith('!t')) {
    if (message.author.bot) return;
    userid = message.author.id;
      if (adminUsers.includes(userid)) {
        var args = message.content.split(" ");
        message.channel.send('Latest tick sale/s:');
        if(args.length == 1){
          length = 1;
        }else{length = args[1];}
        newTicket(message);
        message.delete();
    }
  }
});

/*##############Scraper################*/

function webScraper(){
  var url = 'https://thelanproject.co.uk/api/events/'+`${event_string}`+'/participants'
  process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
  request(url, (error, response, html) => {
    if (!error && response.statusCode == 200) {
      const $ = cheerio.load(html, {decodeEntities: false});
      const body = $('body');
      const bodyhtml = body.html().toString();
      participantArray = JSON.parse(bodyhtml);
    }else{console.log('error');}
  });
}

/*##############Functions##############*/

function help(message) {
  if (!message.author.bot) {
    var messageAvatar = message.author.avatarURL;
    var member = message.author;
    var embed = new Discord.RichEmbed()
      .setColor('#D00000')
      .attachFile(imgred)
      .setThumbnail('attachment://Logo.png')
      .addField('Hey', `${member}` + "! Here's some of the things I can do for you:", true)
      .addField('!tlp', 'Brings up this help screen, but obviously you knew that!')
      .addField('!role', "Assign yourself game roles, to be used in the '#find-players' channel. Tag on 'remove' if you no longer want that role")
      .addField('E.g.', "'!role Overwatch' & '!role remove Overwatch'")
      .addBlankField(true)
      .addField('Admin Commands:', "DM me 'say. <targetchannel> <message>'\r\n Type '!t #' in any channel to recall the previous # amount of ticket sales")
      .setFooter('TheLanProject')
      .setTimestamp();

    message.channel.send(embed);
  }
}

function announcements(message) {
  if (message.content.startsWith(cfg.sayPrefix)) {
    var args = message.content.split(" ").slice(1); //create array, args, split it at every space, delet the first element(prefix)

    if (args[0] == cfg.imgPrefix) {
      args = args.slice(1);
      image = true;
    } else {
      image = false;
    }

    if (channelNames.includes(args[0])) {
      switch (args[0]) {
        case 'general':
          switchOut = announceChannels[0];
          break;
        case 'announcements':
          switchOut = announceChannels[1];
          break;
        case 'find-players':
          switchOut = announceChannels[2];
          break;
        case 'bot-config':
          switchOut = announceChannels[3];
          break;
        default:
          message.reply('channel not recognised');
          return;
      }

      var targetChannel = server.channels.get(switchOut);
      args = args.slice(1);
      var sayText = args.join(" ");
      if (image == true) {
        targetChannel.send(sayText, {
          files: ['./images/image.png']
        });
      } else {
        targetChannel.send(sayText);
      }
      console.log("I'm ready!");
      return;

    } else {
      message.reply('Target channel required!');
    }
  } else {
    return;
  }
}

function newMember(member) {
  var channel = member.guild.channels.find(x => x.name === 'general');
  if (!member.user.bot) {
    var memberAvatar = member.user.avatarURL;
    if (!channel) return;
    var embed = new Discord.RichEmbed()
      .setColor('#D00000')
      .setThumbnail(memberAvatar)
      .addField('Hey', `${member}` + '!', true)
      .addField('Welcome to TheLanProject, your new home of all things gaming! We hope you enjoy your stay!', '🕹🎮')
      .attachFile(imgbanner)
      .setImage('attachment://banner.png')
      .addField('Head over to our page for info on our next event:', 'https://TheLanProject.co.uk')
      .setFooter('TheLanProject')
      .setTimestamp();

    channel.send(embed);

    var arg = member.guild.roles.find(x => x.name === 'TLP Fam');
    member.addRole(arg.id);

  } else {
    channel.send('Yay, more bots!');
  }
}

function memberLeave(member) {
  var channel = member.guild.channels.find(x => x.name === 'general');
  channel.send(`${member}` + ' BEGONE THOT!');
}

function gameRoles(message) {
  if (message.author.bot) return;
  var args = message.content.toLowerCase().split(" ").slice(1);

  if (args[0] != 'remove') {
    method = assignRole;
  } else {
    args = args.slice(1);
    method = deleteRole;
  }

  for (i = 0; i < args.length; i++) {
    switch (args[i]) {
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
        if (method == assignRole) {
          message.channel.send(cfg.noRole).then(sentMessage => {
            sentMessage.delete(10000);
          });
        } else {
          message.channel.send("That role doesn't exist!").then(sentMessage => {
            sentMessage.delete(5000);
          });
        }
    }
  }

  message.delete(0);
}

function assignRole(role, message) {
  var arg = message.guild.roles.find(x => x.name === role);
  message.member.addRole(arg.id);
  message.channel.send(message.author.tag + ', ' + role + ' role sucessfully added!').then(sentMessage => {
    sentMessage.delete(5000);
  });
}

function deleteRole(role, message) {
  var arg = message.guild.roles.find(x => x.name === role);
  message.member.removeRole(arg.id);
  message.channel.send(message.author.tag + ', ' + role + ' role sucessfully removed!').then(sentMessage => {
    sentMessage.delete(5000);
  });
}

function watchTickets(message){
  var args = message.content.split(" ").slice(1); //create array, args, split it at every space, delet the first element(prefix)
  var watchChannel = message.channel;
  if (args[0].startsWith('tlp')){
    event_string = args[0];
    intervalVar = setInterval(checkTickets,60000);
    message.channel.send('Now watching '+`${event_string}`+' for new ticket sales in channel '+`${watchChannel}`);
  } else {
    message.channel.send('Event name required! I.e. ".watch tlp-#"');
  }
}

function stopTickets(message){
  clearInterval(intervalVar);
  message.channel.send('No longer watching tickets in this channel!');
}

function checkTickets(){
  webScraper();
  newList = participantArray.length;
  if(newList>oldList){
    length = newList - oldList;
    newTicket();
  }
  oldList = newList;
  console.log("Ticket's checked");
}

function newTicket(message){
  for(i=length; i>0; i--){
    var user = participantArray[participantArray.length-i].username;
    var seat = participantArray[participantArray.length-i].seat;
    var embed = new Discord.RichEmbed()

      .setColor('#D00000')
      .addField(`${event_string}`+' Ticket Sold!', 'Welcome:')
      .addField(user, 'Seated: '+seat)
      .addField('Join them!', 'https://TheLanProject.co.uk')
      .setFooter('TheLanProject')
      .setTimestamp();

    if(message){
      message.channel.send(embed);
    }else{
      var channel = watchChannel;
      channel.send(embed);
    }
  }
}
