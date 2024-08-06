var blake2b = require('blake2b')
var nacl = require('tweetnacl')
var { publicKeyFromPrivateKey } = require('./KeyPair')
var BigNumber = require('bignumber.js')

const HASTINGS_TO_SC = '1000000000000000000000000000'

function encodeTransaction(inputs_from_api, fee, senders_address, send_amount, receipient_address, private_key) {
  var fee = (new BigNumber(fee).times('1000000000000000000000000000')).toFixed()
  // init empty tx
  var transaction = { siacoinInputs: new Array(), siacoinOutputs: new Array(), minerFees: new Array(), transactionSignatures: new Array() }
  // get sum of input values
  var totalInputAmount = new BigNumber(0)
  // format inputs from siastats.info
  for (var i = 0; i < inputs_from_api.length; i++) {
    transaction.siacoinInputs.push({
      parentID: inputs_from_api[i].ID,
      unlockConditions: {
        publicKeys: [`ed25519:${publicKeyFromPrivateKey(private_key)}`],
        signaturesRequired: 1
      }
    })
    // update total input value
    totalInputAmount = new BigNumber(totalInputAmount).plus(inputs_from_api[i].value)
    console.log(totalInputAmount.toFixed())
  }
  // add recipient output
  transaction.siacoinOutputs.push({
    value: (new BigNumber(send_amount).times(HASTINGS_TO_SC)).toFixed(),
    unlockHash: receipient_address
  })
  // add change output
  transaction.siacoinOutputs.push({
    // value: ().toString(),
    value: ((totalInputAmount.minus(new BigNumber(send_amount).times(HASTINGS_TO_SC)).minus(fee))).toFixed(),
    unlockHash: senders_address
  })
  // add miner fees
  transaction.minerFees.push(fee)
  // get keypair
  var keypair = nacl.sign.keyPair.fromSecretKey(Buffer.from(private_key, 'hex'))
  // add signatures
  for (var i = 0; i < inputs_from_api.length; i++) {
    transaction.transactionSignatures.push({
      parentID: inputs_from_api[i].ID,
      publicKeyIndex: 0,
      coveredFields: { wholeTransaction: true },
      signature: Buffer.from(nacl.sign.detached(sigHash(transaction, inputs_from_api[i].ID, 0, 0), keypair.secretKey)).toString('base64')
    })
  }

  return _adjust(transaction)
}


function buildTransaction(inputs_from_api, fee, senders_address, send_amount, receipient_address, public_key) {
  var fee = (new BigNumber(fee).times('1000000000000000000000000000')).toFixed()
  // init empty tx
  var transaction = { siacoinInputs: new Array(), siacoinOutputs: new Array(), minerFees: new Array(), transactionSignatures: new Array() }
  // get sum of input values
  var totalInputAmount = new BigNumber(0)
  // format inputs from siastats.info
  for (var i = 0; i < inputs_from_api.length; i++) {
    transaction.siacoinInputs.push({
      parentID: inputs_from_api[i].ID,
      unlockConditions: {
        publicKeys: [`ed25519:${public_key}`],
        signaturesRequired: 1
      }
    })
    // update total input value
    totalInputAmount = new BigNumber(totalInputAmount).plus(inputs_from_api[i].value)
    console.log(totalInputAmount.toFixed())
  }
  // add recipient output
  transaction.siacoinOutputs.push({
    value: (new BigNumber(send_amount).times(HASTINGS_TO_SC)).toFixed(),
    unlockHash: receipient_address
  })
  // add change output
  const change_amount = ((totalInputAmount.minus(new BigNumber(send_amount).times(HASTINGS_TO_SC)).minus(fee))).toFixed();
  if (Number(change_amount) !== 0) {
    transaction.siacoinOutputs.push({
      // value: ().toString(),
      value: Number(change_amount) < 0 ? '-1' : change_amount,
      unlockHash: senders_address
    })
  }

  // add miner fees
  transaction.minerFees.push(fee)

  // add signatures
  for (var i = 0; i < inputs_from_api.length; i++) {
    transaction.transactionSignatures.push({
      parentID: inputs_from_api[i].ID,
      publicKeyIndex: 0,
      coveredFields: { wholeTransaction: true },
      signature: Buffer.from(sigHash(transaction, inputs_from_api[i].ID, 0, 0)).toString('base64')
    })
  }

  return _adjust(transaction)
}


