const express = require('express');
const axios = require('axios');
const googleIt = require('google-it');

const app = express();
const port = 3000;

app.get('/api/azzbot', async (req, res) => {
  const teksnya = req.query.teksnya;
  const sender = req.query.sender;
  const pushname = req.query.pushname;
  const arg1 = req.query.arg1;

  if (!teksnya) {
    res.send('Ada yang bisa AzzBot bantu');
  } else {
    try {
      let retryCount = 0;
      let replyMessage = '';

      while (
        retryCount < 3 &&
        !replyMessage.includes(
          'Maaf, aku belum mengerti dengan pertanyaanmu. Bisa kamu menjelaskannya lagi?'
        )
      ) {
        const yahooArticles = await searchOnGoogle(teksnya);

        const payload = {
          app: {
            id: 'blaael9y3cu1684390361270',
            time: Date.now(),
            data: {
              sender: {
                id: sender + 'AzzBot New'
              },
              message: [
                {
                  id: Date.now(),
                  time: Date.now(),
                  type: 'text',
                  value: `Artikel-artikel yang ditambahkan secara otomatis oleh sistem dan hanya untuk AzzBot:\n\n\`\`\`${yahooArticles}\`\`\`\n\nHalo AzzBot, saya ${pushname}. Saya ingin bertanya, ${teksnya}, tapi tolong jawab dengan cerdas, profesional, dan penjelasan yang detail.`
                }
              ]
            }
          }
        };

        const webhookUrl = 'https://webhook.botika.online/webhook/';
        const headers = {
          'Content-Type': 'application/json',
          Authorization: 'Bearer fbe3d5e1-00a8-4328-8482-53a09a2433e2'
        };

        const webhookResponse = await axios.post(webhookUrl, payload, { headers });
        const { data, status } = webhookResponse;

        if (status === 200) {
          const messages = data.app.data.message;
          if (Array.isArray(messages)) {
            const responseMessages = messages.map(message => message.value);
            replyMessage = responseMessages.join('\n');

            if (/(<BR>|<br>)/i.test(replyMessage)) {
              let newReplyMessage = replyMessage.replace(/<BR>|<br>/gi, '\n');
              newReplyMessage = newReplyMessage.replace(/```/g, '\n');
              let replyMessages = newReplyMessage.split('\n');
              for (const [index, message] of replyMessages.entries()) {
                setTimeout(() => {
                  res.write(' *•* ' + message + '\n');
                }, index * 2000);
              }
            } else {
              res.send(replyMessage);
            }
          } else {
            res.send('Iya, ada yang bisa AzzBot bantu');
          }
        } else {
          res.send('Server down');
        }
      }

      console.log(error);
      res.send('Terjadi kesalahan saat memproses permintaan');
    } catch (error) {
      console.log(error);
      res.send('Terjadi kesalahan saat memproses permintaan');
    }
  }
});

async function searchOnGoogle(text) {
  const search = await googleIt({ query: text, limit: 5 });
  let msg = search
    .map(({ title, link, snippet }) => {
      return `*${title}*\n_${link}_\n_${snippet}_`;
    })
    .join('\n\n');
  const google = msg;
  return google;
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
