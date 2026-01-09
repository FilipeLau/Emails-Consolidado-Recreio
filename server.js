const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const multer = require('multer');
const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// ATENÇÃO: Habilita o CORS para que o seu site no GitHub Pages possa falar com o Railway
app.use(cors());
app.use(express.json());

// ROTA PRINCIPAL: É aqui que o erro 405 é resolvido
app.post('/enviar-email', upload.array('anexos'), async (req, res) => {
    const { para, assunto, corpo, host, port, user, pass } = req.body;

    console.log(`Tentativa de envio recebida para: ${para}`);

    // Configuração do transportador SMTP dinâmico
    let transporter = nodemailer.createTransport({
        host: host,
        port: port,
        secure: port == 465, // true para 465, false para outras como 587
        auth: { user: user, pass: pass },
        tls: { rejectUnauthorized: false } // Importante para redes corporativas
    });

    try {
        const attachments = req.files.map(file => ({
            filename: file.originalname,
            content: file.buffer
        }));

        await transporter.sendMail({
            from: user,
            bcc: para, // Envia para a lista de contatos em cópia oculta
            subject: assunto,
            text: corpo,
            attachments: attachments
        });

        console.log("Email enviado com sucesso!");
        res.status(200).send("Enviado com sucesso!");
    } catch (error) {
        console.error("Erro no Nodemailer:", error);
        res.status(500).send("Erro ao enviar: " + error.message);
    }
});

// Rota de teste simples para verificar se o servidor está vivo
app.get('/', (req, res) => {
    res.send("Servidor de Email da Recreio está ativo!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
