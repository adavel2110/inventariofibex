const JsBarcode = require('jsbarcode');
const { createCanvas } = require('canvas');

const generateBarcode = (data) => {
  const canvas = createCanvas(200, 100);
  JsBarcode(canvas, data, {
    format: 'CODE128',
    width: 2,
    height: 50,
    displayValue: true,
    fontSize: 12,
    margin: 5
  });
  return canvas.toBuffer('image/png');
};

module.exports = { generateBarcode };
