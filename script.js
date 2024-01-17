(async () => {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: {
        ideal: 'environment'
      }
    },
    audio: false
  });

  const videoEl = document.querySelector('#stream');
  videoEl.srcObject = stream;
  await videoEl.play();

  const barcodeDetector = new BarcodeDetector({
    formats: ['qr_code', 'code_39', 'codabar', 'ean_13']
  });

  window.setInterval(async () => {
    const barcodes = await barcodeDetector.detect(videoEl);
    if (barcodes.length <= 0) return;
    const resultEl = document.querySelector('#result');
    const scannedData = barcodes.map((barcode) => barcode.rawValue);
    console.log({ scannedData });
    resultEl.textContent = scannedData;
  }, 1000);
})();
