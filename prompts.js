class ModalDialog {
    constructor(questions) {
      this.questions = questions;
      this.parent = document.querySelector('#modalContainer');
      this.visibility = false;
      this.responses = [];
      this.dialog = null;
      this.questionContent = null;
      this.falseButton = null;
      this.trueButton = null;
    }
  
    // showModal
    // Set up the div + placeholders
    setupDialog() {
      this.dialog = document.createElement("div");
      this.dialog.classList.add("mymodal");
  
      this.questionContent = document.createElement("div");
      this.questionContent.classList.add("confirm-dialog-question");
      this.dialog.appendChild(this.questionContent);
  
      const buttonGroup = document.createElement("div");
      buttonGroup.classList.add("confirm-dialog-button-group");
      this.dialog.appendChild(buttonGroup);
  
      this.falseButton = document.createElement("button");
      this.falseButton.classList.add(
        "confirm-dialog-button",
        "confirm-dialog-button--false"
      );
      this.falseButton.type = "button";
      buttonGroup.appendChild(this.falseButton);
  
      this.trueButton = document.createElement("button");
      this.trueButton.classList.add(
        "confirm-dialog-button",
        "confirm-dialog-button--true"
      );
      this.trueButton.type = "button";
      buttonGroup.appendChild(this.trueButton);
  
      this.trueButton.addEventListener("click", () => {
        this.responses.push(true);
        // document.querySelector("#responses").textContent = this.responses;
        if (this.responses.length === this.questions.length) {
          this.parent.removeChild(this.dialog);
          this.parent.textContent = "All done!";
        } else {
          this.showQuestion(this.questions[this.responses.length]);
        }
      });
  
      this.falseButton.addEventListener("click", () => {
        this.responses.push(false);
        // document.querySelector("#responses").textContent = this.responses;
        if (this.responses.length === this.questions.length) {
              this.parent.removeChild(this.dialog);
              this.parent.textContent = "All done!"
        } else {
          this.showQuestion(this.questions[this.responses.length]);
        }
      });
  
      this.parent.append(this.dialog);
      this.showQuestion(this.questions[0]);
    }
  
    // showQuestion
    // Update content + add event listeners, add responses
    showQuestion(question) {
      this.questionContent.textContent = question.questionText;
      this.trueButton.textContent = question.trueButtonText;
      this.falseButton.textContent = question.falseButtonText;
    }
  
    closeDialog() {}
  }
  
  const dialogQuestions = [
    {
      questionText: "Do you want to upload your own reference image?",
      trueButtonText: "Upload my own",
      falseButtonText: "Use the given image"
    },
    {
      questionText:
        "Do you want to draw using this app or upload an image of a sketch?",
      trueButtonText: "Draw",
      falseButtonText: "Upload Image of Sketch"
    }
  ];
  
  document.addEventListener('readystatechange', (event) => {
      if (document.readyState === "complete") {
        let d = new ModalDialog(dialogQuestions);
        d.setupDialog();
      }
  })
  