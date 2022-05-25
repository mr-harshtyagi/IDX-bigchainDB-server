const driver = require('bigchaindb-driver')
const base58 = require('bs58');
const crypto = require('crypto');
const { Ed25519Sha256 } = require('crypto-conditions');

const API_PATH = 'https://test.ipdb.io/api/v1/'
const alice = new driver.Ed25519Keypair()

const tx = driver.Transaction.makeCreateTransaction(

    { 
     transaction_hash:"d236718718704bb56bff2214b1a349b87b34a94566b58745e34eae394011e3d0", 
     status:"Success", 
     block_number:"36457354",
     doc_uid:"3364vfehh37373gg",
     doc_version:1.0,
     issuer:alice.publicKey,
     holder:alice.publicKey,
     doc_signature:"83d1c3d3774d8a32b8ea0460330c16d1b2e3e5c0ea86ccc2d70e603aa8c8151d675dfe339d83f3f495fab226795789d4",
     gas_fee:12,
     datetime: new Date().toString(),
     revocation_status:false,
      // obtained by hashing above 7 fields

    },

    { message: 'My first BigchainDB transaction' }, // this is metadata

    [ driver.Transaction.makeOutput(
            driver.Transaction.makeEd25519Condition(alice.publicKey))
    ],
    alice.publicKey
)

const txSigned = driver.Transaction.signTransaction(tx, alice.privateKey)

// Send the transaction off to BigchainDB
const conn = new driver.Connection(API_PATH)

conn.postTransactionCommit(txSigned)
    .then(retrievedTx => console.log('Transaction', retrievedTx.id, 'successfully posted.'))