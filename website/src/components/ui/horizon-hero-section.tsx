import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

gsap.registerPlugin(ScrollTrigger);

interface ThreeRefs {
  scene: THREE.Scene | null;
  camera: THREE.PerspectiveCamera | null;
  renderer: THREE.WebGLRenderer | null;
  composer: EffectComposer | null;
  stars: THREE.Points[];
  nebula: THREE.Mesh | null;
  mountains: THREE.Mesh[];
  animationId: number | null;
  targetCameraX: number;
  targetCameraY: number;
  targetCameraZ: number;
  locations: number[];
}

const SECTIONS = [
  {
    title: 'BREATHE',
    line1: 'Clean air intelligence',
    line2: 'Monitoring Pimpri · Pune · Maharashtra',
  },
  {
    title: 'MONITOR',
    line1: 'Sensors never sleep',
    line2: 'Live readings pushed every 30 seconds',
  },
  {
    title: 'PREDICT',
    line1: 'AI on the edge',
    line2: 'XGBoost inference · No cloud required',
  },
];

export const Component = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const scrollProgressRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const smoothCameraPos = useRef({ x: 0, y: 30, z: 100 });
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const totalSections = SECTIONS.length - 1;

  const threeRefs = useRef<ThreeRefs>({
    scene: null, camera: null, renderer: null, composer: null,
    stars: [], nebula: null, mountains: [],
    animationId: null,
    targetCameraX: 0, targetCameraY: 30, targetCameraZ: 100,
    locations: [],
  });

  useEffect(() => {
    if (!canvasRef.current) return;
    const refs = threeRefs.current;

    refs.scene = new THREE.Scene();
    refs.scene.fog = new THREE.FogExp2(0x000000, 0.00025);

    refs.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    refs.camera.position.set(0, 20, 100);

    refs.renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true, alpha: true });
    refs.renderer.setSize(window.innerWidth, window.innerHeight);
    refs.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    refs.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    refs.renderer.toneMappingExposure = 0.5;

    refs.composer = new EffectComposer(refs.renderer);
    refs.composer.addPass(new RenderPass(refs.scene, refs.camera));
    refs.composer.addPass(new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight), 0.8, 0.4, 0.85
    ));

    createStarField(refs);
    createNebula(refs);
    createMountains(refs);
    createAtmosphere(refs);
    refs.locations = refs.mountains.map(m => m.position.z);

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      refs.animationId = animId;
      const time = Date.now() * 0.001;

      refs.stars.forEach(sf => {
        const mat = sf.material as THREE.ShaderMaterial;
        if (mat.uniforms) mat.uniforms.time.value = time;
      });

      if (refs.nebula && (refs.nebula.material as THREE.ShaderMaterial).uniforms) {
        (refs.nebula.material as THREE.ShaderMaterial).uniforms.time.value = time * 0.5;
      }

      if (refs.camera) {
        const k = 0.05;
        smoothCameraPos.current.x += (refs.targetCameraX - smoothCameraPos.current.x) * k;
        smoothCameraPos.current.y += (refs.targetCameraY - smoothCameraPos.current.y) * k;
        smoothCameraPos.current.z += (refs.targetCameraZ - smoothCameraPos.current.z) * k;

        refs.camera.position.x = smoothCameraPos.current.x + Math.sin(time * 0.1) * 2;
        refs.camera.position.y = smoothCameraPos.current.y + Math.cos(time * 0.15) * 1;
        refs.camera.position.z = smoothCameraPos.current.z;
        refs.camera.lookAt(0, 10, -600);
      }

      refs.mountains.forEach((m, i) => {
        const p = 1 + i * 0.5;
        m.position.x = Math.sin(time * 0.1) * 2 * p;
        m.position.y = 50 + Math.cos(time * 0.15) * p;
      });

      refs.composer?.render();
    };
    animate();
    setIsReady(true);

    const handleResize = () => {
      if (!refs.camera || !refs.renderer || !refs.composer) return;
      refs.camera.aspect = window.innerWidth / window.innerHeight;
      refs.camera.updateProjectionMatrix();
      refs.renderer.setSize(window.innerWidth, window.innerHeight);
      refs.composer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      refs.stars.forEach(s => { s.geometry.dispose(); (s.material as THREE.Material).dispose(); });
      refs.mountains.forEach(m => { m.geometry.dispose(); (m.material as THREE.Material).dispose(); });
      if (refs.nebula) { refs.nebula.geometry.dispose(); (refs.nebula.material as THREE.Material).dispose(); }
      refs.renderer?.dispose();
    };
  }, []);

  useEffect(() => {
    if (!isReady) return;
    gsap.set([menuRef.current, titleRef.current, subtitleRef.current, scrollProgressRef.current], { visibility: 'visible' });

    const tl = gsap.timeline();
    if (menuRef.current) tl.from(menuRef.current, { x: -100, opacity: 0, duration: 1, ease: 'power3.out' });
    if (titleRef.current) {
      tl.from(titleRef.current.querySelectorAll('.title-char'), { y: 200, opacity: 0, duration: 1.5, stagger: 0.05, ease: 'power4.out' }, '-=0.5');
    }
    if (subtitleRef.current) {
      tl.from(subtitleRef.current.querySelectorAll('.subtitle-line'), { y: 50, opacity: 0, duration: 1, stagger: 0.2, ease: 'power3.out' }, '-=0.8');
    }
    if (scrollProgressRef.current) tl.from(scrollProgressRef.current, { opacity: 0, y: 50, duration: 1, ease: 'power2.out' }, '-=0.5');

    return () => { tl.kill(); };
  }, [isReady]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(scrollY / maxScroll, 1);
      const secIndex = Math.min(Math.floor(progress * SECTIONS.length), SECTIONS.length - 1);

      setScrollProgress(progress);
      setCurrentSection(secIndex);

      const refs = threeRefs.current;
      const totalProgress = progress * totalSections;
      const newSection = Math.floor(totalProgress);
      const sectionProgress = totalProgress % 1;

      const positions = [
        { x: 0, y: 30, z: 300 },
        { x: 0, y: 40, z: -50 },
        { x: 0, y: 50, z: -700 },
      ];

      const cur = positions[newSection] ?? positions[0];
      const nxt = positions[newSection + 1] ?? cur;

      refs.targetCameraX = cur.x + (nxt.x - cur.x) * sectionProgress;
      refs.targetCameraY = cur.y + (nxt.y - cur.y) * sectionProgress;
      refs.targetCameraZ = cur.z + (nxt.z - cur.z) * sectionProgress;

      refs.mountains.forEach((m, i) => {
        if (progress > 0.7) {
          m.position.z = 600000;
        } else {
          m.position.z = refs.locations[i] ?? m.position.z;
        }
      });

      if (refs.nebula && refs.mountains[3]) {
        refs.nebula.position.z = refs.mountains[3].position.z;
      }

      // Fade canvas out near end of hero
      if (canvasRef.current) {
        canvasRef.current.style.opacity = String(Math.max(0, 1 - (progress - 0.85) * 6.5));
      }

      // Update visible title/subtitle
      const sec = SECTIONS[secIndex];
      if (titleRef.current) {
        titleRef.current.querySelectorAll('.title-char').forEach(el => {
          (el as HTMLElement).style.opacity = '1';
        });
        titleRef.current.innerHTML = sec.title.split('').map(c =>
          `<span class="title-char">${c === ' ' ? '&nbsp;' : c}</span>`
        ).join('');
      }
      if (subtitleRef.current) {
        const lines = subtitleRef.current.querySelectorAll('.subtitle-line');
        if (lines[0]) lines[0].textContent = sec.line1;
        if (lines[1]) lines[1].textContent = sec.line2;
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [totalSections]);

  const initialSection = SECTIONS[0];

  return (
    <div ref={containerRef} className="hero-container cosmos-style">
      <canvas ref={canvasRef} className="hero-canvas" />

      <div ref={menuRef} className="side-menu" style={{ visibility: 'hidden' }}>
        <div className="menu-icon">
          <span /><span /><span />
        </div>
        <div className="vertical-text">AQI</div>
      </div>

      <div className="hero-content cosmos-content">
        <h1 ref={titleRef} className="hero-title">
          {initialSection.title.split('').map((c, idx) => (
            <span key={idx} className="title-char">{c}</span>
          ))}
        </h1>
        <div ref={subtitleRef} className="hero-subtitle cosmos-subtitle">
          <p className="subtitle-line">{initialSection.line1}</p>
          <p className="subtitle-line">{initialSection.line2}</p>
        </div>
      </div>

      <div ref={scrollProgressRef} className="scroll-progress" style={{ visibility: 'hidden' }}>
        <div className="scroll-text">SCROLL</div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${scrollProgress * 100}%` }} />
        </div>
        <div className="section-counter">
          {String(currentSection + 1).padStart(2, '0')} / {String(SECTIONS.length).padStart(2, '0')}
        </div>
      </div>

      <div className="scroll-sections">
        {SECTIONS.slice(1).map((_, i) => (
          <section key={i} className="content-section" />
        ))}
      </div>
    </div>
  );
};

/* ── helpers ── */
function createStarField(refs: ThreeRefs) {
  for (let layer = 0; layer < 3; layer++) {
    const count = 5000;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const sz = new Float32Array(count);

    for (let j = 0; j < count; j++) {
      const r = 200 + Math.random() * 800;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      pos[j * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[j * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[j * 3 + 2] = r * Math.cos(phi);

      const c = new THREE.Color();
      const rnd = Math.random();
      if (rnd < 0.75) c.setHSL(0.58, 0.15, 0.80 + Math.random() * 0.18); // soft blue-white
      else if (rnd < 0.92) c.setHSL(0.55, 0.35, 0.72); // steel blue
      else c.setHSL(0.60, 0.25, 0.85); // pale sky blue
      col[j * 3] = c.r; col[j * 3 + 1] = c.g; col[j * 3 + 2] = c.b;
      sz[j] = Math.random() * 2 + 0.5;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sz, 1));

    const mat = new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 }, depth: { value: layer } },
      vertexShader: `
        attribute float size; attribute vec3 color; varying vec3 vColor;
        uniform float time; uniform float depth;
        void main() {
          vColor = color;
          vec3 p = position;
          float angle = time * 0.05 * (1.0 - depth * 0.3);
          mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
          p.xy = rot * p.xy;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = size * (300.0 / -mv.z);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        varying vec3 vColor;
        void main() {
          float d = length(gl_PointCoord - vec2(0.5));
          if (d > 0.5) discard;
          gl_FragColor = vec4(vColor, 1.0 - smoothstep(0.0, 0.5, d));
        }`,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const stars = new THREE.Points(geo, mat);
    refs.scene!.add(stars);
    refs.stars.push(stars);
  }
}

function createNebula(refs: ThreeRefs) {
  const geo = new THREE.PlaneGeometry(8000, 4000, 100, 100);
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      color1: { value: new THREE.Color(0x020a28) }, // deep midnight blue
      color2: { value: new THREE.Color(0x082840) }, // dark ocean
      opacity: { value: 0.22 },
    },
    vertexShader: `
      varying vec2 vUv; varying float vElev; uniform float time;
      void main() {
        vUv = uv;
        vec3 p = position;
        float e = sin(p.x * 0.01 + time) * cos(p.y * 0.01 + time) * 20.0;
        p.z += e; vElev = e;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }`,
    fragmentShader: `
      uniform vec3 color1; uniform vec3 color2; uniform float opacity; uniform float time;
      varying vec2 vUv; varying float vElev;
      void main() {
        float m = sin(vUv.x * 10.0 + time) * cos(vUv.y * 10.0 + time);
        vec3 col = mix(color1, color2, m * 0.5 + 0.5);
        float a = opacity * (1.0 - length(vUv - 0.5) * 2.0);
        a *= 1.0 + vElev * 0.01;
        gl_FragColor = vec4(col, a);
      }`,
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  const nebula = new THREE.Mesh(geo, mat);
  nebula.position.z = -1050;
  refs.scene!.add(nebula);
  refs.nebula = nebula;
}

function createMountains(refs: ThreeRefs) {
  const layers = [
    { distance: -50,  height: 60,  color: 0x060d1e, opacity: 1   },
    { distance: -100, height: 80,  color: 0x071428, opacity: 0.85 },
    { distance: -150, height: 100, color: 0x091b35, opacity: 0.65 },
    { distance: -200, height: 120, color: 0x0b2240, opacity: 0.45 },
  ];

  layers.forEach((layer, index) => {
    const pts: THREE.Vector2[] = [];
    const segs = 50;
    for (let i = 0; i <= segs; i++) {
      const x = (i / segs - 0.5) * 1000;
      const y = Math.sin(i * 0.1) * layer.height
        + Math.sin(i * 0.05) * layer.height * 0.5
        + Math.random() * layer.height * 0.2 - 100;
      pts.push(new THREE.Vector2(x, y));
    }
    pts.push(new THREE.Vector2(5000, -300));
    pts.push(new THREE.Vector2(-5000, -300));

    const shape = new THREE.Shape(pts);
    const geo = new THREE.ShapeGeometry(shape);
    const mat = new THREE.MeshBasicMaterial({ color: layer.color, transparent: true, opacity: layer.opacity, side: THREE.DoubleSide });
    const m = new THREE.Mesh(geo, mat);
    m.position.z = layer.distance;
    m.position.y = layer.distance;
    m.userData = { baseZ: layer.distance, index };
    refs.scene!.add(m);
    refs.mountains.push(m);
  });
}

function createAtmosphere(refs: ThreeRefs) {
  const geo = new THREE.SphereGeometry(600, 32, 32);
  const mat = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } },
    vertexShader: `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: `
      varying vec3 vNormal; uniform float time;
      void main() {
        float i = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
        vec3 atm = vec3(0.15, 0.45, 0.80) * i;
        gl_FragColor = vec4(atm, i * 0.14);
      }`,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true,
  });
  refs.scene!.add(new THREE.Mesh(geo, mat));
}
