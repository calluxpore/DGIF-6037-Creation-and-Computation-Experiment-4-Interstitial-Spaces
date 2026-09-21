//ChatGPT Attribution: This code was reviewed and commented by ChatGPT, an AI developed by OpenAI
//Font Attribution: Atkinson Hyperlegible Font by the Braille Institute.
//API Attribution: Quotable API by Luke Peavey.
//Inspiration/References:
//Work by Taylor Tidwell. YouTube Video and p5.js Sketch
//Work by Jeff Thompson. YouTube Video
//Canvas Mirroring Technique: Kate Hartman & Nicholas Puckett| OCAD University
//Course Information: Work done as part of DGIF 6037 Creation & Computation Fall 2023 in the Digital Futures Graduate Program at OCAD University, Toronto, Canada

// Global variables for different functionalities
let quoteData; // Stores the current quote ({ content, author })
let quoteLayer; // Offscreen buffer holding the pre-rendered quote box
let myFont; // Font used for text rendering
// Colour themes: `dots` colour the circle grid, `text` colours the quote words
const THEMES = {
  mix: {
    label: "Mix",
    dots: ["#9b2226", "#ae2012", "#bb3e03", "#ca6702", "#ee9b00",
           "#eeb300", "#e9d8a6", "#94d2bd", "#0a9396", "#005f73"],
    text: ["#9b2226", "#ae2012", "#bb3e03", "#ca6702", "#ee9b00",
           "#eeb300", "#e9d8a6", "#94d2bd", "#0a9396", "#005f73"],
  },
  morningSun: {
    label: "Morning Sun",
    dots: ["#dc2f02", "#e85d04", "#f48c06", "#faa307", "#ffba08",
           "#ff9e00", "#ffd166", "#ffe8a3", "#ffadad", "#ffd6a5"],
    text: ["#ffba08", "#faa307", "#ffd166", "#ffadad", "#ffe8a3", "#f48c06"],
  },
  winterBlue: {
    label: "Winter Blue",
    dots: ["#023e8a", "#0077b6", "#0096c7", "#00b4d8", "#48cae4",
           "#90e0ef", "#ade8f4", "#caf0f8", "#e0fbfc", "#5e60ce"],
    text: ["#48cae4", "#90e0ef", "#caf0f8", "#ade8f4", "#00b4d8"],
  },
  forestGreen: {
    label: "Forest Green",
    dots: ["#1b4332", "#2d6a4f", "#40916c", "#52b788", "#74c69d",
           "#95d5b2", "#b7e4c7", "#d8f3dc", "#606c38", "#a3b18a"],
    text: ["#52b788", "#74c69d", "#95d5b2", "#b7e4c7", "#d8f3dc"],
  },
};
let theme = THEMES.mix; // Active colour theme
let slider; // Dot size slider (HTML range input)
let video; // Video capture object
let grid; // Object representing a grid of circles
let videoReady = false; // Flag to check if video is ready

const GRID_SIZE = 30; // Spacing between circles in pixels
const QUOTE_URL = "https://api.quotable.io/random";
const QUOTE_INTERVAL = 30000; // New quote every 30 seconds

// Used when the Quotable API is unreachable
const FALLBACK_QUOTES = [
  { content: "Know thyself.", author: "Delphic maxim" },
  { content: "The unexamined life is not worth living.", author: "Socrates" },
  { content: "I think, therefore I am.", author: "René Descartes" },
  { content: "Man is the measure of all things.", author: "Protagoras" },
  { content: "To be, or not to be: that is the question.", author: "William Shakespeare" },
  {
    content: "Life can only be understood backwards; but it must be lived forwards.",
    author: "Søren Kierkegaard",
  },
];

// Preload function to load assets before the sketch starts
function preload() {
  myFont = loadFont("Atkinson-Hyperlegible-Regular-102.ttf");
}

function setup() {
  pixelDensity(1); // Avoid drawing 4x the pixels on high-DPI screens
  createCanvas(windowWidth, windowHeight);
  frameRate(60);

  slider = document.getElementById("size-slider");
  setupThemeButtons();

  // Capture at grid resolution: one video pixel per circle
  video = createCapture(VIDEO, function () {
    console.log("Video is ready");
    videoReady = true;
  });
  video.hide();

  grid = new CircleGrid();
  video.size(grid.cols, grid.rows);

  fetchQuote();
  setInterval(fetchQuote, QUOTE_INTERVAL);
}

