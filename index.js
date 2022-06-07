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
var nodemailer = require("nodemailer");

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
  doc_uid:Number,
  hash: String,
  certificate_data: Object,
  time_stamp:String
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
        transaction_hash: receivedData.transaction_hash, // transaction data hash actually
        status: "Success",
        block_number: 1, // put 10 transactions in 1 block
        doc_uid:receivedData.doc_uid + 10000000,
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
  const timeStamp = new Date().toDateString();
  const newCertificate = new Certificate({
    ...receivedData,
    time_stamp: timeStamp,
  });
  newCertificate.save().then(() => {
    res.send(timeStamp)
  })    
})

app.get("/getcertid", (req,res)=> {
  Certificate.find(function(err, foundCertificates){
    if(err)
    res.send(err)
    else{
      let n= foundCertificates.length;
      res.send({id:n})
    }})})

app.get("/viewcertificate/:certId/:hash", (req, res) => {
  Certificate.findOne( { doc_uid:req.params.certId } ,function (err, foundCertificate) {
    if (err) res.send(err);
    else {
      if(foundCertificate.hash === req.params.hash)
      res.send(foundCertificate);
    }
  });
});

app.post("/sendemail", (req, res) => {
  const receivedData = req.body;
  console.log(receivedData);
  var transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure:true, // use TLS
    auth: {
      user: "no-reply@identrixprotocol.com",
      pass: "Harsh@123",
    },
  });
  var mailOptions = {
    from: "no-reply@identrixprotocol.com",
    to: receivedData.email,
    subject: "Congratulations! You received a Certificate",
    text: `Your Certificate link is ${receivedData.link}`,
  };
  //use nodemailer to send an email
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
      res.send("Email sent: " + info.response);
    }
  });
});

app.listen(PORT, function () {
  console.log("Server started on port " + PORT);
});
