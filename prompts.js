const dialogQuestions = {
  step1: {
      headerText: "Welcome to Cuttlefish!",
      descriptionText: `This is a tool to crowd-source drawings of buildings for use in 
                        training Generative Adversarial Networks (GANs) for machine learning.
                        The ultimate goal is to generate building images from a simple sketch, but
                        we need lots of examples to train the algorithm.

                        We'd like you to pick an image and quickly sketch what you see. You can upload
                        an image, or we can provide you with one.` ,
      questionText: "Do you want to upload your own reference image?",
      trueButtonText: "Upload my own",
      trueButtonCallback: () => {
        let dialog = showDialog('step2a');
        let p = document.createElement('p');
        let uploadDialog = document.createElement('input');
        uploadDialog.setAttribute('type', 'file');
        uploadDialog.setAttribute('id', 'modalUpload');
        p.appendChild(uploadDialog);
        dialog.descriptionContent.appendChild(p);
      },
      falseButtonText: "Provide random image",
      falseButtonCallback: () => {
        fetch('https://us-central1-sketchgan-256220.cloudfunctions.net/randomFlickrImage')
        .then(response => response.blob())
        .then(blob => URL.createObjectURL(blob))
        .then(url => {
          let dialog = showDialog('step2b');
          let p = document.createElement('p');
          let img = document.createElement('img')
          img.setAttribute('id', 'randomImage');
          img.src = url; 
          img.width = 500; 
          p.appendChild(img);
          dialog.descriptionContent.appendChild(p);
        })
        .catch(err => console.error(err));
      },
  },
  step2a: {
      headerText: "Welcome to Cuttlefish!",
      descriptionText: "Please upload your image using the dialog below",
      questionText: "",
      trueButtonText: "Upload",
      trueButtonCallback: () => {
        let uploadInput = document.getElementById('modalUpload');
        let file = uploadInput.files[0];
        showImageFromFile(file);
        showDialog('step3');
      }
  },
  step2b: {
      headerText: "Welcome to Cuttlefish!",
      descriptionText: `This is a tool to crowd-source drawings of buildings for use in 
                        training Generative Adversarial Networks (GANs) for machine learning.
                        The ultimate goal is to generate building images from a simple sketch, but
                        we need lots of examples to train the algorithm.

                        We'd like you to pick an image and quickly sketch what you see. You can upload
                        an image, or we can provide you with one.` ,
      questionText: "Would you like to use this image?",
      trueButtonText: "No, give me another",
      trueButtonCallback: () => {
        fetch('https://us-central1-sketchgan-256220.cloudfunctions.net/randomFlickrImage')
        .then(response => response.blob())
        .then(blob => URL.createObjectURL(blob))
        .then(url => {
          let dialog = showDialog('step2b');
          let p = document.createElement('p');
          let img = document.createElement('img');
          img.setAttribute('id', 'randomImage');
          img.src = url; 
          img.width = 500; 
          p.appendChild(img);
          dialog.descriptionContent.appendChild(p);
        })
        .catch(err => console.error(err));
      },
      falseButtonText: "Yes, this looks great!",
      falseButtonCallback: () => {
        let img = document.querySelector('img#randomImage');
        showImage(img.src);
        showDialog('step3');
      }
  },
  step3: {
      headerText: "Welcome to Cuttlefish!",
      descriptionText: `Now that you have a reference image, you can either choose to draw usin this app,
                        or draw by hand and upload a photo.`,
      questionText:
        "Do you want to draw using this app or upload an image of a sketch?",
      trueButtonText: "Draw here",
      trueButtonCallback: "step4a",
      falseButtonText: "Upload Image of Sketch",
      falseButtonCallback: () => {
        let dialog = showDialog('step4b');
        let p = document.createElement('p');
        let uploadDialog = document.createElement('input');
        uploadDialog.setAttribute('type', 'file');
        uploadDialog.setAttribute('id', 'modalUpload');
        p.appendChild(uploadDialog);
        dialog.descriptionContent.appendChild(p);
      },
  },
  step4a: {
      headerText: "Welcome to Cuttlefish!",
      descriptionText: `This is an explantion of the drawing tools`,
      questionText:
        "Are you ready to get started?",
      trueButtonText: "Sounds good!",
      trueButtonCallback: "finish"
  },
  step4b: {
      headerText: "Welcome to Cuttlefish!",
      descriptionText: `Now that you have a reference image, you can either choose to draw usin this app,
                        or draw by hand and upload a photo.`,
      questionText:
        "Upload your sketch using the dialog below",
      trueButtonText: "Upload & Send",
      trueButtonCallback: () => {
        postSketch(false);
        showDialog("finish");
      }
  },
};
  
