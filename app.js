const express = require('express')

const app = express()

const QRCode = require('qrcode')

const generatePayload = require('promptpay-qr')

const bodyParser = require('body-parser')

const _ = require('lodash')

const cors = require('cors')

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

const server = app.listen(8080, ()=>{
    console.log('server is runing on port 8080')
})

app.post('/generateQR', (req,res) => {
    const amount = parseFloat(_.get(req, ["body" , "amount"]))
    const mobileNumber = '0981319117'
    const payload = generatePayload(mobileNumber, {amount})
    const option = {
        color: {
            dark: '#000',
            light: 'fff'
        }
    }

    QRCode.toDataURL(payload,option, (err,url) => {
        if(err) {
            console.log('generate fail')
            return res.status(400).json({
                RespCode:400,
                RespMassage: 'bad : ' + err
            })
        }else{
            return res.status(200).json({
                RespCode:200,
                RespMassage: 'Done',
                Result: url
            })
        }


    })
})
const corsOptions = {
    origin: '*', // Allow all origins (not recommended for production)
    methods: ['GET', 'POST'], // Specify allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers
};

module.exports = app;



