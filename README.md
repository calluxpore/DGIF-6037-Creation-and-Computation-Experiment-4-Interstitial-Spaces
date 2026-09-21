# Visual Quote Display

## Project Overview

This web-based visual quote display uses HTML, CSS, and JavaScript with p5.js to fetch and present random quotes interactively. Developed as part of the DGIF 6037 Creation & Computation course in the Digital Futures Graduate Program at OCAD University, this project showcases dynamic web programming and creative computation skills.

## Features

- **Dynamic Quote Fetching:** Utilizes the Quotable API to display a new random quote every 30 seconds. If the API is unreachable, a built-in set of quotes is used instead, so a quote is always shown.
- **Interactive Visuals:** A mirrored grid of circles responds to your webcam feed. Darker areas become large filled dots, brighter areas become small outlined rings.
- **Colour Themes:** Switch between four palettes (Mix, Morning Sun, Winter Blue and Forest Green) that recolour both the dots and the quote text. Your choice is remembered between visits.
- **Dot Size Control:** A slider sets the maximum dot size.
- **Responsive Layout:** The grid and quote box rebuild when the window is resized.
- **Snapshot:** Press `S` to save the current canvas as a PNG.
- **Custom Design:** Uses Atkinson Hyperlegible Font for clear and accessible text display.

## Controls

The control pill sits at the bottom left, just above the quote box.

| Control | Action |
| --- | --- |
| Slider | Adjusts the maximum size of the dots |
| Round colour buttons | Switch colour theme: Mix, Morning Sun, Winter Blue, Forest Green |
| `S` key | Save the canvas as a PNG |

## Technologies Used

- HTML5
- CSS3
- JavaScript
- p5.js Library (v1.11.1)
- Quotable API

## Links

- **GitHub Pages:** [Visual Quote Display Live Demo](https://calluxpore.github.io/CC4/)
- **GitHub Repository:** [View on GitHub](https://github.com/calluxpore/CC4)
- **Project Context:** [OCAD University Project Link](https://cc23.ocaduwebspace.ca/4-interstitial-spaces/reflections-of-self/)

## Getting Started

To run this project:

1. Clone the repository.
2. Serve the folder with a local web server. Opening `index.html` directly from disk won't work, because the browser blocks loading the font file. For example:
   ```bash
   python -m http.server 8123
   ```
3. Open `http://localhost:8123` in a modern web browser and allow camera access.

The camera only works on `localhost` or over HTTPS (such as GitHub Pages).

## File Structure

- `index.html`: Main HTML file, including the control pill markup.
- `style.css`: Page and control pill styling.
- `sketch.js`: p5.js sketch with the circle grid, quote rendering and colour themes. To add a new theme, add an entry to the `THEMES` object; a button for it is created automatically.
- `Atkinson-Hyperlegible-Regular-102.ttf`: Font used for the quote text.

## Acknowledgements
- **ChatGPT Attribution:** This code was reviewed and commented by ChatGPT, an AI developed by OpenAI.
- **Font Attribution:** Atkinson Hyperlegible Font by the Braille Institute. [More Info](https://brailleinstitute.org/freefont)
- **API Attribution:** Quotable API by Luke Peavey. [API Link](https://github.com/lukePeavey/quotable)
- **Inspiration/References:**
  - Work by Taylor Tidwell. [YouTube Video](https://youtu.be/8g-DF9hKMgg) and [p5.js Sketch](https://editor.p5js.org/ttidwell24/sketches/q6on3p4oy)
  - Work by Jeff Thompson. [YouTube Video](https://www.youtube.com/watch?v=exrH7tvt3f4)
- **Canvas Mirroring Technique:** Kate Hartman & Nicholas Puckett| OCAD University
- **Course Information:** Work done as part of DGIF 6037 Creation & Computation Fall 2023 in the Digital Futures Graduate Program at OCAD University, Toronto, Canada.

## License

This project is licensed under the [MIT License](LICENSE)

## Contact

For any additional information or feedback, feel free to contact https://github.com/calluxpore.