function draw() {
  background(0, 50);
  if (videoReady) {
    grid.display();
  }
  if (quoteLayer) {
    image(quoteLayer, 0, height - quoteLayer.height);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  grid = new CircleGrid();
  video.size(grid.cols, grid.rows);
  renderQuote();
}

// Builds one circular button per theme inside the control pill
function setupThemeButtons() {
  const container = document.querySelector(".themes");
  for (const [key, t] of Object.entries(THEMES)) {
    const button = document.createElement("button");
    button.className = "theme-button";
    button.dataset.theme = key;
    button.title = t.label;
    button.setAttribute("aria-label", t.label);
    button.style.background = "conic-gradient(" + t.dots.join(", ") + ")";
    button.addEventListener("click", () => setTheme(key));
    container.appendChild(button);
  }

  let saved = null;
  try {
    saved = localStorage.getItem("theme");
  } catch (e) {}
  setTheme(THEMES[saved] ? saved : "mix");
}

// Switches the dot and text palette, then redraws the quote
function setTheme(key) {
  theme = THEMES[key];
  try {
    localStorage.setItem("theme", key);
  } catch (e) {}

  for (const button of document.querySelectorAll(".theme-button")) {
    button.setAttribute("aria-pressed", button.dataset.theme === key);
  }
  document.querySelector(".controls").style.setProperty("--accent", theme.dots[4]);

  if (grid) {
    for (let circ of grid.circles) {
      circ.colorIndex = int(random(theme.dots.length));
    }
  }
  renderQuote();
}

// Fetches a new quote, falling back to a local list if the API fails
async function fetchQuote() {
  try {
    const response = await fetch(QUOTE_URL, { signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error("HTTP " + response.status);
    const data = await response.json();
    quoteData = { content: data.content, author: data.author };
  } catch (err) {
    console.warn("Quote API unavailable, using fallback:", err.message);
    let next;
    do {
      next = random(FALLBACK_QUOTES);
    } while (FALLBACK_QUOTES.length > 1 && quoteData && next.content === quoteData.content);
    quoteData = next;
  }
  renderQuote();
}

// Lays out and draws the quote box once into an offscreen buffer
function renderQuote() {
  if (!quoteData) return;

  const textSizePx = 52; //text size of the fetched quote
  const padding = 20;
  const lineHeight = 62; //height of the fetched quote rectangle from base
  const cornerRadius = 20;
  const author = "- " + quoteData.author;

  textFont(myFont);
  textSize(textSizePx);
  const lines = splitQuoteIntoLines(quoteData.content, width - 2 * padding);
  const textBoxHeight = (lines.length + 2) * lineHeight + padding * 2;

  if (quoteLayer) quoteLayer.remove();
  quoteLayer = createGraphics(width, textBoxHeight);
  quoteLayer.pixelDensity(1);
  const g = quoteLayer;

  g.stroke("#FFFFFF");
  g.fill(0);
  g.rect(0.5, 0.5, width - 1, textBoxHeight - 1, cornerRadius);

  g.noStroke();
  g.textFont(myFont);
  g.textSize(textSizePx);
  g.textAlign(LEFT, TOP);

  let currentY = padding;
  for (let line of lines) {
    let words = line.split(" ");
    let currentX = width / 2 - g.textWidth(line) / 2;
    for (let i = 0; i < words.length; i++) {
      let word = words[i] + " ";
      g.fill(theme.text[i % theme.text.length]);
      g.text(word, currentX, currentY);
      currentX += g.textWidth(word);
    }
    currentY += lineHeight;
  }

  g.textAlign(CENTER, TOP);
  g.fill(255);
  g.text(author, width / 2, currentY + lineHeight);

  // Keep the control pill sitting just above the quote box
  document.querySelector(".controls").style.bottom = textBoxHeight + 16 + "px";
}

// Utility function to split the quote into lines (uses the current textSize)
function splitQuoteIntoLines(quote, maxWidth) {
  let words = quote.split(" ");
  let lines = [];
  let currentLine = "";

  for (let i = 0; i < words.length; i++) {
    let word = words[i];
    let testLine = currentLine + word + " ";
    let metrics = textWidth(testLine);

    if (metrics > maxWidth && i > 0) {
      lines.push(currentLine.trim());
      currentLine = word + " ";
    } else {
      currentLine = testLine;
    }
  }
  lines.push(currentLine.trim());
  return lines;
}

// Classes for Circle and CircleGrid
class CircleClass {
  constructor(px, py, s) {
    this.positionX = px;
    this.positionY = py;
    this.size = s;
    this.colorIndex = int(random(theme.dots.length));
  }
}

class CircleGrid {
  // Manages a grid of circles that respond to video input
  constructor() {
    this.gridSize = GRID_SIZE;
    this.cols = ceil(width / this.gridSize);
    this.rows = ceil(height / this.gridSize);
    this.circles = [];

    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        this.circles.push(
          new CircleClass(
            x * this.gridSize + this.gridSize / 2,
            y * this.gridSize + this.gridSize / 2,
            this.gridSize / 2
          )
        );
      }
    }
  }

  display() {
    video.loadPixels();
    // Capture may not have resized yet (e.g. right after a window resize)
    if (video.pixels.length !== this.cols * this.rows * 4) return;

    const maxSize = Number(slider.value);

    // Update sizes from video brightness
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        // Mirror horizontally by sampling from the opposite column
        // (with the help of Kate Hartman)
        let index = (y * this.cols + (this.cols - 1 - x)) * 4;
        let r = video.pixels[index];
        let g = video.pixels[index + 1];
        let b = video.pixels[index + 2];
        let lum = 0.299 * r + 0.587 * g + 0.114 * b;
        this.circles[y * this.cols + x].size = map(lum, 0, 255, maxSize, 2);
      }
    }

    // Draw grouped by colour so fill/stroke are set ~20 times per frame, not per circle
    strokeWeight(1);
    for (let c = 0; c < theme.dots.length; c++) {
      noStroke();
      fill(theme.dots[c]);
      for (let circ of this.circles) {
        if (circ.colorIndex === c && circ.size > 15) {
          circle(circ.positionX, circ.positionY, circ.size);
        }
      }
      noFill();
      stroke(theme.dots[c]);
      for (let circ of this.circles) {
        if (circ.colorIndex === c && circ.size <= 15) {
          circle(circ.positionX, circ.positionY, circ.size);
        }
      }
    }

    // Randomly change color of one circle
    random(this.circles).colorIndex = int(random(theme.dots.length));
  }
}

function keyPressed() {
  // Saves the canvas as an image when 's' key is pressed
  if (key === "s" || key === "S") {
    saveCanvas("myCanvas", "png");
  }
}
