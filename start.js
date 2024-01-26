var sia = require('./lib')


var key = sia.keyPair.generateFromMnemonic('zoo enact clog rate work step invest collect trick stereo inflict ivory', [0,0,0,0,0,0,0,0])

/*
{
    address: '115d8cd5db439e61926473b7e6f887d0cbab990c2dc8bc0a285196c2651287cb7cf0421f6636',
    publicKey: '4aa36e8d249d7615ced8ed9d7a4de828a27959057eb594830cbb81dee2d09976',
    privateKey: '788fbae95234f00dce78c7eaa95775a57b894038f5884ba0819ba90fe4b06b914aa36e8d249d7615ced8ed9d7a4de828a27959057eb594830cbb81dee2d09976'
}
*/
console.log(key)
console.log(sia.keyPair.deriveAddressByHexPublicKey(key.publicKey));