function buildBatchTransaction(inputs_from_api, fee, senders_address, send_amounts, receipient_addresses, public_key) {
  var fee = (new BigNumber(fee).times('1000000000000000000000000000')).toFixed();
  // init empty tx
  var transaction = { siacoinInputs: new Array(), siacoinOutputs: new Array(), minerFees: new Array(), transactionSignatures: new Array() }
  // get sum of input values
  var totalInputAmount = new BigNumber(0)
  // format inputs from siastats.info
  for (var i = 0; i < inputs_from_api.length; i++) {
    transaction.siacoinInputs.push({
      parentID: inputs_from_api[i].ID,
      unlockConditions: {
        publicKeys: [`ed25519:${public_key}`],
        signaturesRequired: 1
      }
    })
    // update total input value
    totalInputAmount = new BigNumber(totalInputAmount).plus(inputs_from_api[i].value)
    console.log(totalInputAmount.toFixed())
  }

  var totalOutAmount = new BigNumber(0)
  // add recipient output
  for (let i = 0; i < send_amounts.length; i++) {
    transaction.siacoinOutputs.push({
      value: (new BigNumber(send_amounts[i]).times(HASTINGS_TO_SC)).toFixed(),
      unlockHash: receipient_addresses[i]
    })
    totalOutAmount = new BigNumber(totalOutAmount).plus(transaction.siacoinOutputs[i].value)

  }

  // add change output
  const change_amount = (totalInputAmount.minus(new BigNumber(totalOutAmount)).minus(fee)).toFixed();
  if (Number(change_amount) !== 0) {
    transaction.siacoinOutputs.push({
      // value: ().toString(),
      value: Number(change_amount) < 0 ? "-1" : change_amount,
      unlockHash: senders_address
    })
  }


  // add miner fees
  transaction.minerFees.push(fee)

  // add signatures
  for (var i = 0; i < inputs_from_api.length; i++) {
    transaction.transactionSignatures.push({
      parentID: inputs_from_api[i].ID,
      publicKeyIndex: 0,
      coveredFields: { wholeTransaction: true },
      signature: Buffer.from(sigHash(transaction, inputs_from_api[i].ID, 0, 0)).toString('base64')
    })
  }

  return _adjust(transaction)
}


function encodeBatchTransaction(inputs_from_api, fee, senders_address, send_amounts, receipient_addresses, private_key) {
  var fee = (new BigNumber(fee).times('1000000000000000000000000000')).toFixed();
  // init empty tx
  var transaction = { siacoinInputs: new Array(), siacoinOutputs: new Array(), minerFees: new Array(), transactionSignatures: new Array() }
  // get sum of input values
  var totalInputAmount = new BigNumber(0)
  // format inputs from siastats.info
  for (var i = 0; i < inputs_from_api.length; i++) {
    transaction.siacoinInputs.push({
      parentID: inputs_from_api[i].ID,
      unlockConditions: {
        publicKeys: [`ed25519:${publicKeyFromPrivateKey(private_key)}`],
        signaturesRequired: 1
      }
    })
    // update total input value
    totalInputAmount = new BigNumber(totalInputAmount).plus(inputs_from_api[i].value)
    console.log(totalInputAmount.toFixed())
  }

  var totalOutAmount = new BigNumber(0)
  // add recipient output
  for (let i = 0; i < send_amounts.length; i++) {
    transaction.siacoinOutputs.push({
      value: (new BigNumber(send_amounts[i]).times(HASTINGS_TO_SC)).toFixed(),
      unlockHash: receipient_addresses[i]
    })
    totalOutAmount = new BigNumber(totalOutAmount).plus(transaction.siacoinOutputs[i].value)

  }

  // add change output
  transaction.siacoinOutputs.push({
    // value: ().toString(),
    value: ((totalInputAmount.minus(new BigNumber(totalOutAmount)).minus(fee))).toFixed(),
    unlockHash: senders_address
  })

  // add miner fees
  transaction.minerFees.push(fee)

  // get keypair
  var keypair = nacl.sign.keyPair.fromSecretKey(Buffer.from(private_key, 'hex'))
  // add signatures
  for (var i = 0; i < inputs_from_api.length; i++) {
    transaction.transactionSignatures.push({
      parentID: inputs_from_api[i].ID,
      publicKeyIndex: 0,
      coveredFields: { wholeTransaction: true },
      signature: Buffer.from(nacl.sign.detached(sigHash(transaction, inputs_from_api[i].ID, 0, 0), keypair.secretKey)).toString('base64')
    })
  }

  return transaction
}

