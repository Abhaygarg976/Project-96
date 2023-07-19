let jsonObj = [];

async function getval() {
  Swal.fire({
    icon: 'info',
    title: 'Please Wait',
    text: 'Fetching details from the database...',
    showConfirmButton: false,
    allowOutsideClick: false,
    willOpen: async () => {
      Swal.showLoading();
      try {
        const response = await fetch('/getimg', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();

        for (let i = 0; i < data.length; i++) {
          const item = {};
          item['title'] = data[i].user_name;
          item['Imagepath'] = data[i].Imagepath;
          jsonObj.push(item);
        }

        await face();

        Swal.close();
      } catch (error) {
        console.error('Error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to fetch details from the database. Please try again.',
          confirmButtonText: 'OK',
        });
      }
    },
  });
}

async function face() {
  const MODEL_URL = '/models';

  await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
  await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
  await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
  await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);

  const video = document.getElementById('video');
  const displaySize = { width: video.width, height: video.height };

  const labels = jsonObj;
  const labeledFaceDescriptors = await Promise.all(
    labels.map(async (label) => {
      const lbl = label.Imagepath;
      const lbl1 = label.title.toString(); 
      const imgUrl = `profile/${lbl}`;
      const img = await faceapi.fetchImage(imgUrl);
      const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();

      if (!detections) {
        throw new Error(`No faces detected for ${lbl1}`);
      }

      const faceDescriptors = [detections.descriptor];
      return new faceapi.LabeledFaceDescriptors(lbl1, faceDescriptors);
    })
  );

  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);

  let recognizedLabel = null;
  let isFaceMatchChecked = false;
  let hasCheckedIn = false;
  let hasCheckedOut = false;


  function storeCheckinTime(label, latitude, longitude, range_status) {
    fetch('/storeCheckinTime', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ label: label, latitude: latitude, longitude: longitude, range_status: range_status }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Check-in time stored for label:', label);
      })
      .catch((error) => {
        console.error('Error storing check-in time:', error);
      });
  }

  function storeCheckoutTime(label, latitude, longitude, range_status) {
    fetch('/storeCheckoutTime', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ label: label, latitude: latitude, longitude: longitude, range_status: range_status }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Checkout time stored for label:', label);
      })
      .catch((error) => {
        console.error('Error storing checkout time:', error);
      });
  }

  function calculateRange(latitude, longitude) {
    return Math.abs(latitude - longitude);
  }

  function handleCheckin() {
    const currentTime = new Date();
    const checkinTime = new Date();
    checkinTime.setHours(9, 30, 0); // Set check-in time to 9:30 AM

    if (currentTime < checkinTime) {
      Swal.fire({
        icon: 'warning',
        title: 'Cannot Check-In Yet',
        text: 'Check-in time starts at 9:30 AM.',
        confirmButtonText: 'OK',
      });
      return;
    }

    if (hasCheckedIn) {
      Swal.fire({
        icon: 'warning',
        title: 'Already Checked-In',
        text: 'You have already checked in today.',
        confirmButtonText: 'OK',
      });
      return;
    }

    if (recognizedLabel) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          function (position) {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            const range = calculateRange(latitude, longitude);
            let range_status;

            if (range <= 60.0000) {
              range_status = 'ok';
              storeCheckinTime(recognizedLabel, latitude, longitude, range_status);

              Swal.fire({
                icon: 'success',
                title: 'Punch In Successful',
                text: 'Face match found: ' + recognizedLabel,
                confirmButtonText: 'OK',
              }).then(() => {
                window.location.href = '/dashboard';
              });
            } else {
              range_status = 'onfield';
              storeCheckinTime(recognizedLabel, latitude, longitude, range_status);

              Swal.fire({
                icon: 'success',
                title: 'Punch In Successful',
                text: 'Face match found: ' + recognizedLabel,
                confirmButtonText: 'OK',
              }).then(() => {
                window.location.href = '/dashboard';
              });
            }
          },
          function (error) {
            console.error('Error getting geolocation:', error);
            Swal.fire({
              icon: 'error',
              title: 'Failed to get Geolocation',
              text: 'Please try again.',
              confirmButtonText: 'OK',
            });
          }
        );
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Geolocation Not Supported',
          text: 'Geolocation is not supported by this browser.',
          confirmButtonText: 'OK',
        });
      }
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Face Not Found',
        text: 'Please try again.',
        confirmButtonText: 'OK',
      });
    }
  }

  function handleCheckout() {
    const currentTime = new Date();
    const checkoutTime = new Date();
    checkoutTime.setHours(19, 30, 0); 

    if (currentTime > checkoutTime) {
      Swal.fire({
        icon: 'warning',
        title: 'Cannot Check-Out Now',
        text: 'Check-out time ended at 7:30 PM.',
        confirmButtonText: 'OK',
      });
      return;
    }

    if (hasCheckedOut) {
      Swal.fire({
        icon: 'warning',
        title: 'Already Checked-Out',
        text: 'You have already checked out today.',
        confirmButtonText: 'OK',
      });
      return;
    }

    if (recognizedLabel) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          function (position) {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            const range = calculateRange(latitude, longitude);
            let range_status;

            if (range <= 60.0000) {
              range_status = 'ok';
              storeCheckoutTime(recognizedLabel, latitude, longitude, range_status);

              Swal.fire({
                icon: 'success',
                title: 'Punch Out Successful',
                text: 'Face match found: ' + recognizedLabel,
                confirmButtonText: 'OK',
              }).then(() => {
                window.location.href = '/dashboard';
              });
            } else {
              range_status = 'onfield';
              storeCheckoutTime(recognizedLabel, latitude, longitude, range_status);

              Swal.fire({
                icon: 'success',
                title: 'Punch Out Successful',
                text: 'Face match found: ' + recognizedLabel,
                confirmButtonText: 'OK',
              }).then(() => {
                window.location.href = '/dashboard';
              });
            }
          },
          function (error) {
            console.error('Error getting geolocation:', error);
            Swal.fire({
              icon: 'error',
              title: 'Failed to get Geolocation',
              text: 'Please try again.',
              confirmButtonText: 'OK',
            });
          }
        );
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Geolocation Not Supported',
          text: 'Geolocation is not supported by this browser.',
          confirmButtonText: 'OK',
        });
      }
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Face Not Found',
        text: 'Please try again.',
        confirmButtonText: 'OK',
      });
    }
  }

  document.getElementById('checkin-btn').addEventListener('click', handleCheckin);
  document.getElementById('checkout-btn').addEventListener('click', handleCheckout);

  function showFaceNotFoundMessage() {
    Swal.fire({
      icon: 'warning',
      title: 'Face Not Found',
      text: 'Please try again.',
      confirmButtonText: 'OK',
    }).then(() => {
      document.getElementById('checkin-btn').style.display = 'none';
      document.getElementById('checkout-btn').style.display = 'none';
      speak('Face not found. Please try again.');
    });
  }

  setInterval(async () => {
    if (!isFaceMatchChecked) {
      const detections = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors();
      const resizedDetections = faceapi.resizeResults(detections, displaySize);

      const results = resizedDetections.map((detection) => {
        const bestMatch = faceMatcher.findBestMatch(detection.descriptor);
        const box = detection.detection.box;

        return { bestMatch, box };
      });

      let faceFound = false;

      results.forEach((result) => {
        const { bestMatch, box } = result;
        const label = bestMatch.label;
        const distance = bestMatch.distance;

        if (distance < 0.5) {
          recognizedLabel = label;
          faceFound = true;
        }
      });

      if (faceFound) {
        Swal.fire({
          icon: 'success',
          title: 'Face Match Found',
          text: 'Face match found: ' + recognizedLabel,
          confirmButtonText: 'OK',
        }).then(() => {
          speak('Face match found: ' + recognizedLabel);
        });
      } else {
        showFaceNotFoundMessage();
      }

      isFaceMatchChecked = true;
    }
  }, 100);
}

function startFaceRecognition() {
  const video = document.getElementById('video');
  const constraints = { video: true };

  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(function (stream) {
        video.srcObject = stream;
        video.play();
        document.getElementById('btn').style.display = 'block';
      })
      .catch(function (error) {
        console.error('Error accessing the camera:', error);
      });
  } else if (navigator.getUserMedia) {
    navigator.getUserMedia(
      constraints,
      function (stream) {
        video.srcObject = stream;
        video.play();
        document.getElementById('btn').style.display = 'block';
      },
      function (error) {
        console.error('Error accessing the camera:', error);
      }
    );
  } else if (navigator.webkitGetUserMedia) {
    navigator.webkitGetUserMedia(
      constraints,
      function (stream) {
        video.srcObject = stream;
        video.play();
        document.getElementById('btn').style.display = 'block';
      },
      function (error) {
        console.error('Error accessing the camera:', error);
      }
    );
  } else {
    alert('getUserMedia is not supported by this browser.');
  }
}

function speak(message) {
  if ('speechSynthesis' in window) {
    const speechMsg = new SpeechSynthesisUtterance(message);
    speechSynthesis.speak(speechMsg);
  }
}
startFaceRecognition();
getval();
