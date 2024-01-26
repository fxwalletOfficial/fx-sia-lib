var sia = require('./lib')
const axios = require('axios')

async function test() {

    var key = sia.keyPair.generateFromMnemonic('助记词', [0, 0, 0, 0, 0, 0, 0, 0])

    const utxo_axios = await axios.get(`https://narwal.lukechampine.com/wallet/${key.address}/utxos?limbo=true`);
    const utxo = utxo_axios.data;

    const txdata = sia.transction.buildTransaction(utxo, 
         0.1, // 手续费
        "c299740ac5c6177c280eebe1b77d9009438cbc75dae6f405ecbc262d31cffb4d77061bf783f1",  // 发送地址
         1,   // 金额
        "243d5139a632e9b87adb5870e19aa0bbdccacaef7ae9f165a26912d669f5d63bdcc111542d78",  // 接收地址
        key.publicKey
    );

    console.log(JSON.stringify(txdata));



}


test()