function sigHash(txn, parentID, keyIndex, timelock) {
  return blake2b(32).update(Buffer.concat([
    encodeInt(txn.siacoinInputs.length),
    ...txn.siacoinInputs.map(encodeInput),
    encodeInt(txn.siacoinOutputs.length),
    ...txn.siacoinOutputs.map(encodeOutput),
    encodeInt(0), // fileContracts
    encodeInt(0), // fileContractRevisions
    encodeInt(0), // storageProofs
    encodeInt(0), // siafundInputs
    encodeInt(0), // siafundOutputs
    encodeInt(txn.minerFees.length),
    ...txn.minerFees.map(encodeCurrency),
    encodeInt(0), // arbitraryData

    // signature metadata
    Buffer.from(parentID, 'hex'),
    encodeInt(keyIndex),
    encodeInt(timelock)
  ])).digest()
}

function transactionID(txn) {
  return blake2b(32).update(Buffer.concat([
    encodeInt(txn.siacoinInputs.length),
    ...txn.siacoinInputs.map(encodeInput),
    encodeInt(txn.siacoinOutputs.length),
    ...txn.siacoinOutputs.map(encodeOutput),
    encodeInt(0), // fileContracts
    encodeInt(0), // fileContractRevisions
    encodeInt(0), // storageProofs
    encodeInt(0), // siafundInputs
    encodeInt(0), // siafundOutputs
    encodeInt(txn.minerFees.length),
    ...txn.minerFees.map(encodeCurrency),
    encodeInt(0), // arbitraryData
  ])).digest()
}

function sigHashMinerOutput(blockid, index) {
  return blake2b(32).update(Buffer.concat([
    Buffer.from(blockid, 'hex'),
    encodeInt(index)
  ])).digest()
}

function encodeOutput(output) {
  return Buffer.concat([
    encodeCurrency(output.value),
    Buffer.from(output.unlockHash, 'hex').slice(0, 32)
  ])
}

function encodeInput(input) {
  return Buffer.concat([
    Buffer.from([0]),
    Buffer.from(input.parentID, 'hex'),
    encodeUnlockConditions(input.unlockConditions)
  ])
}

function encodeInput2(input) {
  return Buffer.concat([
    Buffer.from(input.parentID, 'hex'),
    encodeUnlockConditions(input.unlockConditions)
  ])
}

function encodeUnlockConditions(uc) {
  return Buffer.concat([
    encodeInt(uc.timelock),
    encodeInt(uc.publicKeys.length),
    ...uc.publicKeys.map(encodePublicKey),
    encodeInt(uc.signaturesRequired)
  ])
};

function encodePublicKey(pk) {
  var [alg, key] = pk.split(':')
  var algBuf = Buffer.alloc(16)
  algBuf.write(alg)
  return Buffer.concat([
    algBuf,
    encodeInt(key.length / 2),
    Buffer.from(key, 'hex')
  ])
}

function encodeCurrency(c) {
  var hex = new BigNumber(c).toString(16)
  if (hex === '0') {
    hex = ''
  } else if (hex.length % 2 != 0) {
    hex = '0' + hex
  }
  return Buffer.concat([
    encodeInt(hex.length / 2),
    Buffer.from(hex, 'hex')
  ])
}

function encodeInt(n) {
  var buf = Buffer.alloc(8)
  buf.writeInt32LE(n)
  return buf
}

function toLowerCaseKeys(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return obj; // Return the value if obj is not an object
  }

  if (Array.isArray(obj)) {
    return obj.map(toLowerCaseKeys); // Recursively apply to each element if it's an array
  }

  return Object.keys(obj).reduce((acc, key) => {
    const lowerCaseKey = key.toLowerCase();
    acc[lowerCaseKey] = toLowerCaseKeys(obj[key]); // Recursively apply to each value
    return acc;
  }, {});
}

function _adjust(tx) {

  for (const input of tx.siacoinInputs) {
    const new_pk = [];
    for (const pk of input.unlockConditions.publicKeys) {
      const alg = pk.split(':')[0];
      const key = Buffer.from(pk.split(':')[1], 'hex').toString('base64');
      new_pk.push({
        "algorithm": alg,
        "key": key
      });
      input.unlockConditions.publicKeys = new_pk;
    }
  }
  return toLowerCaseKeys(tx);
}

module.exports = {
  encodeBatchTransaction,
  encodeTransaction,
  buildTransaction,
  buildBatchTransaction,
  sigHashMinerOutput,
  transactionID
}
