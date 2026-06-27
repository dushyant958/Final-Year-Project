import { useEffect, useRef, useState, type ReactNode } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

gsap.registerPlugin(ScrollTrigger);

const SECTIONS = [
  {
    title: 'GENESIS',
    line1: 'Where intelligence meets the invisible,',
    line2: 'we decode the air you breathe',
  },
  {
    title: 'NEXUS',
    line1: 'Edge nodes wired into the atmosphere,',
    line2: 'streaming reality in real time',
  },
  {
    title: 'ORACLE',
    line1: 'Machine learning on the edge,',
    line2: 'predicting what the sky won\'t tell you',
  },
];

export const Component = ({ children }: { children?: ReactNode }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollProgressRef = useRef<HTMLDivElement>(null);

  const smoothCameraPos = useRef({ x: 0, y: 30, z: 100 });

  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const totalSections = 2;

  const threeRefs = useRef<{
    scene: THREE.Scene | null;
    camera: THREE.PerspectiveCamera | null;
    renderer: THREE.WebGLRenderer | null;
    composer: EffectComposer | null;
    stars: THREE.Points[];
    nebula: THREE.Mesh | null;
    mountains: THREE.Mesh[];
    animationId: number | null;
    targetCameraX?: number;
    targetCameraY?: number;
    targetCameraZ?: number;
    locations: number[];
  }>({
    scene: null,
    camera: null,
    renderer: null,
    composer: null,
    stars: [],
    nebula: null,
    mountains: [],
    animationId: null,
    locations: [],
  });

  useEffect(() => {
    if (!canvasRef.current) return;
    const refs = threeRefs.current;

    // Scene — dark blue background
    refs.scene = new THREE.Scene();
    refs.scene.background = new THREE.Color(0x000204);

    // Camera
    refs.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    refs.camera.position.z = 100;
    refs.camera.position.y = 20;

    // Renderer
    refs.renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true, alpha: false });
    refs.renderer.setSize(window.innerWidth, window.innerHeight);
    refs.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    refs.renderer.sortObjects = true;
    refs.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    refs.renderer.toneMappingExposure = 1.5;

    // Post-processing
    refs.composer = new EffectComposer(refs.renderer);
    refs.composer.addPass(new RenderPass(refs.scene, refs.camera));
    refs.composer.addPass(
      new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.3, 0.4, 0.6)
    );

    // ── Stars — placed in the visible sky area ──
    for (let layer = 0; layer < 3; layer++) {
      const count = 1500;
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(count * 3);
      const col = new Float32Array(count * 3);
      const sz = new Float32Array(count);

      for (let j = 0; j < count; j++) {
        // Spread stars in a huge box above and around the camera path
        // Camera goes from z=300 to z=-700, y=30 to y=50
        // Stars need to be ABOVE (high y) and spread across x and z
        pos[j * 3]     = (Math.random() - 0.5) * 2000;           // x: wide spread
        pos[j * 3 + 1] = 80 + Math.random() * 600;               // y: above mountains (80 to 680)
        pos[j * 3 + 2] = 500 - Math.random() * 1800;             // z: from 500 to -1300 (covers camera path)

        const c = new THREE.Color();
        const rnd = Math.random();
        if (rnd < 0.7) c.setHSL(0, 0, 1.0);
        else if (rnd < 0.9) c.setHSL(0.6, 0.2, 1.0);
        else c.setHSL(0.08, 0.3, 1.0);
        col[j * 3] = c.r;
        col[j * 3 + 1] = c.g;
        col[j * 3 + 2] = c.b;
        sz[j] = Math.random() * 2 + 0.5;
      }

      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
      geo.setAttribute('size', new THREE.BufferAttribute(sz, 1));

      const mat = new THREE.ShaderMaterial({
        uniforms: { time: { value: 0 }, depth: { value: layer } },
        vertexShader: `
          attribute float size; attribute vec3 color; varying vec3 vColor;
          uniform float time;
          void main() {
            vColor = color;
            vec3 pos = position;
            // Gentle twinkle via slight position wobble
            pos.x += sin(time * 0.3 + pos.y * 0.1) * 0.5;
            pos.y += cos(time * 0.2 + pos.x * 0.1) * 0.3;
            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = size * (200.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }`,
        fragmentShader: `
          varying vec3 vColor;
          uniform float time;
          void main() {
            float dist = length(gl_PointCoord - vec2(0.5));
            if (dist > 0.5) discard;
            float glow = 1.0 - smoothstep(0.0, 0.5, dist);
            // Twinkle
            float twinkle = 0.7 + 0.3 * sin(time * 3.0 + gl_FragCoord.x * 0.1 + gl_FragCoord.y * 0.1);
            gl_FragColor = vec4(vColor, glow * twinkle);
          }`,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      const stars = new THREE.Points(geo, mat);
      refs.scene.add(stars);
      refs.stars.push(stars);
    }

    // ── Nebula — subtle dark blue tones, no purple ──
    {
      const geo = new THREE.PlaneGeometry(8000, 4000, 100, 100);
      const mat = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          color1: { value: new THREE.Color(0x010810) },
          color2: { value: new THREE.Color(0x020c18) },
          opacity: { value: 0.06 },
        },
        vertexShader: `
          varying vec2 vUv; varying float vElevation; uniform float time;
          void main() {
            vUv = uv; vec3 pos = position;
            float elevation = sin(pos.x * 0.01 + time) * cos(pos.y * 0.01 + time) * 20.0;
            pos.z += elevation; vElevation = elevation;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }`,
        fragmentShader: `
          uniform vec3 color1; uniform vec3 color2; uniform float opacity; uniform float time;
          varying vec2 vUv; varying float vElevation;
          void main() {
            float mixFactor = sin(vUv.x * 10.0 + time) * cos(vUv.y * 10.0 + time);
            vec3 color = mix(color1, color2, mixFactor * 0.5 + 0.5);
            float alpha = opacity * (1.0 - length(vUv - 0.5) * 2.0);
            alpha *= 1.0 + vElevation * 0.01;
            gl_FragColor = vec4(color, alpha);
          }`,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
      });

      const nebula = new THREE.Mesh(geo, mat);
      nebula.position.z = -1050;
      refs.scene.add(nebula);
      refs.nebula = nebula;
    }

    // ── Mountains — keep purple/blue tones ──
    const mountainLayers = [
      { distance: -50, height: 60, color: 0x1a1a2e, opacity: 1 },
      { distance: -100, height: 80, color: 0x16213e, opacity: 0.8 },
      { distance: -150, height: 100, color: 0x0f3460, opacity: 0.6 },
      { distance: -200, height: 120, color: 0x0a4668, opacity: 0.4 },
    ];

    mountainLayers.forEach((layer) => {
      const points: THREE.Vector2[] = [];
      const segments = 50;
      for (let i = 0; i <= segments; i++) {
        const x = (i / segments - 0.5) * 1000;
        const y =
          Math.sin(i * 0.1) * layer.height +
          Math.sin(i * 0.05) * layer.height * 0.5 +
          Math.random() * layer.height * 0.2 -
          100;
        points.push(new THREE.Vector2(x, y));
      }
      points.push(new THREE.Vector2(5000, -300));
      points.push(new THREE.Vector2(-5000, -300));

      const shape = new THREE.Shape(points);
      const geo = new THREE.ShapeGeometry(shape);
      const mat = new THREE.MeshBasicMaterial({
        color: layer.color,
        transparent: true,
        opacity: layer.opacity,
        side: THREE.DoubleSide,
        depthWrite: true,
      });
      const m = new THREE.Mesh(geo, mat);
      m.position.z = layer.distance;
      m.position.y = layer.distance;
      m.userData = { baseZ: layer.distance };
      m.renderOrder = 10;
      refs.scene.add(m);
      refs.mountains.push(m);
    });

    // ── Giant orb — behind mountains, visible from the front ──
    {
      // Glowing core sphere
      const coreGeo = new THREE.SphereGeometry(100, 64, 64);
      const coreMat = new THREE.ShaderMaterial({
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
            float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 1.5);
            vec3 core = vec3(0.25, 0.4, 0.7);
            vec3 edge = vec3(0.1, 0.2, 0.5);
            vec3 color = mix(core, edge, fresnel);
            float pulse = 0.95 + 0.05 * sin(time * 1.5);
            gl_FragColor = vec4(color * pulse, 0.8);
          }`,
        transparent: true,
        depthWrite: false,
      });
      // All orb parts render FIRST (renderOrder = -1) so mountains draw on top
      const core = new THREE.Mesh(coreGeo, coreMat);
      core.position.set(0, 60, -500);
      core.renderOrder = -1;
      refs.scene.add(core);

      // Outer glow halo
      const glowGeo = new THREE.SphereGeometry(160, 32, 32);
      const glowMat = new THREE.ShaderMaterial({
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
            float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.5);
            vec3 col = vec3(0.15, 0.3, 0.6) * intensity;
            float pulse = 0.9 + 0.1 * sin(time * 1.5);
            gl_FragColor = vec4(col * pulse, intensity * 0.3);
          }`,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
      });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      glow.position.set(0, 60, -500);
      glow.renderOrder = -1;
      refs.scene.add(glow);

      // Vertical light beam below the orb
      const beamGeo = new THREE.PlaneGeometry(4, 600);
      const beamMat = new THREE.ShaderMaterial({
        uniforms: { time: { value: 0 } },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }`,
        fragmentShader: `
          varying vec2 vUv; uniform float time;
          void main() {
            float center = 1.0 - abs(vUv.x - 0.5) * 2.0;
            float fade = smoothstep(0.0, 0.3, vUv.y) * (1.0 - smoothstep(0.7, 1.0, vUv.y));
            float flicker = 0.85 + 0.15 * sin(time * 4.0 + vUv.y * 20.0);
            float alpha = center * fade * flicker * 0.6;
            gl_FragColor = vec4(0.7, 0.85, 1.0, alpha);
          }`,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.set(0, -210, -500);
      beam.renderOrder = -1;
      refs.scene.add(beam);
    }

    refs.locations = refs.mountains.map((m) => m.position.z);

    // ── Animate ──
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      refs.animationId = animId;
      const time = Date.now() * 0.001;

      // Rotate entire star field slowly — full 360+ over the session
      refs.stars.forEach((sf, i) => {
        const m = sf.material as THREE.ShaderMaterial;
        if (m.uniforms) m.uniforms.time.value = time;
        const speed = 0.02 + i * 0.008;
        sf.rotation.y = time * speed;
        sf.rotation.x = Math.sin(time * speed * 0.5) * 0.1;
      });

      if (refs.nebula) {
        (refs.nebula.material as THREE.ShaderMaterial).uniforms.time.value = time * 0.5;
      }

      // Update time uniform on all shader materials (orb, beam, etc.)
      refs.scene?.traverse((obj) => {
        if (obj instanceof THREE.Mesh && obj.material instanceof THREE.ShaderMaterial && obj.material.uniforms.time) {
          obj.material.uniforms.time.value = time;
        }
      });

      if (refs.camera && refs.targetCameraX !== undefined) {
        const k = 0.05;
        smoothCameraPos.current.x += (refs.targetCameraX - smoothCameraPos.current.x) * k;
        smoothCameraPos.current.y += ((refs.targetCameraY ?? 30) - smoothCameraPos.current.y) * k;
        smoothCameraPos.current.z += ((refs.targetCameraZ ?? 100) - smoothCameraPos.current.z) * k;

        refs.camera.position.x = smoothCameraPos.current.x + Math.sin(time * 0.1) * 2;
        refs.camera.position.y = smoothCameraPos.current.y + Math.cos(time * 0.15);
        refs.camera.position.z = smoothCameraPos.current.z;
        refs.camera.lookAt(0, 10, -600);
      }

      refs.mountains.forEach((mountain, i) => {
        const p = 1 + i * 0.5;
        mountain.position.x = Math.sin(time * 0.1) * 2 * p;
        mountain.position.y = 50 + Math.cos(time * 0.15) * p;
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
      refs.stars.forEach((s) => { s.geometry.dispose(); (s.material as THREE.Material).dispose(); });
      refs.mountains.forEach((m) => { m.geometry.dispose(); (m.material as THREE.Material).dispose(); });
      if (refs.nebula) { refs.nebula.geometry.dispose(); (refs.nebula.material as THREE.Material).dispose(); }
      refs.renderer?.dispose();
    };
  }, []);

  // ── GSAP entrance ──
  useEffect(() => {
    if (!isReady) return;
    gsap.set(scrollProgressRef.current, { visibility: 'visible' });

    const tl = gsap.timeline();
    const first = containerRef.current?.querySelector('.content-section');
    if (first) {
      gsap.set(first, { visibility: 'visible' });
      tl.from(first.querySelectorAll('.title-char'), { y: 200, opacity: 0, duration: 1.5, stagger: 0.05, ease: 'power4.out' });
      tl.from(first.querySelectorAll('.subtitle-line'), { y: 50, opacity: 0, duration: 1, stagger: 0.2, ease: 'power3.out' }, '-=0.8');
    }
    if (scrollProgressRef.current) {
      tl.from(scrollProgressRef.current, { opacity: 0, y: 50, duration: 1, ease: 'power2.out' }, '-=0.5');
    }
    return () => { tl.kill(); };
  }, [isReady]);

  // ── Scroll ──
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(scrollY / maxScroll, 1);

      setScrollProgress(progress);
      setCurrentSection(Math.min(Math.floor(progress * SECTIONS.length), SECTIONS.length - 1));

      const refs = threeRefs.current;
      const newSection = Math.floor(progress * totalSections);
      const totalProgress = progress * totalSections;
      const sectionProgress = totalProgress % 1;

      const cam = [
        { x: 0, y: 30, z: 300 },
        { x: 0, y: 40, z: -50 },
        { x: 0, y: 50, z: -700 },
      ];

      const cur = cam[newSection] || cam[0];
      const nxt = cam[newSection + 1] || cur;
      refs.targetCameraX = cur.x + (nxt.x - cur.x) * sectionProgress;
      refs.targetCameraY = cur.y + (nxt.y - cur.y) * sectionProgress;
      refs.targetCameraZ = cur.z + (nxt.z - cur.z) * sectionProgress;

      refs.mountains.forEach((mountain, i) => {
        const speed = 1 + i * 0.9;
        const targetZ = mountain.userData.baseZ + scrollY * speed * 0.5;
        if (refs.nebula) refs.nebula.position.z = (targetZ + progress * speed * 0.01) - 100;
        mountain.userData.targetZ = targetZ;
        if (progress > 0.7) mountain.position.z = 600000;
        if (progress < 0.7) mountain.position.z = refs.locations[i] ?? mountain.position.z;
      });
      if (refs.nebula && refs.mountains[3]) refs.nebula.position.z = refs.mountains[3].position.z;
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [totalSections]);

  return (
    <div ref={containerRef} className="hero-container">
      <canvas ref={canvasRef} className="hero-canvas" />

      <div className="scroll-sections">
        {SECTIONS.map((sec, i) => (
          <section key={i} className="content-section" style={{ visibility: i === 0 ? 'hidden' : 'visible' }}>
            <h1 className="hero-title">
              {sec.title.split('').map((c, j) => (
                <span key={j} className="title-char">{c}</span>
              ))}
            </h1>
            <div className="hero-subtitle">
              <p className="subtitle-line">{sec.line1}</p>
              <p className="subtitle-line">{sec.line2}</p>
            </div>
          </section>
        ))}
      </div>

      {/* Auth card — sticks to bottom of hero */}
      {children && (
        <div className="hero-bottom-card">
          {children}
        </div>
      )}

      <div ref={scrollProgressRef} className="scroll-progress" style={{ visibility: 'hidden', opacity: scrollProgress > 0.85 ? 0 : 1, transition: 'opacity 0.3s' }}>
        <div className="scroll-text">SCROLL</div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${scrollProgress * 100}%` }} />
        </div>
        <div className="section-counter">
          {String(currentSection + 1).padStart(2, '0')} / {String(SECTIONS.length).padStart(2, '0')}
        </div>
      </div>
    </div>
  );
};
