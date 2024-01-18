const videoEl = document.querySelector('.stream');
const resultEl = document.querySelector('.result');

(async () => {
  try {
    if (
      !('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices)
    ) {
      throw new Error('Camera access is not supported by your browser.');
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: {
          ideal: 'environment'
        }
      },
      audio: false
    });

    videoEl.srcObject = stream;
    await videoEl.play();

    if (!('BarcodeDetector' in window)) {
      // Exit early since there's no support for BarcodeDetector
      alert('Barcodes or QR codes are not supported by your browser');
      return;
    }

    // Get supported formats
    const supportedFormats = await BarcodeDetector.getSupportedFormats();
    const supportsQRCode = supportedFormats.includes('qr_code');
    const supportsBarcodes = supportedFormats.some((format) =>
      ['code_39', 'codabar', 'ean_13'].includes(format)
    );

    // Construct an alert message based on supported formats
    let alertMessage = '';
    if (supportsQRCode && !supportsBarcodes) {
      alertMessage =
        'Barcodes are not supported by your browser but QR codes are supported';
    } else if (!supportsQRCode && supportsBarcodes) {
      alertMessage =
        'QR codes are not supported by your browser but Barcodes are supported';
    } else if (!supportsQRCode && !supportsBarcodes) {
      alertMessage = 'Barcodes or QR codes are not supported by your browser';
    }

    // Alert the user if any formats are unsupported.
    if (alertMessage.length) {
      alert(`${alertMessage} ${JSON.stringify(supportedFormats, null, 2)}`);
      return; // Exit early since the necessary supports are not present.
    }

    // both QR codes and barcodes are supported so proceed with barcode detection
    const barcodeDetector = new BarcodeDetector({
      formats: ['qr_code', 'code_39', 'codabar', 'ean_13']
    });

    window.setInterval(async () => {
      try {
        const barcodes = await barcodeDetector.detect(videoEl);
        if (barcodes.length <= 0) return;
        const scannedData = barcodes
          .map((barcode) => barcode.rawValue)
          .join(', ');
        resultEl.textContent = scannedData;
      } catch (err) {
        console.error('Error during barcode detection:', err);
      }
    }, 1000);
  } catch (e) {
    console.error(e);
    resultEl.textContent = e.message;
  }
})();
