require('dotenv').config()
const Razorpay = require('razorpay');
const cors=require('cors');
const express = require('express')
const connection = require('./config/db');
const PaymentDetailsModel = require('./Models/PaymentDetailsModel');
const morgan = require('morgan');
const crypto =require('crypto');

const app = express()

app.use(cors());
app.use(morgan("tiny"))

app.use(express.json())

var instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

app.get('/', (req, res) => {

  res.status(200).json({
    message: 'Welcome to the API',
  });
}
)

app.post('/checkout', async(req, res) => {

    console.log(req.body)

    var options = {
        amount: Number(req.body.amount)*100,  // amount in the smallest currency unit
        currency: "INR",
        receipt: "order_rcptid_11"
      };

     const maindata =  instance.orders.create(options,async function(err, order) {
     
      const payment = await PaymentDetailsModel.create({name:req.body.name,email:req.body.email,phone:req.body.phone,address:req.body.address,batch:req.body.batch,amount:req.body.amount, order_id: order.id,})
        res.status(201).json(order);
      });
     
})


app.post("/paymentsuccess", async(req, res) => {
  const secret="123456789"
  const shasum=crypto.createHmac("sha256", secret)
  console.log(req.headers,52)
    try{
      let body = req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id;
      console.log(req.body);

      let expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(body.toString(req.body))
        
        const digest=shasum.digest("hex");
console.log(60,digest,req.headers['x-razorpay-signature'])
if(digest===req.headers['x-razorpay-signature']){
  console.log(
    "request is legit"
   //process it 
   )
}else{
  // pass it   
}
     // to get the last payment details
      const lastPayment=await PaymentDetailsModel.findOne({order_id: req.body.razorpay_order_id})
      console.log("lastPayment",lastPayment)
  // to check the signature
      if (expectedSignature === req.body.razorpay_signature){
    const payment = await PaymentDetailsModel.findOneAndUpdate({"order_id":req.body.razorpay_order_id}, {payment_id:req.body.razorpay_payment_id,paymentstatus:"Success"}, {new: true})
    console.log(payment)
      }  
      // if signature not matched
      else{
        const payment = await PaymentDetailsModel.findOneAndUpdate({"order_id":req.body.razorpay_order_id}, {payment_id:req.body.razorpay_payment_id,paymentstatus:"Signature Not Matched"}, {new: true})
    console.log(payment)
      }
    }catch(err){
     console.log(err.message)
    }
    res.json({status:"Ok"})
})

app.post("/paymentfailure", async(req, res) => {
  try{
    console.log(req.body)

  const payment = await PaymentDetailsModel.findOneAndUpdate({"order_id":req.body.metadata.order_id},{description:req.body.description,source:req.body.source,step:req.body.step,reason:req.body.reason,payment_id:req.body.metadata.payment_id,paymentstatus:"Failure"}, {new: true})

    console.log(payment)
  }catch(err){console.log(err.message)}
})


app.listen(8080,async()=>{
    await connection
    console.log('listening on port on 8080')
})