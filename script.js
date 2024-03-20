const URL = "./modelo/";

let model, webcam, labelContainer, maxPredictions;

async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    webcam = new tmImage.Webcam(200, 200, true);
    await webcam.setup();
    await webcam.play();

    document.getElementById("webcam-container").appendChild(webcam.canvas);
    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) {
        labelContainer.appendChild(document.createElement("div"));
    }

    loop();
}

async function handleImageUpload(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    
    reader.onload = async function() {
        const image = new Image();
        image.onload = async function() {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            canvas.width = 200;
            canvas.height = 200;
            ctx.drawImage(image, 0, 0, 200, 200);
            await predict(canvas);
        };
        image.src = reader.result;
        document.getElementById("uploaded-image").src = reader.result;
        document.getElementById("uploaded-image").style.display = "block";
    };

    reader.readAsDataURL(file);
}

async function loop() {
    webcam.update();
    await predict();
    requestAnimationFrame(loop);
}

async function predict(input) {
    const prediction = await model.predict(input || webcam.canvas);
    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction = prediction[i].className + ": " + (prediction[i].probability * 100).toFixed(2) + "%";
        labelContainer.childNodes[i].innerHTML = classPrediction;
    }
}
