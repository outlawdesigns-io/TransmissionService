const transmission = require('./transmission');
const fs = require('fs');
const autobahn = require('autobahn');


var connection = new autobahn.Connection({
  url:'wss://api.outlawdesigns.io:9700/ws',
  realm:'realm1'
});

connection.onopen = function(session){
  console.log('Connection Established...');
  session.register('io.outlawdesigns.outreach.getTorrents',transmission.getTorrents).then((req)=>{
    console.log('Get Torrents Registered');
  },console.error);
  session.register('io.outlawdesigns.outreach.getSessionInfo',transmission.getSessionInfo).then((req)=>{
    console.log('Get Session Info Registered');
  },console.error);
  session.register('io.outlawdesigns.outreach.getSessionStats',transmission.getSessionStats).then((req)=>{
    console.log('Get Session Stats Registered');
  },console.error);
  session.register('io.outlawdesigns.outreach.getTorrentInfo',transmission.getTorrentInfo).then((req)=>{
    console.log('Get Torrent Info Registered');
  },console.error);
  session.register('io.outlawdesigns.outreach.startTorrent',(args)=>{
    transmission.getTorrentInfo(args).then((torrentInfo)=>{
      session.publish('io.outlawdesigns.outreach.torrentStarted',[torrentInfo]);
      return transmission.startTorrent(args);
    });
  }).then((req)=>{
    console.log('Start Torrent Registered');
  },console.error);
  session.register('io.outlawdesigns.outreach.stopTorrent',(args)=>{
    transmission.getTorrentInfo(args).then((torrentInfo)=>{
      session.publish('io.outlawdesigns.outreach.torrentStopped',[torrentInfo]);
      return transmission.stopTorrent(args);
    });
  }).then((req)=>{
    console.log('Stop Torrent Registered');
  },console.error);
  session.register('io.outlawdesigns.outreach.removeTorrentAndData',(args)=>{
    transmission.getTorrentInfo(args).then((torrentInfo)=>{
      session.publish('io.outlawdesigns.outreach.torrentRemovedAndDeleted',[torrentInfo]);
      return transmission.removeTorrentAndData(args);
    });
  }).then((req)=>{
    console.log('Remove Torrent and Data Registered');
  },console.error);
  session.register('io.outlawdesigns.outreach.removeTorrent',(args)=>{
    transmission.getTorrentInfo(args).then((torrentInfo)=>{
      session.publish('io.outlawdesigns.outreach.torrentRemoved',[torrentInfo]);
      return transmission.removeTorrent(args);
    });
  }).then((req)=>{
    console.log('Remove Torrent Registered');
  },console.error);
}

transmission.setHost('outreach');
connection.open();
/*
transmission.js and index.js (the 'project') live in a container.
npm start -> index.js connects to wamprouter and registers it's methods.

a client connects to the wamprouter and calls registered methods.

Pub/sub? -- torrent added
         -- torrent removed/deleted
         -- torrent started/stopped
*/
