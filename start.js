var sia = require('./lib')


var key = sia.keyPair.generateFromMnemonic('zoo enact clog rate work step invest collect trick stereo inflict ivory', [0,0,0,0,0,0,0,0])

// 115d8cd5db439e61926473b7e6f887d0cbab990c2dc8bc0a285196c2651287cb7cf0421f6636
console.log(key.address)


