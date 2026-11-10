// Postprocesado en WebGL: el juego se pinta en un canvas 2D de 384×216 y aquí se compone a la resolución real de la
// pantalla. Píxeles nítidos (escalado "sharp bilinear"), resplandor suave (bloom) en dos niveles, sombras de nubes
// que cruzan el mapa y gradación de color cálida al estilo de Sea of Stars. Si no hay WebGL, el canvas 2D se ve tal cual.
(function () {
  'use strict';
  const TH = window.TH;

  const VS = 'attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.,1.);}';
  // umbral de brillo, sobre la escena reducida
  const FS_BRIGHT = `precision mediump float;varying vec2 v;uniform sampler2D s;uniform float th;
void main(){vec3 c=texture2D(s,v).rgb;float l=max(c.r,max(c.g,c.b));float k=smoothstep(th,1.,l);
vec3 w=c*k;w*=mix(vec3(1.),vec3(1.08,.96,.82),.5);gl_FragColor=vec4(w,1.);}`;
  // desenfoque gaussiano separable de 9 tomas
  const FS_BLUR = `precision mediump float;varying vec2 v;uniform sampler2D s;uniform vec2 d;
void main(){vec3 c=texture2D(s,v).rgb*.227027;
c+=(texture2D(s,v+d*1.384615).rgb+texture2D(s,v-d*1.384615).rgb)*.316216;
c+=(texture2D(s,v+d*3.230769).rgb+texture2D(s,v-d*3.230769).rgb)*.070270;
gl_FragColor=vec4(c,1.);}`;
  const FS_FINAL = `#extension GL_OES_standard_derivatives : enable
precision highp float;varying vec2 v;
uniform sampler2D s,b1,b2;uniform vec2 res;uniform float t,cloud,bloom,grade,night;uniform vec2 cam;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float a=.5,r=0.;for(int i=0;i<4;i++){r+=a*n(p);p=p*2.03+vec2(17.3,9.1);a*=.5;}return r;}
vec3 sat(vec3 c,float k){float l=dot(c,vec3(.299,.587,.114));return mix(vec3(l),c,k);}
void main(){
  // muestreo nítido: bordes de píxel suavizados solo en el ancho de un píxel de pantalla
  vec2 tx=v*res;vec2 sm=floor(tx+.5);vec2 dd=max(fwidth(tx),vec2(1e-4));
  tx=sm+clamp((tx-sm)/dd,-.5,.5);vec2 uv=tx/res;
  vec3 c=texture2D(s,uv).rgb;
  vec2 sp=vec2(v.x,1.-v.y)*res;
  // sombras de nubes en coordenadas del mundo
  if(cloud>.001){
    vec2 w=(sp+cam)/150.+vec2(t*.018,t*.007);
    float m=fbm(w);m=smoothstep(.48,.66,m);
    vec3 sh=mix(vec3(1.),vec3(.70,.74,.92),m*cloud);
    c*=sh;
    // bordes de luz donde la nube se abre
    float e=smoothstep(.38,.48,fbm(w))*(1.-m);c+=c*e*.06*cloud;
  }
  // gradación: sombras frías y violetas, luces cálidas, contraste suave
  vec3 g=c;
  float l=dot(g,vec3(.299,.587,.114));
  vec3 shadowTint=vec3(.30,.27,.56),lightTint=vec3(1.07,.99,.86);
  g=mix(g*mix(vec3(1.),shadowTint*2.,.36),g,smoothstep(.0,.6,l));
  g=mix(g,g*lightTint,smoothstep(.45,1.,l));
  g=sat(g,1.12-.12*night);
  g=g*g*(3.-2.*g)*.35+g*.65;
  g=mix(g,g+vec3(.018,.012,.04),1.-smoothstep(0.,.25,l));
  c=mix(c,g,grade);
  // resplandor
  vec3 bl=texture2D(b1,v).rgb*.55+texture2D(b2,v).rgb*.9;
  c=1.-(1.-c)*(1.-bl*bloom);
  gl_FragColor=vec4(c,1.);
}`;

  function sh(gl, type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }
  function prog(gl, fs) {
    const p = gl.createProgram();
    gl.attachShader(p, sh(gl, gl.VERTEX_SHADER, VS));
    gl.attachShader(p, sh(gl, gl.FRAGMENT_SHADER, fs));
    gl.bindAttribLocation(p, 0, 'p');
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    const u = {};
    const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) { const a = gl.getActiveUniform(p, i); u[a.name] = gl.getUniformLocation(p, a.name); }
    return { p, u };
  }
  function tex(gl, w, h, linear) {
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    const f = linear ? gl.LINEAR : gl.NEAREST;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, f);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, f);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    if (w) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    return t;
  }
  function target(gl, w, h) {
    const t = tex(gl, w, h, true), f = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, f);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
    return { t, f, w, h };
  }

  TH.postfx = {
    on: false,
    // valores que la escena del mapa actualiza cada fotograma
    cloud: 0, cam: [0, 0], night: 0, bloom: 1, grade: 1,
    _cloudSet: false,
    // devuelve true si se ha montado; el renderer usa entonces un canvas 2D aparte
    init(canvas) {
      let gl = null;
      try { gl = canvas.getContext('webgl', { alpha: false, antialias: false, premultipliedAlpha: false, preserveDrawingBuffer: false }); } catch (e) { gl = null; }
      if (!gl || !gl.getExtension('OES_standard_derivatives')) return false;
      try {
        this.gl = gl;
        this.P = { bright: prog(gl, FS_BRIGHT), blur: prog(gl, FS_BLUR), final: prog(gl, FS_FINAL) };
        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        this.scene = tex(gl, 0, 0, true);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        const W = TH.W, H = TH.H;
        this.A = [target(gl, W / 4, H / 4), target(gl, W / 4, H / 4)];
        this.B = [target(gl, W / 12, H / 12), target(gl, W / 12, H / 12)];
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); this.on = false; });
        this.canvas = canvas;
        this.on = true;
        return true;
      } catch (e) {
        console.warn('postfx desactivado:', e);
        return false;
      }
    },
    // tamaño real del canvas de salida (CSS × densidad de píxeles, con tope)
    resize(cssW, cssH) {
      if (!this.on) return;
      const dpr = this.lite ? 1 : Math.min(window.devicePixelRatio || 1, 2);
      let w = Math.round(cssW * dpr), h = Math.round(cssH * dpr);
      const k = Math.min(1, (this.lite ? 1152 : 2400) / w);
      w = Math.max(TH.W, Math.round(w * k)); h = Math.max(TH.H, Math.round(h * k));
      if (this.canvas.width !== w || this.canvas.height !== h) { this.canvas.width = w; this.canvas.height = h; }
    },
    setCloud(amount, cx, cy) { this.cloud = amount; this.cam[0] = cx; this.cam[1] = cy; this._cloudSet = true; },
    pass(P, tgt, src, set) {
      const gl = this.gl;
      gl.bindFramebuffer(gl.FRAMEBUFFER, tgt ? tgt.f : null);
      gl.viewport(0, 0, tgt ? tgt.w : this.canvas.width, tgt ? tgt.h : this.canvas.height);
      gl.useProgram(P.p);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, src);
      if (P.u.s) gl.uniform1i(P.u.s, 0);
      if (set) set(P.u);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },
    blur(T) {
      const gl = this.gl, P = this.P.blur;
      this.pass(P, T[1], T[0].t, (u) => gl.uniform2f(u.d, 1 / T[0].w, 0));
      this.pass(P, T[0], T[1].t, (u) => gl.uniform2f(u.d, 0, 1 / T[0].h));
    },
    present(src) {
      if (!this.on) return;
      const gl = this.gl;
      if (!this._cloudSet) this.cloud = Math.max(0, this.cloud - 0.05);
      this._cloudSet = false;
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.scene);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
      const th = 0.72 - 0.22 * this.night;
      if (!this.lite) {
        this.pass(this.P.bright, this.A[0], this.scene, (u) => gl.uniform1f(u.th, th));
        this.blur(this.A);
        this.pass(this.P.blur, this.B[0], this.A[0].t, (u) => gl.uniform2f(u.d, 0, 0));
        this.blur(this.B);
        this.blur(this.B);
      }
      const F = this.P.final;
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, this.A[0].t);
      gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, this.B[0].t);
      this.pass(F, null, this.scene, (u) => {
        gl.uniform1i(u.b1, 1); gl.uniform1i(u.b2, 2);
        gl.uniform2f(u.res, TH.W, TH.H);
        gl.uniform1f(u.t, TH.time);
        gl.uniform1f(u.cloud, this.cloud);
        gl.uniform2f(u.cam, this.cam[0], this.cam[1]);
        gl.uniform1f(u.bloom, this.lite ? 0 : (0.55 + 0.45 * this.night) * this.bloom);
        gl.uniform1f(u.grade, this.grade);
        gl.uniform1f(u.night, this.night);
      });
    },
  };
})();
