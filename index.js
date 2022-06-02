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
   const privateKey = "F9LwFF7Jmuf2w7icRk3MTBozP333i8TWKKAFmbfrUHVT";
   const publicKey = "GjgJq7htpLt3rYFTPUyqKBtanupjjuwy6mtYvattKNpN";
  // Fetch IDX public and private key from DB
  
  const API_PATH = "https://test.ipdb.io/api/v1/";
  let data = {
    transaction_hash:receivedData.transaction_hash,
    status: "Success",
    block_number: 1, // put 10 transactions in 1 block
    doc_uid: randomId(15),
    doc_version: "1.0",
    issuer: publicKey, 
    holder: receivedData.receiver, 
    doc_signature:"create signature on server",
    gas_fee: Math.floor((Math.random() * 10) + 1),
    datetime: new Date().toString(),
    revocation_status: false,
    prev_hash: "null",
  };
  
  var ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), receivedData.key).toString();
  const tx = driver.Transaction.makeCreateTransaction(
    { transaction_data: ciphertext },
    { message: "Certificate Generated" },
    [
      driver.Transaction.makeOutput(
        driver.Transaction.makeEd25519Condition(publicKey)
      ),
    ],
    receivedData.publicKey
  );
  const txSigned = driver.Transaction.signTransaction(tx, privateKey);
  const conn = new driver.Connection(API_PATH);
  conn
    .postTransactionCommit(txSigned)
    .then((retrievedTx) =>
      {
      console.log("Transaction", retrievedTx.id, "successfully posted.");
      res.send({hash:retrievedTx.id})
    }
    );
  
})

// generate random documentID
function randomId(length) {
  return Math.round(
    Math.pow(36, length + 1) - Math.random() * Math.pow(36, length)
  )
    .toString(36)
    .slice(1);
}



app.listen(PORT, function () {
  console.log("Server started on port " + PORT);
});
