const nodemailer = require("nodemailer");
const asyncHandler = require("express-async-handler");

const sendEmail = asyncHandler(async (data) => {
    console.log('Bắt đầu quá trình gửi email');
    console.log('EMAIL_NAME:', process.env.EMAIL_NAME);
    console.log('EMAIL_APP_PASSWORD:', process.env.EMAIL_APP_PASSWORD ? 'Đã được đặt' : 'Chưa được đặt');

    try {
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,  
            auth: {
                user: process.env.EMAIL_NAME,
                pass: process.env.EMAIL_APP_PASSWORD
            }
        });

        console.log('Đã tạo transporter');

        await transporter.verify();
        console.log('Kết nối SMTP thành công');

        let info = await transporter.sendMail({
            from: '"Hello" <minhhai123a@gmail.com>',
            to: data.to,
            subject: data.subject,
            text: data.text,
            html: data.html
        });

        console.log("Email đã được gửi: %s", info.messageId);
        return info;
    } catch (error) {
        console.error('Lỗi trong quá trình gửi email:', error);
        throw error;
    }
});

module.exports = {
    sendEmail
}