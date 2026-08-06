const QRCode = require('qrcode');

const generateQRCode = async (data) => {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(data, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return qrCodeDataURL;
  } catch (error) {
    throw new Error('Error generando código QR');
  }
};

const generateQRCodeBuffer = async (data) => {
  try {
    const buffer = await QRCode.toBuffer(data, {
      width: 200,
      margin: 2
    });
    return buffer;
  } catch (error) {
    throw new Error('Error generando código QR');
  }
};

module.exports = { generateQRCode, generateQRCodeBuffer };
