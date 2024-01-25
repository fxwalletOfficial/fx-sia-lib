var sia = require('./lib')
const axios = require('axios')

async function test() {

    var key = sia.keyPair.generateFromMnemonic('助记词', [0, 0, 0, 0, 0, 0, 0, 0])

    const utxo_axios = await axios.get(`https://narwal.lukechampine.com/wallet/${key.address}/utxos?limbo=true`);
    const utxo = utxo_axios.data;

    const txdata = sia.transction.encodeTransaction(utxo, 
         0.1, // 手续费
        "c299740ac5c6177c280eebe1b77d9009438cbc75dae6f405ecbc262d31cffb4d77061bf783f1",  // 发送地址
         1,   // 金额
        "243d5139a632e9b87adb5870e19aa0bbdccacaef7ae9f165a26912d669f5d63bdcc111542d78",  // 接收地址
         key.privateKey
    );

    console.log(JSON.stringify(txdata));

    /*
    {
    "siacoinInputs": [
        {
            "parentID": "fb7c61606aea0e7aadae8ee6720744926f683b8f0fce7dcdb132f1c624525f20",
            "unlockConditions": {
                "publicKeys": [
                    "ed25519:98e216d25ab3984063d19daedd6bb65925753b70bc486e8bdd127544a74614fa"
                ],
                "signaturesRequired": 1
            }
        }
    ],
    "siacoinOutputs": [
        {
            "value": "1000000000000000000000000",
            "unlockHash": "243d5139a632e9b87adb5870e19aa0bbdccacaef7ae9f165a26912d669f5d63bdcc111542d78"
        },
        {
            "value": "107480183210876543211000000",
            "unlockHash": "c299740ac5c6177c280eebe1b77d9009438cbc75dae6f405ecbc262d31cffb4d77061bf783f1"
        }
    ],
    "minerFees": [
        "100000000000000000000000"
    ],
    "transactionSignatures": [
        {
            "parentID": "fb7c61606aea0e7aadae8ee6720744926f683b8f0fce7dcdb132f1c624525f20",
            "publicKeyIndex": 0,
            "coveredFields": {
                "wholeTransaction": true
            },
            "signature": "FRl1WiTd29zQugXAnpEhqKwZdt8RpLqkwKfRCG60Ha3ujpkjheofGX2wJDlU0LxE3PjOYrk73zhLv1CDMn5MCA=="
        }
    ]
    }
    */

    const broadcast_axios = await axios.post(`https://narwal.lukechampine.com/wallet/${key.address}/broadcast`,[txdata]);    
    console.log(broadcast_axios.data);

    const limbo_axios = await axios.get(`https://narwal.lukechampine.com/wallet/${key.address}/limbo`);   // 查看pending状态下的交易
    console.log(limbo_axios.data[0]?.id);



}


test()