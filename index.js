require("dotenv").config();
const driver = require("bigchaindb-driver");
const base58 = require("bs58");
var CryptoJS = require("crypto-js");
const { Ed25519Sha256 } = require("crypto-conditions");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.json());

app.post("/post", (req,res)=>{
  const receivedData =req.body;
  console.log(receivedData);
  res.send(receivedData)
  // const API_PATH = "https://test.ipdb.io/api/v1/";
  // let data = {
  //   transaction_hash:receivedData.transaction_hash,
  //   status: "Success",
  //   block_number: "36457354",
  //   doc_uid: "3364vfehh37373gg",
  //   doc_version: "1.0",
  //   issuer: receivedData.publicKey,
  //   holder: receivedData.receiver,
  //   doc_signature:receivedData.signature,
  //   gas_fee: 12,
  //   datetime: new Date().toString(),
  //   revocation_status: false,
  //   prev_hash: "null",
  // };
  // var ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), receivedData.key).toString();
  // const tx = driver.Transaction.makeCreateTransaction(
  //   { transaction_data: ciphertext },
  //   { message: "Certificate Generated" },
  //   [
  //     driver.Transaction.makeOutput(
  //       driver.Transaction.makeEd25519Condition(receivedData.publicKey)
  //     ),
  //   ],
  //   receivedData.publicKey
  // );
  // const txSigned = driver.Transaction.signTransaction(tx, receivedData.privateKey);

  // const conn = new driver.Connection(API_PATH);
  // conn
  //   .postTransactionCommit(txSigned)
  //   .then((retrievedTx) =>
  //     console.log("Transaction", retrievedTx.id, "successfully posted.")
  //   );
  // res.send("Transaction", retrievedTx.id, "successfully posted.")
})


app.listen(PORT, function () {
  console.log("Server started on port " + PORT);
});
