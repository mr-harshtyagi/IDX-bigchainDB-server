require("dotenv").config();
const driver = require("bigchaindb-driver");
const base58 = require("bs58");
var CryptoJS = require("crypto-js");
const { Ed25519Sha256 } = require("crypto-conditions");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.json());

app.post("/post", (req,res)=>{
  const data =req.body;

  // post transaction
  res.send(data)

})

const PORT = process.env.PORT || 5000;
app.listen(PORT, function () {
  console.log("Server started on port " + PORT);
});


function postTransaction(){
const API_PATH = "https://test.ipdb.io/api/v1/";
const alice = new driver.Ed25519Keypair();
let data = {
  transaction_hash:
    "d236718718704bb56bff2214b1a349b87b34a94566b58745e34eae394011e3d0",
  status: "Success",
  block_number: "36457354",
  doc_uid: "3364vfehh37373gg",
  doc_version: "3.0",
  issuer: alice.publicKey,
  holder: alice.publicKey,
  doc_signature:
    "83d1c3d3774d8a32b8ea0460330c16d1b2e3e5c0ea86ccc2d70e603aa8c8151d675dfe339d83f3f495fab226795789d4",
  gas_fee: 12,
  datetime: new Date().toString(),
  revocation_status: false,
  prev_hash: "08a14e36be2b8a8cd4c0f03a061f92e9d2cbdc7a6de904f9e34e6a7be72bfb3e",
};
var ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), "7").toString();
const tx = driver.Transaction.makeCreateTransaction(
  { transaction_data: ciphertext },
  { message: "My first BigchainDB transaction" }, // this is metadata

  [
    driver.Transaction.makeOutput(
      driver.Transaction.makeEd25519Condition(alice.publicKey)
    ),
  ],
  alice.publicKey
);

const txSigned = driver.Transaction.signTransaction(tx, alice.privateKey);

// Send the transaction off to BigchainDB
const conn = new driver.Connection(API_PATH);
console.log(alice.publicKey);
console.log(alice.privateKey);
conn
  .postTransactionCommit(txSigned)
  .then((retrievedTx) =>
    console.log("Transaction", retrievedTx.id, "successfully posted.")
  );
}

