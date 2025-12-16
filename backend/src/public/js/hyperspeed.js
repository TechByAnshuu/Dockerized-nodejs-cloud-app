import * as THREE from 'https://cdn.skypack.dev/three@0.136.0';
import { EffectComposer } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/postprocessing/UnrealBloomPass.js';

class Hyperspeed {
    constructor(options) {
        this.options = options;
        this.container = document.getElementById('hyperspeed-container');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'hyperspeed-container';
            this.container.style.position = 'fixed';
            this.container.style.top = '0';
            this.container.style.left = '0';
            this.container.style.width = '100%';
            this.container.style.height = '100%';
            this.container.style.zIndex = '-1';
            document.body.prepend(this.container);
        }

        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(this.options.colors.background, 0.002);

        this.camera = new THREE.PerspectiveCamera(this.options.fov, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 0;
        this.camera.position.y = 2;

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);

        // Post Processing
        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(new RenderPass(this.scene, this.camera));

        const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
        bloomPass.threshold = 0;
        bloomPass.strength = 1.2; // Neon glow strength
        bloomPass.radius = 0;
        this.composer.addPass(bloomPass);

        this.initRoad();
        this.initLights();
        this.animate();

        window.addEventListener('resize', this.onWindowResize.bind(this));
    }

    initRoad() {
        const geometry = new THREE.PlaneGeometry(20, 400, 20, 400);
        const material = new THREE.MeshStandardMaterial({
            color: this.options.colors.roadColor,
            roughness: 0.8,
            metalness: 0.2,
            wireframe: false
        });

        this.road = new THREE.Mesh(geometry, material);
        this.road.rotation.x = -Math.PI / 2;
        this.road.position.z = -200;
        this.scene.add(this.road);

        // Grid lines (retro effect)
        const gridHelper = new THREE.GridHelper(400, 40, this.options.colors.brokenLines, this.options.colors.brokenLines);
        gridHelper.position.z = -200;
        gridHelper.position.y = 0.01;
        this.scene.add(gridHelper);
    }

    initLights() {
        // Moving lights (represented as long boxes)
        this.lights = [];
        const lightColors = [...this.options.colors.leftCars, ...this.options.colors.rightCars];

        for (let i = 0; i < 40; i++) {
            const color = lightColors[Math.floor(Math.random() * lightColors.length)];
            const geometry = new THREE.BoxGeometry(0.2, 0.2, Math.random() * 10 + 5);
            const material = new THREE.MeshBasicMaterial({ color: color });
            const mesh = new THREE.Mesh(geometry, material);

            mesh.position.x = (Math.random() - 0.5) * 20;
            mesh.position.y = Math.random() * 2 + 0.5;
            mesh.position.z = -Math.random() * 400;

            this.scene.add(mesh);
            this.lights.push({ mesh, speed: Math.random() * 2 + 1 });
        }
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        // Move lights
        this.lights.forEach(light => {
            light.mesh.position.z += light.speed;
            if (light.mesh.position.z > 10) {
                light.mesh.position.z = -400;
                light.mesh.position.x = (Math.random() - 0.5) * 20;
            }
        });

        // Move grid/road texture effect (simulated)
        // In a full implementation, we'd offset texture UVs here.

        this.composer.render();
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.composer.setSize(window.innerWidth, window.innerHeight);
    }
}

// Default options based on user request "one" preset
const defaultOptions = {
    colors: {
        roadColor: 0x080808,
        islandColor: 0x0a0a0a,
        background: 0x000000,
        shoulderLines: 0x131318,
        brokenLines: 0x131318,
        leftCars: [0xd856bf, 0x6750a2, 0xc247ac],
        rightCars: [0x03b3c3, 0x0e5ea5, 0x324555],
        sticks: 0x03b3c3
    },
    fov: 90
};

// Initialize
new Hyperspeed(defaultOptions);
