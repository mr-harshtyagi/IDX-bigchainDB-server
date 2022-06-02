require("dotenv").config();
const driver = require("bigchaindb-driver");
const base58 = require("bs58");
const crypto =require('crypto')
var CryptoJS = require("crypto-js");
const mongoose = require("mongoose");
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

mongoose.connect(
  `mongodb+srv://identrixprotocol:${process.env.MONGO_PASSWORD}@cluster0.wkmdj.mongodb.net/organisationsDB`,
  {
    useNewUrlParser: true,
  }
);
const idxKeySchema = {
  id: String,
  public_key: String,
  private_key: String,
};
const Key = mongoose.model("Key", idxKeySchema);
const certificateSchema = {
  hash: String,
  certificate_data: Object
};
const Certificate = mongoose.model("Certificate", certificateSchema);

app.post("/post", (req,res)=>{
  const receivedData =req.body;
   const privateKey = "F9LwFF7Jmuf2w7icRk3MTBozP333i8TWKKAFmbfrUHVT";
   const publicKey = "GjgJq7htpLt3rYFTPUyqKBtanupjjuwy6mtYvattKNpN";

    Key.findOne({ id: "2x4e" }, function (err, foundKey) {
    if (err) res.send(err);
    else {
      const pKey = foundKey.private_key;
      const pubKey= foundKey.public_key;
      const sign = crypto.createSign("SHA256");
      sign.write(receivedData.transaction_hash);
      sign.end();
      const signature = sign.sign(pKey, "hex");
      const verify = crypto.createVerify("SHA256");
      verify.write(receivedData.transaction_hash);
      verify.end();
      const status = verify.verify(pubKey, signature, "hex");
      const API_PATH = "https://test.ipdb.io/api/v1/";
      let data = {
        transaction_hash: receivedData.transaction_hash,
        status: "Success",
        block_number: 1, // put 10 transactions in 1 block
        doc_uid: randomId(15),
        doc_version: "1.0",
        issuer: publicKey,
        holder: receivedData.receiver,
        doc_signature: signature,
        signature_status: status,
        gas_fee: Math.floor(Math.random() * 10 + 1) + " IDX",
        datetime: new Date().toString(),
        revocation_status: false,
        prev_hash: "null",
      };
        var ciphertext = CryptoJS.AES.encrypt(
          JSON.stringify(data),
          receivedData.key
        ).toString();
        const tx = driver.Transaction.makeCreateTransaction(
          { transaction_data: ciphertext },
          { message: "Certificate Generated" },
          [
            driver.Transaction.makeOutput(
              driver.Transaction.makeEd25519Condition(publicKey)
            ),
          ],
          publicKey
        );
         const txSigned = driver.Transaction.signTransaction(tx, privateKey);
         const conn = new driver.Connection(API_PATH);
         conn.postTransactionCommit(txSigned).then((retrievedTx) => {
           console.log("Transaction", retrievedTx.id, "successfully posted.");
           res.send({ hash: retrievedTx.id });
         });
    }});})


app.post("/posttomongo", (req,res)=>{
  const receivedData = req.body;
  res.send(receivedData);

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
