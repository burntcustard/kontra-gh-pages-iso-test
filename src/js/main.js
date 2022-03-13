import { init, Sprite, GameLoop } from 'kontra';

let { canvas, context } = init();

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

let sprite = Sprite({
  x: 100,
  y: 100,
  dx: 2,
  width: 20,
  height: 40,
  color: 'red'
});

let loop = GameLoop({
  update() {
    sprite.update();
  },
  render() {
    sprite.render();
  }
});

loop.start();
