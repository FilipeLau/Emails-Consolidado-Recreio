const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const multer = require('multer');
const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors()); // Permite que o GitHub Pages acesse o Railway
app.use(express.json());

// Esta é a rota que o seu HTML vai procurar
app.post('/enviar-email', upload.array('anexos'), async (req, res) => {
    const { para, assunto, corpo, host, port, user, pass } = req.body;

    let transporter = nodemailer.createTransport({
        host: host,
        port: parseInt(port),
        secure: port == 465,
        auth: { user: user, pass: pass },
        tls: { rejectUnauthorized: false }
    });

    try {
        const attachments = req.files.map(file => ({
            filename: file.originalname,
            content: file.buffer
        }));

        await transporter.sendMail({
            from: user,
            bcc: para,
            subject: assunto,
            text: corpo,
            attachments: attachments
        });

        res.status(200).send("Enviado com sucesso!");
    } catch (error) {
        console.error(error);
        res.status(500).send("Erro no servidor: " + error.message);
    }
});

// Rota para conferir se o site está online
app.get('/', (req, res) => { res.send("Servidor Online!"); });

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Rodando na porta ${PORT}`);
});
