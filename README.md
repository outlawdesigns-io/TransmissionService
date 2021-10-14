# Transmission Service

## Preamble

This package provides remote access to a [transmission](https://transmissionbt.com/) torrent server with RPC enabled.

## Usage
### Callable functions
Callable functions that change to state of a torrent will return `null` when called. These methods have associated subscribable events that will publish the details of the affected torrents.
#### io.outlawdesigns.outreach.getTorrents
Return an array of objects representing torrents on the host.
##### Sample Call
`session.call('io.outlawdesigns.outreach.getSessionStats').then(console.log);`
##### Sample Output
```
[
  {
    id: '1',
    done: '0%',
    have: 'None',
    eta: 'Unknown',
    up: '0.0',
    down: '0.0',
    ratio: 'None',
    status: 'Stopped',
    name: 'Gravecarver - Spectral Carnage (2021)'
  },
  ....
```
#### io.outlawdesigns.outreach.getSessionInfo
Return an object representing information about the settings and configuration of the Transmission server.
##### Sample Call
`session.call('io.outlawdesigns.outreach.getSessionInfo').then(console.log);`
##### Sample output
```
{
  version: { daemonVersion: '2.92', rpcVersion: '15', rpcMinVersion: '1' },
  config: {
    configDir: '/var/lib/transmission-daemon/.config/transmission-daemon',
    downloadDir: '/var/lib/transmission-daemon/downloads',
    listenPort: '51413',
    portFwding: 'No',
    utpEnabled: 'Yes',
    distHashEnabled: 'Yes',
    localPeerDiscEnabled: 'No',
    peerExchAllwed: 'Yes',
    encryption: 'preferred',
    maxMemoryCache: '4.00 MiB'
  },
  limits: {
    peerLimit: '200',
    defaultSeedRatio: 'Unlimited',
    uploadSpeedLimit: 'Unlimited (Disabled limit: 100 kB/s; Disabled turtle limit: 50 kB/s)',
    downloadSpeedLimit: 'Unlimited (Disabled limit: 100 kB/s; Disabled turtle limit: 50 kB/s)'
  },
  misc: { autoStart: 'No', deleteAutoTorrents: 'No' }
}
```
#### io.outlawdesigns.outreach.getSessionStats
Return an object representing information about the Transmission server's up/down load statistics.
##### Sample Call
`session.call('io.outlawdesigns.outreach.getSessionStats').then(console.log);`
##### Sample Output
```
{
  current: {
    upload: '181.2 MB',
    download: '8.43 GB',
    ratio: '0.0',
    duration: '20 days (1789184 seconds)'
  },
  total: {
    upload: '301.0 GB',
    download: '2.91 TB',
    ratio: '0.1',
    duration: '721 days (62319224 seconds)',
    starts: '24'
  }
}
```
#### io.outlawdesigns.outreach.getTorrentInfo
Return information about a specific torrent on the server.
##### Sample Call
`session.call('io.outlawdesigns.outreach.getTorrentInfo',[1]).then(console.log);`
##### Sample Output
```
{
  name: {
    id: '1',
    name: 'Gravecarver - Spectral Carnage (2021)',
    hash: 'dd1bfe0cf251fa14e75e0d91b047b0e9106fad5c',
    magnet: 'magnet:?xt=urn:btih:dd1bfe0cf251fa14e75e0d91b047b0e9106fad5c&dn=Gravecarver%20-%20Spectral%20Carnage%20%282021%29&tr=http%3A%2F%2Fwww.metal-tracker.com%3A2710%2F5480ea8dca64dd6ce518d3e2af97062e%2Fannounce'
  },
  transfer: {
    state: 'Stopped',
    location: '/mnt/music/',
    percentDone: '0.0%',
    eta: '0 seconds (0 seconds)',
    downloadSpeed: '0 kB/s',
    uploadSpeed: '0 kB/s',
    have: 'None (None verified)',
    availability: '0.0%',
    totalSize: '94.87 MB (94.87 MB wanted)',
    downloaded: 'None',
    uploaded: 'None',
    ratio: 'None',
    corruptDl: 'None',
    peers: { connected: '0', uploadingTo: '0', downloadingFrom: '0' }
  },
  history: { dateAdded: 'Sat Apr 10 07:19:22 2021' },
  origins: {
    dateCreated: 'Sat Feb 27 23:06:23 2021',
    publicTorrent: 'No',
    comment: "Торрент создан для 'Metal Torrent Tracker'",
    creator: 'Varg',
    pieceCount: '724',
    pieceSize: '128.0 KiB'
  },
  limits: {
    downloadLimit: 'Unlimited',
    uploadLimit: 'Unlimited',
    ratioLimit: 'Default',
    honorSessionLimits: 'Yes',
    peerLimit: '50',
    bandwidthPriority: 'Normal'
  }
}
```
#### io.outlawdesigns.outreach.startTorrent
Start a specific torrent on the server.
##### Sample Call
`session.call('io.outlawdesigns.outreach.startTorrent',[1]).then(console.log);`
##### Sample Output
`null`
#### io.outlawdesigns.outreach.removeTorrentAndData
Remove a torrent and all associated data from the server.
##### Sample Call
`session.call('io.outlawdesigns.outreach.removeTorrentAndData',[1]).then(console.log);`
##### Sample Output
`null`
#### io.outlawdesigns.outreach.removeTorrent
Remove a torrent from the server without affecting its associated data.
##### Sample Call
`session.call('io.outlawdesigns.outreach.removeTorrent',[1]).then(console.log);`
##### Sample Output
`null`

### Subscribable Events
#### io.outlawdesigns.outreach.torrentStarted
#### io.outlawdesigns.outreach.torrentStopped
#### io.outlawdesigns.outreach.torrentRemoved
#### io.outlawdesigns.outreach.torrentRemovedAndDeleted
