document.addEventListener('DOMContentLoaded', () => {
  const myHeaders = new Headers();
  const button = document.querySelector('.button');
  const video = document.querySelector('.video');
  const canvas = document.querySelector('.canvas');
  let i = 0;

  myHeaders.append(
    'Ocp-Apim-Subscription-Key',
    '4ebfdea9af9c43fa96841ca109eae82f'
  );

  const renderCameraFeed = () => {
    const video = document.querySelector('.video');

    window.navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        video.srcObject = stream;
        video.onloadedmetadata = () => video.play();
      })
      .catch((error) => {
        console.log('There was an error.');
        console.error(error);
      });
  };

  const renderBorder = (imageWidth, imageHeight, { boundingBox }) => {
    const wrapper = document.querySelector('.wrapper');
    const box = document.createElement('div');

    box.className = 'box';
    box.style.width = `calc((${boundingBox.w} / ${imageWidth}) * 100%)`;
    box.style.height = `calc((${boundingBox.h} / ${imageHeight}) * 100%)`;
    box.style.top = `calc((${boundingBox.y} / ${imageHeight}) * 100%)`;
    box.style.left = `calc((${boundingBox.x} / ${imageWidth}) * 100%)`;

    wrapper.appendChild(box);
  };

  const getResults = () => {
    myHeaders.append('Content-Type', 'application/json');

    const requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow',
    };

    fetch(
      `https://test-computer-vision-resource.cognitiveservices.azure.com/computervision/productrecognition/ms-pretrained-product-detection/runs/test-2-${i}?api-version=2023-04-01-preview`,
      requestOptions
    )
      .then((response) => {
        console.log('Got a response.');
        return response.json();
      })
      .then((result) => {
        console.log('Got a result.');
        console.log(result);

        if (result?.status === 'succeeded') {
          const { imageMetadata, products } = result.result;
          const { width, height } = imageMetadata;

          products.forEach((product) => renderBorder(width, height, product));
        }
      })
      .catch((error) => {
        console.log('There was an error.');
        console.error(error);
      });
  };

  const analyzeImage = (blob) => {
    let body;

    if (false) {
      myHeaders.append('Content-Type', 'application/json');

      const imageUrl =
        'https://testworkspace4640503893.blob.core.windows.net/test-images/shelf-image-1.jpeg';

      body = JSON.stringify({ url: imageUrl });
    } else {
      myHeaders.append('Content-Type', 'application/octet-stream');

      body = blob;
    }

    const requestOptions = {
      method: 'PUT',
      headers: myHeaders,
      body,
      redirect: 'follow',
    };

    fetch(
      `https://test-computer-vision-resource.cognitiveservices.azure.com/computervision/productrecognition/ms-pretrained-product-detection/runs/test-2-${i}?api-version=2023-04-01-preview`,
      requestOptions
    )
      .then((response) => {
        console.log('Got a response.');
        return response.json();
      })
      .then((result) => {
        console.log('Got a result.');
        console.log(result);

        if (result?.status === 'notStarted') {
          setTimeout(getResults, 500);
        } else if (result?.error?.code === 'AlreadyExists') {
          getResults();
        }
      })
      .catch((error) => {
        console.log('There was an error.');
        console.error(error);
      });
  };

  const captureImage = () => {
    i++;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    canvas
      .getContext('2d')
      .drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    canvas.toBlob((blob) => {
      const image = new Image();
      const imageUrl = window.URL.createObjectURL(blob);
      image.src = imageUrl;

      analyzeImage(blob);
    });

    if (i <= 4) {
      setTimeout(captureImage, 3000);
    }
  };

  button.addEventListener('click', captureImage);

  renderCameraFeed();
  // renderImage();
});

// const renderImage = () => {
//   const wrapper = document.querySelector('.wrapper');
//   const image = document.createElement('img');

//   image.src = imageUrl;
//   image.alt = '';

//   wrapper.appendChild(image);
// };
