(() => {
  // node_modules/kontra/kontra.mjs
  var noop = () => {
  };
  function removeFromArray(array, item) {
    let index = array.indexOf(item);
    if (index != -1) {
      array.splice(index, 1);
      return true;
    }
  }
  var callbacks$2 = {};
  function emit(event, ...args) {
    (callbacks$2[event] || []).map((fn) => fn(...args));
  }
  var canvasEl;
  var context;
  var handler$1 = {
    get(target, key) {
      if (key == "_proxy")
        return true;
      return noop;
    }
  };
  function getContext() {
    return context;
  }
  function init$1(canvas2, { contextless = false } = {}) {
    canvasEl = document.getElementById(canvas2) || canvas2 || document.querySelector("canvas");
    if (contextless) {
      canvasEl = canvasEl || new Proxy({}, handler$1);
    }
    if (!canvasEl) {
      throw Error("You must provide a canvas element for the game");
    }
    context = canvasEl.getContext("2d") || new Proxy({}, handler$1);
    context.imageSmoothingEnabled = false;
    emit("init");
    return { canvas: canvasEl, context };
  }
  function rotatePoint(point, angle) {
    let sin = Math.sin(angle);
    let cos = Math.cos(angle);
    return {
      x: point.x * cos - point.y * sin,
      y: point.x * sin + point.y * cos
    };
  }
  function clamp(min, max, value) {
    return Math.min(Math.max(min, value), max);
  }
  var Vector = class {
    constructor(x = 0, y = 0, vec = {}) {
      this.x = x;
      this.y = y;
      if (vec._c) {
        this.clamp(vec._a, vec._b, vec._d, vec._e);
        this.x = x;
        this.y = y;
      }
    }
    add(vec) {
      return new Vector(this.x + vec.x, this.y + vec.y, this);
    }
    subtract(vec) {
      return new Vector(this.x - vec.x, this.y - vec.y, this);
    }
    scale(value) {
      return new Vector(this.x * value, this.y * value);
    }
    normalize(length = this.length()) {
      return new Vector(this.x / length, this.y / length);
    }
    dot(vec) {
      return this.x * vec.x + this.y * vec.y;
    }
    length() {
      return Math.hypot(this.x, this.y);
    }
    distance(vec) {
      return Math.hypot(this.x - vec.x, this.y - vec.y);
    }
    angle(vec) {
      return Math.acos(this.dot(vec) / (this.length() * vec.length()));
    }
    clamp(xMin, yMin, xMax, yMax) {
      this._c = true;
      this._a = xMin;
      this._b = yMin;
      this._d = xMax;
      this._e = yMax;
    }
    get x() {
      return this._x;
    }
    get y() {
      return this._y;
    }
    set x(value) {
      this._x = this._c ? clamp(this._a, this._d, value) : value;
    }
    set y(value) {
      this._y = this._c ? clamp(this._b, this._e, value) : value;
    }
  };
  function factory$a() {
    return new Vector(...arguments);
  }
  var Updatable = class {
    constructor(properties) {
      return this.init(properties);
    }
    init(properties = {}) {
      this.position = factory$a();
      this.velocity = factory$a();
      this.acceleration = factory$a();
      this.ttl = Infinity;
      Object.assign(this, properties);
    }
    update(dt) {
      this.advance(dt);
    }
    advance(dt) {
      let acceleration = this.acceleration;
      if (dt) {
        acceleration = acceleration.scale(dt);
      }
      this.velocity = this.velocity.add(acceleration);
      let velocity = this.velocity;
      if (dt) {
        velocity = velocity.scale(dt);
      }
      this.position = this.position.add(velocity);
      this._pc();
      this.ttl--;
    }
    get dx() {
      return this.velocity.x;
    }
    get dy() {
      return this.velocity.y;
    }
    set dx(value) {
      this.velocity.x = value;
    }
    set dy(value) {
      this.velocity.y = value;
    }
    get ddx() {
      return this.acceleration.x;
    }
    get ddy() {
      return this.acceleration.y;
    }
    set ddx(value) {
      this.acceleration.x = value;
    }
    set ddy(value) {
      this.acceleration.y = value;
    }
    isAlive() {
      return this.ttl > 0;
    }
    _pc() {
    }
  };
  var GameObject = class extends Updatable {
    init({
      width = 0,
      height = 0,
      context: context2 = getContext(),
      render = this.draw,
      update = this.advance,
      children = [],
      anchor = { x: 0, y: 0 },
      opacity = 1,
      rotation = 0,
      scaleX = 1,
      scaleY = 1,
      ...props
    } = {}) {
      this._c = [];
      super.init({
        width,
        height,
        context: context2,
        anchor,
        opacity,
        rotation,
        scaleX,
        scaleY,
        ...props
      });
      this._di = true;
      this._uw();
      this.addChild(children);
      this._rf = render;
      this._uf = update;
    }
    update(dt) {
      this._uf(dt);
      this.children.map((child) => child.update && child.update(dt));
    }
    render() {
      let context2 = this.context;
      context2.save();
      if (this.x || this.y) {
        context2.translate(this.x, this.y);
      }
      if (this.rotation) {
        context2.rotate(this.rotation);
      }
      if (this.scaleX != 1 || this.scaleY != 1) {
        context2.scale(this.scaleX, this.scaleY);
      }
      let anchorX = -this.width * this.anchor.x;
      let anchorY = -this.height * this.anchor.y;
      if (anchorX || anchorY) {
        context2.translate(anchorX, anchorY);
      }
      this.context.globalAlpha = this.opacity;
      this._rf();
      if (anchorX || anchorY) {
        context2.translate(-anchorX, -anchorY);
      }
      let children = this.children;
      children.map((child) => child.render && child.render());
      context2.restore();
    }
    draw() {
    }
    _pc() {
      this._uw();
      this.children.map((child) => child._pc());
    }
    get x() {
      return this.position.x;
    }
    get y() {
      return this.position.y;
    }
    set x(value) {
      this.position.x = value;
      this._pc();
    }
    set y(value) {
      this.position.y = value;
      this._pc();
    }
    get width() {
      return this._w;
    }
    set width(value) {
      this._w = value;
      this._pc();
    }
    get height() {
      return this._h;
    }
    set height(value) {
      this._h = value;
      this._pc();
    }
    _uw() {
      if (!this._di)
        return;
      let {
        _wx = 0,
        _wy = 0,
        _wo = 1,
        _wr = 0,
        _wsx = 1,
        _wsy = 1
      } = this.parent || {};
      this._wx = this.x;
      this._wy = this.y;
      this._ww = this.width;
      this._wh = this.height;
      this._wo = _wo * this.opacity;
      this._wsx = _wsx * this.scaleX;
      this._wsy = _wsy * this.scaleY;
      this._wx = this._wx * _wsx;
      this._wy = this._wy * _wsy;
      this._ww = this.width * this._wsx;
      this._wh = this.height * this._wsy;
      this._wr = _wr + this.rotation;
      let { x, y } = rotatePoint({ x: this._wx, y: this._wy }, _wr);
      this._wx = x;
      this._wy = y;
      this._wx += _wx;
      this._wy += _wy;
    }
    get world() {
      return {
        x: this._wx,
        y: this._wy,
        width: this._ww,
        height: this._wh,
        opacity: this._wo,
        rotation: this._wr,
        scaleX: this._wsx,
        scaleY: this._wsy
      };
    }
    set children(value) {
      this.removeChild(this._c);
      this.addChild(value);
    }
    get children() {
      return this._c;
    }
    addChild(...objects) {
      objects.flat().map((child) => {
        this.children.push(child);
        child.parent = this;
        child._pc = child._pc || noop;
        child._pc();
      });
    }
    removeChild(...objects) {
      objects.flat().map((child) => {
        if (removeFromArray(this.children, child)) {
          child.parent = null;
          child._pc();
        }
      });
    }
    get opacity() {
      return this._opa;
    }
    set opacity(value) {
      this._opa = value;
      this._pc();
    }
    get rotation() {
      return this._rot;
    }
    set rotation(value) {
      this._rot = value;
      this._pc();
    }
    setScale(x, y = x) {
      this.scaleX = x;
      this.scaleY = y;
    }
    get scaleX() {
      return this._scx;
    }
    set scaleX(value) {
      this._scx = value;
      this._pc();
    }
    get scaleY() {
      return this._scy;
    }
    set scaleY(value) {
      this._scy = value;
      this._pc();
    }
  };
  var Sprite = class extends GameObject {
    init({
      image,
      width = image ? image.width : void 0,
      height = image ? image.height : void 0,
      ...props
    } = {}) {
      super.init({
        image,
        width,
        height,
        ...props
      });
    }
    get animations() {
      return this._a;
    }
    set animations(value) {
      let prop, firstAnimation;
      this._a = {};
      for (prop in value) {
        this._a[prop] = value[prop].clone();
        firstAnimation = firstAnimation || this._a[prop];
      }
      this.currentAnimation = firstAnimation;
      this.width = this.width || firstAnimation.width;
      this.height = this.height || firstAnimation.height;
    }
    playAnimation(name) {
      this.currentAnimation = this.animations[name];
      if (!this.currentAnimation.loop) {
        this.currentAnimation.reset();
      }
    }
    advance(dt) {
      super.advance(dt);
      if (this.currentAnimation) {
        this.currentAnimation.update(dt);
      }
    }
    draw() {
      if (this.image) {
        this.context.drawImage(this.image, 0, 0, this.image.width, this.image.height);
      }
      if (this.currentAnimation) {
        this.currentAnimation.render({
          x: 0,
          y: 0,
          width: this.width,
          height: this.height,
          context: this.context
        });
      }
      if (this.color) {
        this.context.fillStyle = this.color;
        this.context.fillRect(0, 0, this.width, this.height);
      }
    }
  };
  function factory$8() {
    return new Sprite(...arguments);
  }
  function clear(context2) {
    let canvas2 = context2.canvas;
    context2.clearRect(0, 0, canvas2.width, canvas2.height);
  }
  function GameLoop({
    fps = 60,
    clearCanvas = true,
    update = noop,
    render,
    context: context2 = getContext(),
    blur = false
  } = {}) {
    if (!render) {
      throw Error("You must provide a render() function");
    }
    let accumulator = 0;
    let delta = 1e3 / fps;
    let step = 1 / fps;
    let clearFn = clearCanvas ? clear : noop;
    let last, rAF, now, dt, loop2;
    let focused = true;
    if (!blur) {
      window.addEventListener("focus", () => {
        focused = true;
      });
      window.addEventListener("blur", () => {
        focused = false;
      });
    }
    function frame() {
      rAF = requestAnimationFrame(frame);
      if (!focused)
        return;
      now = performance.now();
      dt = now - last;
      last = now;
      if (dt > 1e3) {
        return;
      }
      emit("tick");
      accumulator += dt;
      while (accumulator >= delta) {
        loop2.update(step);
        accumulator -= delta;
      }
      clearFn(context2);
      loop2.render();
    }
    loop2 = {
      update,
      render,
      isStopped: true,
      start() {
        last = performance.now();
        this.isStopped = false;
        requestAnimationFrame(frame);
      },
      stop() {
        this.isStopped = true;
        cancelAnimationFrame(rAF);
      },
      _frame: frame,
      set _last(value) {
        last = value;
      }
    };
    return loop2;
  }

  // src/js/main.js
  var { canvas } = init$1();
  var sprite = factory$8({
    x: 100,
    y: 100,
    dx: 2,
    width: 20,
    height: 40,
    color: "red"
  });
  var loop = GameLoop({
    update() {
      sprite.update();
    },
    render() {
      sprite.render();
    }
  });
  loop.start();
})();
