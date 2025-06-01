import {PortfolioMailer, EmailData} from "./mailer/port-mailer.js";
import {readFeatureCommitData, setupPrApiRequests} from "./github/port-github.js";
import express from "express";
import rateLimit from "express-rate-limit";
import cors from "cors";
import dotenv from "dotenv"
const backendPort = 5050;
export const dataPath = "data/feature.json";

const testData = new EmailData("Kailey Walter", "kailey@hotmail.com", "A new message wanting to connect with you about tech");

const limiter = rateLimit({ // limit to 30 requests every 20 minutes
    windowMs: 20 * 60 * 6000,
    max: 30,
});

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
        setupPrApiRequests("*/30 * * * *"); // scehdule job every 30 mins
    }

    setupEndpoints() {
        this.backend.post('/api/test/', (req, res) => {
            mailer.setData(req.body)
            res.sendStatus(200);
        });

        this.backend.get("/api/contributions/:feature_name", async (req, res) => {
            let feature = req.params.feature_name + "_feature" // CHANGE ME we can remove feature
            let data = await readFeatureCommitData(dataPath);
            res.json(data[feature]);
        });
        this.backend.post('/api/send-mail', (req, res) => {
            if( this.mailer == null) {
                console.error("No mailer leaving endpoint");
                res.sendStatus(400);
            }
            try {
                this.mailer.setData(req.body)
                this.mailer.sendMail(this.mailer.mailData)
                res.sendStatus(200);
            }
            catch (error) {
                console.error("Error sending email " + error);
                res.sendStatus(400);
            }
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
