import { init, Sprite, GameLoop, TileEngineClass } from 'kontra';

class IsoTileEngine extends TileEngineClass {
  constructor(props) {
    super(props);
  }

  _r(layer, context) {
    let { opacity, data = [] } = layer;
    let { tilesets, width, tilewidth, tileheight } = this;

    context.save();
    context.globalAlpha = opacity;

    let dataSize = Math.sqrt(data.length);

    for (let i = 0; i < dataSize; i++) {
      for (let j = dataSize; j >= 0; j--) {
        const index = 3 * i + j;
        const tile = data[index];
        // skip empty tiles (0)
        if (!tile) continue;

        // find the tileset the tile belongs to
        // assume tilesets are ordered by firstgid
        let tileset;
        for (let k = tilesets.length - 1; k >= 0; k--) {
          tileset = tilesets[k];

          if (tile / tileset.firstgid >= 1) {
            break;
          }
        }

        let { image, margin = 0, firstgid, columns } = tileset;
        let offset = tile - firstgid;
        let cols = columns ?? (image.width / (tilewidth + margin)) | 0;

        let x = (index % width) * tilewidth;
        let y = ((index / width) | 0) * tileheight;

        let xPos = index % width;
        let yPos = (index / width) | 0;

        x = (xPos * tilewidth / 2) + (yPos * tilewidth / 2);
        y = (yPos * tileheight / 4) - (xPos * tileheight / 4);

        let sx = (offset % cols) * (tilewidth + margin);
        let sy = ((offset / cols) | 0) * (tileheight + margin);

        context.drawImage(
          image,
          sx,
          sy,
          tilewidth,
          tileheight,
          x,
          y,
          tilewidth,
          tileheight
        );
      }
    }

    context.restore();
  }
}


let { canvas, context } = init();

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

let img = new Image();
img.src = 'img/test-tile.png';

let sprite = Sprite({
  x: 100,
  y: 100,
  dx: 2,
  width: 20,
  height: 40,
  color: 'red'
});

img.onload = function() {
  let tileEngine = new IsoTileEngine({
    tilewidth: 32,
    tileheight: 32,
    width: 3,
    height: 3,

    tilesets: [{
      firstgid: 1,
      image: img,
    }],

    layers: [{
      name: 'ground',
      data: [
        0, 0, 0,
        0, 1, 1,
        1, 1, 0,
      ]
    }]
  });

  let loop = GameLoop({
    update() {
      sprite.update();
    },
    render() {
      sprite.render();
      tileEngine.render();
    }
  });

  loop.start();
}
