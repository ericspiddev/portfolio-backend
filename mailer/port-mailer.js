import nodemailer from "nodemailer";
import path from "path";
import {promises as fs} from "fs";

export class EmailData {
    fullName;
    userEmail;
    customMessage;

    constructor(fullName, userEmail, customMessage){
        this.fullName = fullName;
        this.userEmail = userEmail;
        this.customMessage = customMessage;
    }
    verifyUserData() {
        if(this.verifyDataField(this.fullName)) {
            console.log("Error: parsing user full name");
            return false;
        }
        if(this.verifyDataField(this.userEmail)) {
            console.log("Error: parsing user email");
            return false;
        }
        if(this.verifyDataField(this.customMessage)) {
            console.log("Error: parsing custom message");
            return false;
        }
        console.log("Verified message!");
        return true;
    }

    verifyDataField(field) {
        if(field == null || field.length == 0) {
            console.log("Null or empty field");
            return -1;
        }
        else if(field.length > this.dataMax) {
            console.log("Data exceeds field of length " + this.dataMax);
            console.log("Splicing message or name to max size");
        }
        return 0;
    }
};

export class PortfolioMailer {
    constructor(host, port, user, password, receiver, dataMaxLength, templatePath) {
        this.host = host;
        this.port = port;
        this.user = user;
        this.password = password;
        this.receiver = receiver;
        this.dataMax = dataMaxLength;
        this.htmlTemplate = templatePath;
        this.mailData = undefined;
        this.emailTransporter = nodemailer.createTransport({
            host: this.host || 'gmail',
            port: this.port || 587,
            secure: this.useSecurePort(this.port),
            auth : {
                user: this.user,
                pass: this.password,
            }
        });
    }

    async sendMail(data) {
        if( this.emailTransporter == null ) {
            console.log("No email transporter setup for class can't send email");
            return -1;
        }
        if( data == null || data == undefined ) {
            console.log("Null data aborting email send");
            return -1;
        }

        if( !data.verifyUserData() ) {
            console.log("Misformed or bad user data aborting email send");
            return -1
        }
        const mail = await this.emailTransporter.sendMail({
            from: "'Eric's Portfolio Website' <" + process.env.MAIL_USER + ">",
            to: this.receiver,
            subject: `${data.fullName} has reached out with a message!`,
            text: this.buildRawEmailText(data),
            html: await this.generateHtmlEmail(data)
        });
    }

    buildRawEmailText(data) {
        let user = `Hello World!, from ${data.fullName}\n\n`;
        let email = `Email: ${data.userEmail} \n`;
        let userMessage = `${data.fullName} says,\n ${data.customMessage}`;
        return user + email + userMessage;
    }

    useSecurePort(port){
        return port == 456;
    }

    setData(body) {
        this.mailData = new EmailData(body.fullName, body.userEmail, body.customMessage);
    }

   async generateHtmlEmail(data) {
        try {
            let htmlContent = await fs.readFile(this.htmlTemplate, 'utf8');
            htmlContent = htmlContent.replace(/{{MESSAGE}}/g, data.customMessage);
            htmlContent = htmlContent.replace(/{{NAME}}/g, data.fullName);
            htmlContent = htmlContent.replace(/{{EMAIL}}/g, data.userEmail);
            return htmlContent;
        }
        catch(err) {
            console.log("Error reading in html email template: " + err);
            throw err;
        }
    }
}