class Dialog {
  constructor(header, description, question, button1Text, button1Callback, button2Text, button2Callback) {
    this.parent = document.querySelector('#modalContainer');
    this.header = header || '';
    this.description = description || '';
    this.question = question || '';
    this.header = header || '';
    this.dialog = null;
    this.buttonOne = { text: button1Text, cb: button1Callback };
    this.buttonTwo = { text: button2Text, cb: button2Callback };
  }

    // showModal
    // Set up the div + placeholders
    setupDialog() {
      if (this.parent.childElementCount > 0) {
        this.parent.removeChild(document.querySelector('.mymodal'));
      }
      this.dialog = document.createElement("div");
      this.dialog.classList.add("mymodal");
      
      this.headerContent = document.createElement("h3");
      this.headerContent.classList.add("confirm-dialog-header");

      this.descriptionContent = document.createElement("p");
      this.descriptionContent.classList.add("confirm-dialog-description");

      this.questionContent = document.createElement("p");
      this.questionContent.classList.add("confirm-dialog-question");

      this.dialog.appendChild(this.headerContent);
      this.dialog.appendChild(this.descriptionContent);
      this.dialog.appendChild(this.questionContent);
  
      const buttonGroup = document.createElement("div");
      buttonGroup.classList.add("confirm-dialog-button-group");
      this.dialog.appendChild(buttonGroup);
      if (this.buttonTwo.text) {
        this.falseButton = document.createElement("button");
        this.falseButton.classList.add(
          "btn",
          "btn-dark",
          "confirm-dialog-button",
          "confirm-dialog-button--false"
        );
        this.falseButton.type = "button";
        buttonGroup.appendChild(this.falseButton);
      }
      if (this.buttonOne.text) {
        this.trueButton = document.createElement("button");
        this.trueButton.classList.add(
          "btn",
          "btn-dark",
          "confirm-dialog-button",
          "confirm-dialog-button--true"
        );
        this.trueButton.type = "button";
        buttonGroup.appendChild(this.trueButton);
      }
      this.parent.append(this.dialog);
      this.showQuestion();
    }

    showQuestion() {
      this.headerContent.textContent = this.header;
      this.descriptionContent.textContent = this.description;
      this.questionContent.textContent = this.question;
      if (this.buttonOne.text) {
        this.trueButton.textContent = this.buttonOne.text;
        this.trueButton.onclick = this.buttonOne.cb;
      }
      if (this.buttonTwo.text) {
        this.falseButton.textContent = this.buttonTwo.text;
        this.falseButton.onclick = this.buttonTwo.cb;
      }
    }

    closeDialog() {
      showDialog('finish');
    }
}

function showDialog(stepKey) {
  if (stepKey === 'finish') {
    document.querySelector('#modalContainer').remove(document.querySelector('.mymodal'));
  } else {
    if (typeof(stepKey) === 'string') {
      let step = dialogQuestions[stepKey];
      let x = () => showDialog(step.trueButtonCallback);
      let y = () => showDialog(step.falseButtonCallback);
      let d = new Dialog(step.headerText, step.descriptionText, step.questionText, step.trueButtonText, x, step.falseButtonText, y);
      d.setupDialog();
      return d;
    } else {
      stepKey();
    }
  }
}

document.addEventListener('readystatechange', (event) => {
    if (document.readyState === "complete") {
      let d = showDialog('step1');
    }
})

