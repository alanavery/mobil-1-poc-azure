document.addEventListener('DOMContentLoaded', () => {
  const endpoint =
    'https://product-recognition-python.cognitiveservices.azure.com/';
  const model = 'ms-pretrained-product-detection';
  const key = '4aa4fa290d7548848861dc6fc88c6a3a';
  const canvas = document.querySelector('.canvas');
  const video = document.querySelector('.video');
  const button = document.querySelector('.button');
  let runNum = 0;

  const removeBoxes = () => {
    const boxes = document.querySelectorAll('.box');

    if (boxes.length >= 1) {
      boxes.forEach((box) => box.remove());
    }
  };

  const renderBox = (imageWidth, imageHeight, boundingBox) => {
    const wrapper = document.querySelector('.wrapper');
    const box = document.createElement('div');

    box.className = 'box';
    box.style.width = `calc((${boundingBox.w} / ${imageWidth}) * 100%)`;
    box.style.height = `calc((${boundingBox.h} / ${imageHeight}) * 100%)`;
    box.style.top = `calc((${boundingBox.y} / ${imageHeight}) * 100%)`;
    box.style.left = `calc((${boundingBox.x} / ${imageWidth}) * 100%)`;

    wrapper.appendChild(box);
  };

  const sendApiRequest = async (url, options) => {
    const response = await fetch(url, options);
    const result = await response.json();
    return result;
  };

  const getRun = async (run) => {
    const url = `${endpoint}computervision/productrecognition/${model}/runs/${run}?api-version=2023-04-01-preview`;

    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': key,
      },
      redirect: 'follow',
    };

    const result = await sendApiRequest(url, options);

    console.log(result);

    if (result.status === 'succeeded') {
      const { imageMetadata, products } = result.result;
      const { width, height } = imageMetadata;

      removeBoxes();

      products.forEach(({ boundingBox }) => {
        renderBox(width, height, boundingBox);
      });
    }

    return result;
  };

  const createRun = async (blob) => {
    const run = `test-29-${runNum}`;
    const url = `${endpoint}computervision/productrecognition/${model}/runs/${run}?api-version=2023-04-01-preview`;

    const options = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/octet-stream',
        'Ocp-Apim-Subscription-Key': key,
      },
      body: blob,
      redirect: 'follow',
    };

    const createRunResult = await sendApiRequest(url, options);

    console.log(createRunResult);

    if (!createRunResult.error) {
      let status = createRunResult.status;

      while (status !== 'succeeded' && status !== 'error') {
        const getRunResult = await getRun(run);
        status = getRunResult.error ? 'error' : getRunResult.status;
      }

      if (status === 'succeeded') {
        console.log('Image analyzed.');

        if (runNum <= 10) {
          captureImage();
          runNum++;
        }
      }
    }
  };

  const captureImage = () => {
    canvas
      .getContext('2d')
      .drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    canvas.toBlob((blob) => createRun(blob));
  };

  const handleVideoLoaded = () => {
    video.play();
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    button.disabled = false;
  };

  video.addEventListener('loadeddata', handleVideoLoaded);
  button.addEventListener('click', captureImage);

  window.navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((stream) => (video.srcObject = stream))
    .catch((error) => console.error('Application Error:', error));
});

// "Requests to the ProductRecognition_Get Operation under Computer Vision API (2023-04-01-preview) have exceeded call rate limit of your current ComputerVision F0 pricing tier. Please retry after 40 seconds. To increase your rate limit switch to a paid tier."
