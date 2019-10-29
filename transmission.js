var mod = (function(){
  const { exec } = require('child_process');
  const _baseCommand = 'transmission-remote ';
  // const _listPattern = /([0-9]{1,4})\*?\s+(.*?)\s+(.*?)\s+(.*?)\s+(.*?)\s+(.*?)\s+(.*?)\s+(.*?)\s+(.*?)$/;
  const _listPattern = /(.*?)\s{2,}/g;
  const _responsePattern = /responded:\s"(.*?)"/;
  const _sessionInfoPatterns = {
    daemonVersion:/Daemon\sversion:\s([0-9]{1,3}.[0-9]{1,3})/,
    rpcVersion:/RPC\sversion:\s(.*)/,
    rpcMinVersion:/RPC\sminimum\sversion:\s(.*)/,
    configDir:/Configuration\sdirectory:\s(.*)/,
    downloadDir:/Download\sdirectory:\s(.*)/,
    listenPort:/Listenport:\s(.*)/,
    portFwding:/Portforwarding\senabled:\s(.*)/,
    utpEnabled:/uTP\senabled:\s(.*)/,
    distHashEnabled:/Distributed\shash\stable\senabled:\s(.*)/,
    localPeerDiscEnabled:/Local\speer\sdiscovery\senabled:\s(.*)/,
    peerExchAllwed:/Peer\sexchange\sallowed:\s(.*)/,
    encryption:/Encryption:\s(.*)/,
    maxMemoryCache:/Maximum\smemory\scache\ssize:\s(.*)/,
    peerLimit:/Peer\slimit:\s(.*)/,
    defaultSeedRatio:/Default\sseed\sratio\slimit:\s(.*)/,
    uploadSpeedLimit:/Upload\sspeed\slimit:\s(.*)/,
    downloadSpeedLimit:/Download\sspeed\slimit:\s(.*)/,
    autoStart:/Autostart\sadded\storrents:\s(.*)/,
    deleteAutoTorrents:/Delete\sautomatically\sadded\storrents:\s(.*)/,
  };
  const _sessionStatPatterns = {
    currentUpload:/CURRENT\sSESSION[\s\t]+Uploaded:[\s\t]+(.*)/,
    currentDownload:/CURRENT\sSESSION[\s\t]+.*[\s\t]+Downloaded:[\s\t]+(.*)/,
    currentRatio:/CURRENT\sSESSION[\s\t]+.*[\s\t]+.*[\s\t]+Ratio:[\s\t]+(.*)/,
    currentDuration:/CURRENT\sSESSION[\s\t]+.*[\s\t]+.*[\s\t]+.*[\s\t]+.*Duration:[\s\t]+(.*)/,
    totalStarts:/TOTAL[\s\t]+.*Started\s([0-9]{1,10})/,
    totalUpload:/TOTAL[\s\t]+.*[\s\t]+.*Uploaded:[\s\t]+(.*)/,
    totalDownload:/TOTAL[\s\t]+.*[\s\t]+.*[\s\t]+.*Downloaded:[\s\t]+(.*)/,
    totalRation:/TOTAL[\s\t]+.*[\s\t]+.*[\s\t]+.*[\s\t]+.*Ratio:[\s\t]+(.*)/,
    totalDuration:/TOTAL[\s\t]+.*[\s\t]+.*[\s\t]+.*[\s\t]+.*[\s\t]+.*Duration:[\s\t]+(.*)/,
  };
  const _torrentInfoPatterns = {
    id:/Id:\s([0-9]{1,4})/,
    name:/Name:\s(.*)/,
    hash:/Hash:\s(.*)/,
    magnet:/Magnet:\s(.*)/,
    state:/State:\s(.*)/,
    location:/Location:\s(.*)/,
    percentDone:/Percent\sDone:\s(.*)/,
    eta:/ETA:\s(.*)/,
    downloadSpeed:/Download\sSpeed:\s(.*)/,
    uploadSpeed:/Upload\sSpeed:\s(.*)/,
    have:/Have:\s(.*)/,
    availability:/Availability:\s(.*)/,
    totalSize:/Total\ssize:\s(.*)/,
    downloaded:/Downloaded:\s(.*)/,
    uploaded:/Uploaded:\s(.*)/,
    ratio:/Ratio:\s(.*)/,
    corruptDl:/Corrupt\sDL:\s(.*)/,
    connectedPeers:/Peers:\sconnected\sto\s([0-9]{1,5})/,
    uploadingPeers:/Peers:\s.*?,\suploading\sto\s([0-9]{1,5})/,
    downloadingPeers:/Peers:\s.*?downloading\sfrom\s([0-9]{1,5})/,
    dateAdded:/Date\sadded:[\s]+(.*)/,
    dateCreated:/Date\screated:\s(.*)/,
    publicTorrent:/Public\storrent:\s(.*)/,
    comment:/Comment:\s(.*)/,
    creator:/Creator:\s(.*)/,
    pieceCount:/Piece\sCount:\s(.*)/,
    pieceSize:/Piece\sSize:\s(.*)/,
    downloadLimit:/Download\sLimit:\s(.*)/,
    uploadLimit:/Upload\sLimit:\s(.*)/,
    ratioLimit:/Ratio\sLimit:\s(.*)/,
    honorSessionLimits:/Honors\sSession\sLimits:\s(.*)/,
    peerLimit:/Peer\slimit:\s(.*)/,
    bandwidthPriority:/Bandwidth\sPriority:\s(.*)/
  };
  let _username = 'transmission';
  let _password = 'transmission';
  let _host = null;
  let _port = null;
  function _setUser(username,password){
    _username = username;
    _password = password;
  }
  function _setHost(host){
    _host = host;
  }
  function _setPort(port){
    _port = port;
  }
  function _buildBaseCmd(){
    let command = _baseCommand;
    if(_host && _port){
      command += _host + ':' + _port + ' ';
    }else if(_host){
      command += _host + ' ';
    }else if(_port){
      command += _port + ' ';
    }
    return command + '-n ' + _username + ':' + _password + ' ';
  }
  function _parseList(stdout){
    let results = [];
    lines = stdout.split("\n");
    for(var i = 1; i < (lines.length - 2); i++){
      lines[i] += "  ";
      let matches = lines[i].match(_listPattern);
      if(matches){
        results.push({
          id:matches[1].trim(),
          done:matches[2].trim(),
          have:matches[3].trim(),
          eta:matches[4].trim(),
          up:matches[5].trim(),
          down:matches[6].trim(),
          ratio:matches[7].trim(),
          status:matches[8].trim(),
          name:matches[9].trim()
        });
      }
    }
    return results;
  }
  function _parseSessionStats(stdout){
    let result = {};
    result['current'] = {
      upload:stdout.match(_sessionStatPatterns.currentUpload)[1],
      download:stdout.match(_sessionStatPatterns.currentDownload)[1],
      ratio:stdout.match(_sessionStatPatterns.currentRatio)[1],
      duration:stdout.match(_sessionStatPatterns.currentDuration)[1]
    };
    result['total'] = {
      upload:stdout.match(_sessionStatPatterns.totalUpload)[1],
      download:stdout.match(_sessionStatPatterns.totalDownload)[1],
      ratio:stdout.match(_sessionStatPatterns.totalRation)[1],
      duration:stdout.match(_sessionStatPatterns.totalDuration)[1],
      starts:stdout.match(_sessionStatPatterns.totalStarts)[1]
    };
    return result;
  }
  function _parseSessionInfo(stdout){
    let result = {};
    result['version'] = {
      daemonVersion:stdout.match(_sessionInfoPatterns.daemonVersion)[1],
      rpcVersion:stdout.match(_sessionInfoPatterns.rpcVersion)[1],
      rpcMinVersion:stdout.match(_sessionInfoPatterns.rpcMinVersion)[1]
    };
    result['config'] = {
      configDir:stdout.match(_sessionInfoPatterns.configDir)[1],
      downloadDir:stdout.match(_sessionInfoPatterns.downloadDir)[1],
      listenPort:stdout.match(_sessionInfoPatterns.listenPort)[1],
      portFwding:stdout.match(_sessionInfoPatterns.portFwding)[1],
      utpEnabled:stdout.match(_sessionInfoPatterns.utpEnabled)[1],
      distHashEnabled:stdout.match(_sessionInfoPatterns.distHashEnabled)[1],
      localPeerDiscEnabled:stdout.match(_sessionInfoPatterns.localPeerDiscEnabled)[1],
      peerExchAllwed:stdout.match(_sessionInfoPatterns.peerExchAllwed)[1],
      encryption:stdout.match(_sessionInfoPatterns.encryption)[1],
      maxMemoryCache:stdout.match(_sessionInfoPatterns.maxMemoryCache)[1]
    };
    result['limits'] = {
      peerLimit:stdout.match(_sessionInfoPatterns.peerLimit)[1],
      defaultSeedRatio:stdout.match(_sessionInfoPatterns.defaultSeedRatio)[1],
      uploadSpeedLimit:stdout.match(_sessionInfoPatterns.uploadSpeedLimit)[1],
      downloadSpeedLimit:stdout.match(_sessionInfoPatterns.downloadSpeedLimit)[1]
    };
    result['misc'] = {
      autoStart:stdout.match(_sessionInfoPatterns.autoStart)[1],
      deleteAutoTorrents:stdout.match(_sessionInfoPatterns.deleteAutoTorrents)[1]
    };
    return result;
  }
  function _parseTorrentInfo(stdout){
    let result = {};
    result['name'] = {
      id:stdout.match(_torrentInfoPatterns.id)[1],
      name:stdout.match(_torrentInfoPatterns.name)[1],
      hash:stdout.match(_torrentInfoPatterns.hash)[1],
      magnet:stdout.match(_torrentInfoPatterns.magnet)[1]
    };
    result['transfer'] = {
      state:stdout.match(_torrentInfoPatterns.state)[1],
      location:stdout.match(_torrentInfoPatterns.location)[1],
      percentDone:stdout.match(_torrentInfoPatterns.percentDone)[1],
      eta:stdout.match(_torrentInfoPatterns.eta)[1],
      downloadSpeed:stdout.match(_torrentInfoPatterns.downloadSpeed)[1],
      uploadSpeed:stdout.match(_torrentInfoPatterns.uploadSpeed)[1],
      have:stdout.match(_torrentInfoPatterns.have)[1],
      availability:stdout.match(_torrentInfoPatterns.availability)[1],
      totalSize:stdout.match(_torrentInfoPatterns.totalSize)[1],
      downloaded:stdout.match(_torrentInfoPatterns.downloaded)[1],
      uploaded:stdout.match(_torrentInfoPatterns.uploaded)[1],
      ratio:stdout.match(_torrentInfoPatterns.ratio)[1],
      corruptDl:stdout.match(_torrentInfoPatterns.corruptDl)[1],
      peers:{
        connected:stdout.match(_torrentInfoPatterns.connectedPeers)[1],
        uploadingTo:stdout.match(_torrentInfoPatterns.uploadingPeers)[1],
        downloadingFrom:stdout.match(_torrentInfoPatterns.downloadingPeers)[1]
      }
    };
    result['history'] = {
      dateAdded:stdout.match(_torrentInfoPatterns.dateAdded)[1]
    };
    result['origins'] = {
      dateCreated:(stdout.match(_torrentInfoPatterns.dateCreated)) ? stdout.match(_torrentInfoPatterns.dateCreated)[1]:null,
      publicTorrent:stdout.match(_torrentInfoPatterns.publicTorrent)[1],
      comment:(stdout.match(_torrentInfoPatterns.comment)) ? stdout.match(_torrentInfoPatterns.comment)[1]:null,
      creator:(stdout.match(_torrentInfoPatterns.creator)) ? stdout.match(_torrentInfoPatterns.creator)[1]:null,
      pieceCount:stdout.match(_torrentInfoPatterns.pieceCount)[1],
      pieceSize:stdout.match(_torrentInfoPatterns.pieceSize)[1],
    };
    result['limits'] = {
      downloadLimit:stdout.match(_torrentInfoPatterns.downloadLimit)[1],
      uploadLimit:stdout.match(_torrentInfoPatterns.uploadLimit)[1],
      ratioLimit:stdout.match(_torrentInfoPatterns.ratioLimit)[1],
      honorSessionLimits:stdout.match(_torrentInfoPatterns.honorSessionLimits)[1],
      peerLimit:stdout.match(_torrentInfoPatterns.peerLimit)[1],
      bandwidthPriority:stdout.match(_torrentInfoPatterns.bandwidthPriority)[1]
    };
    return result;
  }
  return {
    setHost:function(host){
      return _setHost(host);
    },
    setPort:function(port){
      return _setPort(port);
    },
    setUser:function(user,password){
      return _setUser(user,password);
    },
    getTorrents:function(){
      return new Promise((resolve,reject)=>{
        let command = _buildBaseCmd() + '-l';
        exec(command,(err,stdout,stderr)=>{
          if(err){
            reject(err);
          }
          resolve(_parseList(stdout));
        });
      });
    },
    getSessionStats:function(){
      return new Promise((resolve,reject)=>{
        let command = _buildBaseCmd() + '-st';
        exec(command,(err,stdout,stderr)=>{
          if(err){
            reject(err);
          }
          resolve(_parseSessionStats(stdout));
        });
      });
    },
    getSessionInfo:function(){
      return new Promise((resolve,reject)=>{
        let command = _buildBaseCmd() + '-si';
        exec(command,(err,stdout,stderr)=>{
          if(err){
            reject(err);
          }
          resolve(_parseSessionInfo(stdout));
        });
      });
    },
    getTorrentInfo:function(torrentId){
      return new Promise((resolve,reject)=>{
        let command = _buildBaseCmd() + '-t ' + torrentId + ' -i';
        exec(command,(err,stdout,stderr)=>{
          if(err){
            reject(err);
          }
          resolve(_parseTorrentInfo(stdout));
        });
      });
    },
    startTorrent:function(torrentId){
      return new Promise((resolve,reject)=>{
        let command = _buildBaseCmd() + '-t ' + torrentId + ' -s';
        exec(command,(err,stdout,stderr)=>{
          if(err){
            reject(err);
          }
          resolve(stdout.match(_responsePattern)[1]);
        });
      });
    },
    stopTorrent:function(torrentId){
      return new Promise((resolve,reject)=>{
        let command = _buildBaseCmd() + '-t ' + torrentId + ' -S';
        exec(command,(err,stdout,stderr)=>{
          if(err){
            reject(err);
          }
          resolve(stdout.match(_responsePattern)[1]);
        });
      });
    },
    removeTorrent:function(torrentId){
      return new Promise((resolve,reject)=>{
        let command = _buildBaseCmd() + '-t ' + torrentId + ' -r';
        exec(command,(err,stdout,stderr)=>{
          if(err){
            reject(err);
          }
          resolve(stdout.match(_responsePattern)[1]);
        });
      });
    },
    removeTorrentAndData:function(torrentId){
      return new Promise((resolve,reject)=>{
        let command = _buildBaseCmd() + '-t ' + torrentId + ' -rad';
        exec(command,(err,stdout,stderr)=>{
          if(err){
            reject(err);
          }
          resolve(stdout.match(_responsePattern)[1]);
        });
      });
    }
  };
}());

module.exports = mod;
