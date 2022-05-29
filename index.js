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
  const receivedData =req.body;
  const API_PATH = "https://test.ipdb.io/api/v1/";
  const alice = new driver.Ed25519Keypair();
  let data = {
    transaction_hash:receivedData.transaction_hash,
    status: "Success",
    block_number: "36457354",
    doc_uid: "3364vfehh37373gg",
    doc_version: "1.0",
    issuer: receivedData.publicKey,
    holder: receivedData.receiver,
    doc_signature:receivedData.signature,
    gas_fee: 12,
    datetime: new Date().toString(),
    revocation_status: false,
    prev_hash: "null",
  };
  var ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), receivedData.key).toString();
  const tx = driver.Transaction.makeCreateTransaction(
    { transaction_data: ciphertext },
    { message: "Certificate Generated" }, // this is metadata
    [
      driver.Transaction.makeOutput(
        driver.Transaction.makeEd25519Condition(receivedData.publicKey)
      ),
    ],
    receivedData.publicKey
  );

  const txSigned = driver.Transaction.signTransaction(tx, receivedData.privateKey);

  // Send the transaction off to BigchainDB
  const conn = new driver.Connection(API_PATH);
  conn
    .postTransactionCommit(txSigned)
    .then((retrievedTx) =>
      console.log("Transaction", retrievedTx.id, "successfully posted.")
    );

  // post transaction
  res.send("Transaction", retrievedTx.id, "successfully posted.")

})

const PORT = process.env.PORT || 5000;
app.listen(PORT, function () {
  console.log("Server started on port " + PORT);
});


function postTransaction(){

}

