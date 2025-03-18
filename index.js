import {PortfolioMailer, EmailData}  from "./mailer/port-mailer.js";
import express from "express";
import cors from "cors";
import dotenv from "dotenv"
const backendPort = 5050;

const testData = new EmailData("Kailey Walter", "kailey@hotmail.com", "A new message wanting to connect with you about tech");

class PortfolioBackend {
    constructor() {
        this.backend = express();
        this.isSetup = false;
        dotenv.config();
        this.backend.use(cors());
        this.mailer = new PortfolioMailer(
            process.env.MAIL_HOST, 
            process.env.MAIL_PORT, 
            process.env.MAIL_USER,
            process.env.MAIL_PASSWORD,
            process.env.MAIL_RECEIVER,
            process.env.MAIL_FIELD_MAX_SIZE,
            process.env.HTML_MAIL_TEMP,
        ); 
    }

    setupExpress() {
        this.backend.use(express.json()); 
        this.backend.use(express.urlencoded());
    }

    setupEndpoints() {
        this.backend.post('/api/test/', (req, res) => {
            mailer.setData(req.body)
            res.sendStatus(200);
        });
        this.backend.post('/api/send-mail', (req, res) => {
            console.log("sending email.....");
            if( this.mailer == null) { 
                console.log("No mailer leaving endpoint"); 
            }
            try {
                this.mailer.setData(req.body)
                this.mailer.sendMail(this.mailer.mailData)
            }
            catch (error) {
                console.log("Error sending email " + error);
            }
            res.json({message: "Succesfully sent mail"}); 
        });
        this.isSetup = true;
    }

    start(port) {
        if(!this.isSetup) {
            console.log("Can't start backend yet need to call setup endpoints first");
        }
        this.backend.listen(port, this.startCb(port));
    }

    startCb(port){
        console.log('Eric\'s portfoilio backend listening on port ', port);
    }
}

const be = new PortfolioBackend();
be.setupExpress();
be.setupEndpoints();
be.start(backendPort);
