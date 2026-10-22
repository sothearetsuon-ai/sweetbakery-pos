import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  Sparkles,
  X,
  RotateCw,
  ShoppingBag,
  Camera,
  Layers,
  Palette,
  Flame,
  Check,
  Plus,
  Scissors,
  Eye,
  DollarSign,
  Cake,
  Download,
  Calendar,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFx } from '../../utils/audio';
import { useBakery } from '../../context/BakeryContext';
import { Product } from '../../types';

interface ThreeCakeStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (customItem: Partial<Product> & { quantity?: number }) => void;
  onSendToCustomOrder?: (cakeData: {
    theme: string;
    flavor: string;
    size: string;
    price: number;
    inscription: string;
    notes: string;
  }) => void;
}

export const ThreeCakeStudioModal: React.FC<ThreeCakeStudioModalProps> = ({
  isOpen,
  onClose,
  onAddToCart,
  onSendToCustomOrder,
}) => {
  const { exchangeRate, addToCart } = useBakery();

  // Customization States
  const [tiers, setTiers] = useState<1 | 2 | 3>(2);
  const [shape, setShape] = useState<'ROUND' | 'SQUARE' | 'HEART'>('ROUND');
  const [flavorColor, setFlavorColor] = useState({
    name: 'Vanilla Cream (វ៉ានីឡា)',
    hex: '#FFF8E7',
    spongeHex: '#FDE68A',
    fillingHex: '#F472B6',
    price: 0,
  });
  const [dripType, setDripType] = useState<'NONE' | 'CHOCOLATE' | 'CARAMEL' | 'STRAWBERRY'>('CHOCOLATE');
  const [finishStyle, setFinishStyle] = useState<'SMOOTH' | 'RUSTIC' | 'MIRROR'>('SMOOTH');
  const [hasStrawberries, setHasStrawberries] = useState(true);
  const [hasMacarons, setHasMacarons] = useState(true);
  const [hasCandles, setHasCandles] = useState(true);
  const [hasGoldFlakes, setHasGoldFlakes] = useState(false);
  const [isSliced, setIsSliced] = useState(false);
  const [inscription, setInscription] = useState('Happy Birthday');
  const [autoRotate, setAutoRotate] = useState(true);

  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cakeGroupRef = useRef<THREE.Group | null>(null);
  const candlesGroupRef = useRef<THREE.Group | null>(null);
  const flameLightsRef = useRef<THREE.PointLight[]>([]);
  const animFrameIdRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const prevMousePosRef = useRef({ x: 0, y: 0 });

  // Flavor Color Palettes
  const FLAVORS = [
    { name: 'Vanilla Cream (វ៉ានីឡា)', hex: '#FFF8E7', spongeHex: '#FDE68A', fillingHex: '#F472B6', price: 0 },
    { name: 'Dark Chocolate (សូកូឡាខ្មៅ)', hex: '#3B1F0B', spongeHex: '#451A03', fillingHex: '#78350F', price: 2 },
    { name: 'Strawberry Rose (ស្ត្រប៊ែរីផ្កាកុលាប)', hex: '#FDA4AF', spongeHex: '#FECDD3', fillingHex: '#E11D48', price: 2.5 },
    { name: 'Matcha Green Tea (តែបៃតង)', hex: '#84CC16', spongeHex: '#A3E635', fillingHex: '#4D7C0F', price: 3 },
    { name: 'Taro Coconut Cream (ត្រាវដូងក្រអូប)', hex: '#C084FC', spongeHex: '#DDD6FE', fillingHex: '#7E22CE', price: 2.5 },
    { name: 'Red Velvet Royale (រ៉េតវ៉េលវ៉េត)', hex: '#991B1B', spongeHex: '#DC2626', fillingHex: '#FFFFFF', price: 3 },
  ];

  // Calculated Price
  const basePrice = tiers === 1 ? 18 : tiers === 2 ? 32 : 55;
  const toppingsPrice =
    (hasStrawberries ? 2.5 : 0) +
    (hasMacarons ? 3 : 0) +
    (hasCandles ? 1.5 : 0) +
    (hasGoldFlakes ? 4 : 0) +
    (dripType !== 'NONE' ? 2 : 0) +
    flavorColor.price;
  const totalPriceUsd = basePrice + toppingsPrice;
  const totalPriceKhr = Math.round((totalPriceUsd * (exchangeRate || 4100)) / 100) * 100;

  // Initialize Three.js scene
  useEffect(() => {
    if (!isOpen || !mountRef.current) return;

    const width = mountRef.current.clientWidth || 500;
    const height = mountRef.current.clientHeight || 450;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xF8FAFC);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 5.5, 9);
    camera.lookAt(0, 1.2, 0);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    mountRef.current.replaceChildren(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.85);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xFFF7ED, 1.6);
    mainLight.position.set(5, 10, 6);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 25;
    mainLight.shadow.bias = -0.0005;
    scene.add(mainLight);

    const rimLight = new THREE.DirectionalLight(0xE0F2FE, 0.9);
    rimLight.position.set(-6, 7, -5);
    scene.add(rimLight);

    const softFillLight = new THREE.PointLight(0xFDF2F8, 0.6, 12);
    softFillLight.position.set(0, 2, 4);
    scene.add(softFillLight);

    // 5. Luxurious Cake Stand Pedestal
    const standGroup = new THREE.Group();
    const plateGeo = new THREE.CylinderGeometry(2.6, 2.5, 0.18, 48);
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xE2B857,
      metalness: 0.85,
      roughness: 0.22,
    });
    const plate = new THREE.Mesh(plateGeo, goldMat);
    plate.position.y = -0.09;
    plate.receiveShadow = true;
    plate.castShadow = true;
    standGroup.add(plate);

    const baseGeo = new THREE.CylinderGeometry(1.2, 1.8, 0.4, 32);
    const standBase = new THREE.Mesh(baseGeo, goldMat);
    standBase.position.y = -0.38;
    standBase.castShadow = true;
    standBase.receiveShadow = true;
    standGroup.add(standBase);

    // Reflective Table Surface
    const tableGeo = new THREE.CircleGeometry(6, 48);
    const tableMat = new THREE.MeshStandardMaterial({
      color: 0xF1F5F9,
      roughness: 0.6,
      metalness: 0.1,
    });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.rotation.x = -Math.PI / 2;
    table.position.y = -0.58;
    table.receiveShadow = true;
    scene.add(table);
    scene.add(standGroup);

    // 6. Interactive Cake Root Group
    const cakeGroup = new THREE.Group();
    scene.add(cakeGroup);
    cakeGroupRef.current = cakeGroup;

    // Animation Loop
    let lastTime = performance.now();
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      const now = performance.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      if (autoRotate && cakeGroupRef.current && !isDraggingRef.current) {
        cakeGroupRef.current.rotation.y += 0.45 * delta;
      }

      // Flame flicker animation
      flameLightsRef.current.forEach((light) => {
        light.intensity = 0.8 + Math.sin(now * 0.015 + light.id * 10) * 0.25;
      });

      renderer.render(scene, camera);
    };
    animate();

    // Mouse / Touch Interaction for 360 rotation
    const dom = renderer.domElement;
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !cakeGroupRef.current) return;
      const dx = e.clientX - prevMousePosRef.current.x;
      const dy = e.clientY - prevMousePosRef.current.y;
      cakeGroupRef.current.rotation.y += dx * 0.009;
      prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    };
    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        prevMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || !cakeGroupRef.current || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - prevMousePosRef.current.x;
      cakeGroupRef.current.rotation.y += dx * 0.009;
      prevMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const onTouchEnd = () => {
      isDraggingRef.current = false;
    };

    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    const onResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, [isOpen]);

  // Rebuild 3D Cake Mesh whenever styling or tiers change
  useEffect(() => {
    if (!cakeGroupRef.current || !sceneRef.current) return;
    const cakeGroup = cakeGroupRef.current;

    // Clear old children
    while (cakeGroup.children.length > 0) {
      const obj = cakeGroup.children[0];
      cakeGroup.remove(obj);
      if ((obj as any).geometry) (obj as any).geometry.dispose();
      if ((obj as any).material) {
        if (Array.isArray((obj as any).material)) {
          (obj as any).material.forEach((m: any) => m.dispose());
        } else {
          (obj as any).material.dispose();
        }
      }
    }
    flameLightsRef.current = [];

    // Cake Material (Buttercream / Mirror / Rustic)
    const roughness = finishStyle === 'MIRROR' ? 0.08 : finishStyle === 'RUSTIC' ? 0.75 : 0.38;
    const metalness = finishStyle === 'MIRROR' ? 0.15 : 0.02;
    const cakeColor = new THREE.Color(flavorColor.hex);

    const frostingMat = new THREE.MeshStandardMaterial({
      color: cakeColor,
      roughness,
      metalness,
      bumpScale: finishStyle === 'RUSTIC' ? 0.05 : 0,
    });

    const spongeMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(flavorColor.spongeHex),
      roughness: 0.8,
    });

    const fillingMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(flavorColor.fillingHex),
      roughness: 0.4,
    });

    // Drip Color Material
    let dripHex = 0x3B1F0B; // Chocolate default
    if (dripType === 'CARAMEL') dripHex = 0xD97706;
    if (dripType === 'STRAWBERRY') dripHex = 0xE11D48;
    const dripMat = new THREE.MeshStandardMaterial({
      color: dripHex,
      roughness: 0.12,
      metalness: 0.1,
    });

    // Tier definitions
    const tierConfigs = [
      { radius: 2.1, height: 1.1, y: 0.55 },
      { radius: 1.5, height: 1.0, y: 1.6 },
      { radius: 0.95, height: 0.9, y: 2.55 },
    ].slice(0, tiers);

    tierConfigs.forEach((tier, idx) => {
      // Cake Cylinder / Shape
      let tierMesh: THREE.Mesh;

      if (shape === 'SQUARE') {
        const size = tier.radius * 1.6;
        const boxGeo = new THREE.BoxGeometry(size, tier.height, size);
        tierMesh = new THREE.Mesh(boxGeo, frostingMat);
      } else {
        // Round standard
        const thetaLength = isSliced ? Math.PI * 1.65 : Math.PI * 2;
        const cylGeo = new THREE.CylinderGeometry(
          tier.radius,
          tier.radius,
          tier.height,
          48,
          1,
          false,
          0,
          thetaLength
        );
        tierMesh = new THREE.Mesh(cylGeo, frostingMat);
      }

      tierMesh.position.y = tier.y;
      tierMesh.castShadow = true;
      tierMesh.receiveShadow = true;
      cakeGroup.add(tierMesh);

      // Cream Border Beads (Bottom rim piping)
      const beadCount = Math.floor(tier.radius * 22);
      const beadRadius = 0.07;
      const beadGeo = new THREE.SphereGeometry(beadRadius, 12, 12);
      for (let b = 0; b < beadCount; b++) {
        if (isSliced && b > beadCount * 0.82) continue;
        const angle = (b / beadCount) * Math.PI * 2;
        const bx = Math.cos(angle) * (tier.radius + 0.02);
        const bz = Math.sin(angle) * (tier.radius + 0.02);
        const bead = new THREE.Mesh(beadGeo, frostingMat);
        bead.position.set(bx, tier.y - tier.height / 2 + beadRadius, bz);
        bead.castShadow = true;
        cakeGroup.add(bead);
      }

      // Drip Glaze Effect on top rim
      if (dripType !== 'NONE') {
        const dripPoints = Math.floor(tier.radius * 16);
        for (let d = 0; d < dripPoints; d++) {
          if (isSliced && d > dripPoints * 0.82) continue;
          const angle = (d / dripPoints) * Math.PI * 2;
          const dropLen = 0.15 + (Math.sin(d * 3.5 + idx) * 0.5 + 0.5) * 0.35;
          const dropGeo = new THREE.CylinderGeometry(0.04, 0.02, dropLen, 8);
          const drop = new THREE.Mesh(dropGeo, dripMat);
          const dx = Math.cos(angle) * (tier.radius + 0.03);
          const dz = Math.sin(angle) * (tier.radius + 0.03);
          drop.position.set(dx, tier.y + tier.height / 2 - dropLen / 2, dz);
          cakeGroup.add(drop);
        }
      }
    });

    // Top tier height and radius for decorations
    const topTier = tierConfigs[tierConfigs.length - 1];
    const topY = topTier.y + topTier.height / 2;

    // 1. Strawberries
    if (hasStrawberries) {
      const berryCount = Math.max(4, Math.floor(topTier.radius * 5));
      const strawberryMat = new THREE.MeshStandardMaterial({
        color: 0xDC2626,
        roughness: 0.3,
      });
      const leafMat = new THREE.MeshStandardMaterial({
        color: 0x16A34A,
        roughness: 0.5,
      });

      for (let i = 0; i < berryCount; i++) {
        const angle = (i / berryCount) * Math.PI * 2;
        const r = topTier.radius * 0.62;
        const berryGroup = new THREE.Group();

        // Strawberry cone shape
        const berryGeo = new THREE.ConeGeometry(0.14, 0.28, 12);
        const berry = new THREE.Mesh(berryGeo, strawberryMat);
        berry.rotation.x = Math.PI;
        berry.castShadow = true;
        berryGroup.add(berry);

        // Leaves
        const leafGeo = new THREE.ConeGeometry(0.12, 0.04, 5);
        const leaf = new THREE.Mesh(leafGeo, leafMat);
        leaf.position.y = 0.14;
        berryGroup.add(leaf);

        berryGroup.position.set(Math.cos(angle) * r, topY + 0.14, Math.sin(angle) * r);
        berryGroup.rotation.y = angle;
        berryGroup.rotation.z = 0.15;
        cakeGroup.add(berryGroup);
      }
    }

    // 2. French Macarons
    if (hasMacarons) {
      const macaronCount = Math.max(3, Math.floor(topTier.radius * 4));
      const macaronColors = [0xF472B6, 0x60A5FA, 0x34D399, 0xFBBF24];

      for (let i = 0; i < macaronCount; i++) {
        const angle = (i / macaronCount) * Math.PI * 2 + 0.4;
        const r = topTier.radius * 0.35;
        const macGroup = new THREE.Group();
        const mMat = new THREE.MeshStandardMaterial({
          color: macaronColors[i % macaronColors.length],
          roughness: 0.4,
        });

        // Top Shell
        const shell1 = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.06, 16), mMat);
        shell1.position.y = 0.05;
        // Cream layer
        const cream = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.04, 16), frostingMat);
        // Bottom Shell
        const shell2 = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.06, 16), mMat);
        shell2.position.y = -0.05;

        macGroup.add(shell1, cream, shell2);
        macGroup.position.set(Math.cos(angle) * r, topY + 0.1, Math.sin(angle) * r);
        macGroup.rotation.z = 0.25;
        macGroup.castShadow = true;
        cakeGroup.add(macGroup);
      }
    }

    // 3. Birthday Candles with Glowing Flames
    if (hasCandles) {
      const candleMat = new THREE.MeshStandardMaterial({
        color: 0xFEF08A,
        roughness: 0.3,
      });
      const flameMat = new THREE.MeshBasicMaterial({
        color: 0xF97316,
      });

      const candleCount = 3;
      for (let c = 0; c < candleCount; c++) {
        const angle = (c / candleCount) * Math.PI * 2;
        const cr = topTier.radius * 0.2;
        const candleGroup = new THREE.Group();

        // Candle Wax Stick
        const waxGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.55, 12);
        const wax = new THREE.Mesh(waxGeo, candleMat);
        wax.position.y = 0.275;
        wax.castShadow = true;
        candleGroup.add(wax);

        // Candle Flame
        const flameGeo = new THREE.ConeGeometry(0.04, 0.12, 8);
        const flame = new THREE.Mesh(flameGeo, flameMat);
        flame.position.y = 0.62;
        candleGroup.add(flame);

        // Point light for realistic flame glow
        const flameLight = new THREE.PointLight(0xF59E0B, 0.9, 2.5);
        flameLight.position.set(0, 0.65, 0);
        candleGroup.add(flameLight);
        flameLightsRef.current.push(flameLight);

        candleGroup.position.set(Math.cos(angle) * cr, topY, Math.sin(angle) * cr);
        cakeGroup.add(candleGroup);
      }
    }

    // 4. Edible Gold Flakes
    if (hasGoldFlakes) {
      const goldMat = new THREE.MeshStandardMaterial({
        color: 0xF59E0B,
        metalness: 0.9,
        roughness: 0.15,
      });
      for (let g = 0; g < 35; g++) {
        const flakeGeo = new THREE.BoxGeometry(0.04, 0.04, 0.005);
        const flake = new THREE.Mesh(flakeGeo, goldMat);
        const fr = Math.random() * (topTier.radius * 0.85);
        const fa = Math.random() * Math.PI * 2;
        flake.position.set(Math.cos(fa) * fr, topY + 0.01, Math.sin(fa) * fr);
        flake.rotation.y = Math.random() * Math.PI;
        flake.rotation.z = Math.random() * 0.2;
        cakeGroup.add(flake);
      }
    }

    // 5. Center Chocolate Plaque with Inscription
    if (inscription.trim()) {
      const plaqueGroup = new THREE.Group();
      const plaqueGeo = new THREE.BoxGeometry(0.95, 0.03, 0.5);
      const plaqueMat = new THREE.MeshStandardMaterial({
        color: 0x3E2723,
        roughness: 0.35,
      });
      const plaque = new THREE.Mesh(plaqueGeo, plaqueMat);
      plaqueGroup.add(plaque);

      plaqueGroup.position.set(0, topY + 0.02, 0);
      plaqueGroup.rotation.y = 0.2;
      cakeGroup.add(plaqueGroup);
    }
  }, [tiers, shape, flavorColor, dripType, finishStyle, hasStrawberries, hasMacarons, hasCandles, hasGoldFlakes, isSliced, inscription]);

  if (!isOpen) return null;

  const handleAddToCart = () => {
    soundFx.playSuccess();
    confetti({ particleCount: 70, spread: 65, origin: { y: 0.6 } });

    const customProduct: Partial<Product> = {
      id: `custom-cake-3d-${Date.now()}`,
      nameKh: `នំខេក 3D Custom (${tiers} ជាន់ • ${flavorColor.name})`,
      nameEn: `3D Custom Cake (${tiers}-Tier • ${flavorColor.name})`,
      barcode: `CAKE-3D-${tiers}T`,
      priceUsd: totalPriceUsd,
      priceKhr: totalPriceKhr,
      costPriceUsd: Math.round(totalPriceUsd * 0.35 * 100) / 100,
      costPriceKhr: Math.round(totalPriceKhr * 0.35),
      categoryId: 'cat-cakes',
      stockQty: 99,
      unit: 'នំ',
      imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&auto=format&fit=crop&q=80',
      description: `នំខួបកំណើត 3D៖ ${tiers} ជាន់, រសជាតិ ${flavorColor.name}, Drip: ${dripType}, អក្សរ: "${inscription}". គ្រឿងតែង: ${hasStrawberries ? 'ស្ត្រប៊ែរី ' : ''}${hasMacarons ? 'Macarons ' : ''}${hasCandles ? 'ទៀន ' : ''}${hasGoldFlakes ? 'មាស24k ' : ''}`,
    };

    if (onAddToCart) {
      onAddToCart(customProduct);
    } else {
      addToCart(customProduct as Product);
    }
    onClose();
  };

  const handleCaptureSnapshot = () => {
    if (!rendererRef.current) return;
    soundFx.playPop();
    const dataUrl = rendererRef.current.domElement.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `SweetBakery-Cake3D-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-[120] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-5xl w-full shadow-2xl border border-pink-100 overflow-hidden flex flex-col my-auto max-h-[95vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-pink-600 via-rose-600 to-amber-500 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center shadow-inner">
              <Cake className="w-5 h-5 text-white animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm sm:text-base leading-tight font-battambang">
                  ស្ទូឌីយោរចនានំ 3D អន្តរកម្ម (3D Cake Customizer Studio)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-300 text-amber-950 uppercase tracking-wider">
                  WebGL 3D Real-time
                </span>
              </div>
              <p className="text-[11px] text-pink-100 font-medium">
                បង្វិល ៣៦០° រើសជាន់ ក្រែម រសជាតិ គ្រឿងតែង និងគណនាតម្លៃលក់ស្វ័យប្រវត្តិ
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundFx.playPop();
              onClose();
            }}
            className="w-8 h-8 rounded-full hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden min-h-0">
          {/* Left: 3D Interactive Viewport */}
          <div className="lg:col-span-7 relative bg-gradient-to-b from-slate-100 to-slate-200 flex flex-col items-center justify-center min-h-[320px] sm:min-h-[420px] select-none">
            <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

            {/* Floating 3D Viewport Controls */}
            <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
              <button
                type="button"
                onClick={() => setAutoRotate(!autoRotate)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer ${
                  autoRotate ? 'bg-pink-600 text-white' : 'bg-white/90 text-slate-700 hover:bg-white'
                }`}
              >
                <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
                <span>{autoRotate ? 'កំពុងវិល 360°' : 'បញ្ឈប់ការវិល'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsSliced(!isSliced)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer ${
                  isSliced ? 'bg-amber-600 text-white' : 'bg-white/90 text-slate-700 hover:bg-white'
                }`}
                title="កាត់នំជាចំណិតដើម្បីមើលស្រទាប់នំខាងក្នុង"
              >
                <Scissors className="w-3.5 h-3.5" />
                <span>{isSliced ? 'បិទចំណិតនំ' : 'កាត់មើលស្នូលនំ'}</span>
              </button>
            </div>

            <div className="absolute top-3 right-3 z-10">
              <button
                type="button"
                onClick={handleCaptureSnapshot}
                className="p-2 bg-white/90 hover:bg-white text-slate-700 hover:text-pink-600 rounded-xl shadow-sm transition-all flex items-center gap-1 text-xs font-bold cursor-pointer"
                title="ថតរូបនំ 3D (Download PNG Snapshot)"
              >
                <Camera className="w-4 h-4 text-pink-600" />
                <span className="hidden sm:inline">ថតរូប Snap</span>
              </button>
            </div>

            <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
              <span className="text-[11px] bg-black/40 backdrop-blur-md text-white px-2.5 py-1 rounded-lg">
                💡 ចុចអូស Mouse / Touch ដើម្បីបង្វិលនំ ៣៦០ ដឺក្រេ
              </span>
              <span className="text-xs font-mono font-bold bg-white/90 text-rose-600 px-2.5 py-1 rounded-lg shadow-sm">
                {tiers} Tiers • {shape}
              </span>
            </div>
          </div>

          {/* Right: Customization Controls Panel */}
          <div className="lg:col-span-5 p-4 sm:p-5 overflow-y-auto space-y-4 bg-white border-l border-slate-100 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Tiers Selector */}
              <div>
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <Layers className="w-4 h-4 text-pink-600" />
                  <span>ចំនួនជាន់នំ (Cake Tiers)</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {([1, 2, 3] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        soundFx.playPop();
                        setTiers(t);
                      }}
                      className={`py-2 px-3 rounded-2xl text-xs font-black transition-all border cursor-pointer ${
                        tiers === t
                          ? 'bg-pink-600 text-white border-pink-600 shadow-md shadow-pink-500/25'
                          : 'bg-slate-50 hover:bg-pink-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {t} ជាន់ ({t === 1 ? '១ ជាន់' : t === 2 ? '២ ជាន់' : '៣ ជាន់'})
                    </button>
                  ))}
                </div>
              </div>

              {/* Flavor / Base Color Selector */}
              <div>
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <Palette className="w-4 h-4 text-pink-600" />
                  <span>រសជាតិ និងពណ៌ក្រែម (Flavor & Palette)</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {FLAVORS.map((f) => (
                    <button
                      key={f.name}
                      type="button"
                      onClick={() => {
                        soundFx.playPop();
                        setFlavorColor(f);
                      }}
                      className={`p-2 rounded-2xl text-left border transition-all flex items-center gap-2 cursor-pointer ${
                        flavorColor.name === f.name
                          ? 'border-pink-600 bg-pink-50/70 shadow-xs ring-2 ring-pink-500/20'
                          : 'border-slate-200 hover:border-pink-300 bg-white'
                      }`}
                    >
                      <span
                        className="w-6 h-6 rounded-full border border-slate-300 shadow-inner shrink-0"
                        style={{ backgroundColor: f.hex }}
                      />
                      <div className="min-w-0">
                        <div className="text-[11px] font-black text-slate-800 truncate">
                          {f.name.split(' (')[0]}
                        </div>
                        <span className="text-[10px] text-pink-600 font-bold">
                          {f.price > 0 ? `+$${f.price}` : 'ស្តង់ដារ'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Drip Chocolate / Caramel */}
              <div>
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2 block">
                  🍫 ម៉ូដស្រក់ក្រែម (Drip Glaze Style)
                </label>
                <div className="grid grid-cols-4 gap-1.5 text-xs">
                  {[
                    { id: 'NONE', label: 'គ្មាន Drip' },
                    { id: 'CHOCOLATE', label: 'សូកូឡា' },
                    { id: 'CARAMEL', label: 'ការ៉ាមែល' },
                    { id: 'STRAWBERRY', label: 'ស្ត្រប៊ែរី' },
                  ].map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => {
                        soundFx.playPop();
                        setDripType(d.id as any);
                      }}
                      className={`py-1.5 px-2 rounded-xl font-bold transition-all border text-[11px] cursor-pointer ${
                        dripType === d.id
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Decorative Toppers Checklist */}
              <div>
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>គ្រឿងតុបតែងលើនំ 3D (Toppers & Props)</span>
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setHasStrawberries(!hasStrawberries)}
                    className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      hasStrawberries ? 'bg-rose-50 border-rose-300 text-rose-900 font-black' : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    <span>🍓 ផ្លែស្ត្រប៊ែរីស្រស់</span>
                    <span className="text-[10px] text-pink-600">+$2.5</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setHasMacarons(!hasMacarons)}
                    className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      hasMacarons ? 'bg-blue-50 border-blue-300 text-blue-900 font-black' : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    <span>🧁 French Macarons</span>
                    <span className="text-[10px] text-pink-600">+$3.0</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setHasCandles(!hasCandles)}
                    className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      hasCandles ? 'bg-amber-50 border-amber-300 text-amber-900 font-black' : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    <span>🕯️ ទៀនខួបកំណើត</span>
                    <span className="text-[10px] text-pink-600">+$1.5</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setHasGoldFlakes(!hasGoldFlakes)}
                    className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      hasGoldFlakes ? 'bg-yellow-50 border-yellow-400 text-yellow-900 font-black' : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    <span>✨ មាស 24k Edible Gold</span>
                    <span className="text-[10px] text-pink-600">+$4.0</span>
                  </button>
                </div>
              </div>

              {/* Inscription Text Input */}
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-800">
                  ✍️ អក្សរជូនពរឆ្លាក់លើនំ (Custom Message Plaque)
                </label>
                <input
                  type="text"
                  value={inscription}
                  onChange={(e) => setInscription(e.target.value)}
                  placeholder="ឧ. រីករាយថ្ងៃខួបកំណើត ម៉ាក់, Happy Birthday..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>

            {/* Total Price & Checkout Actions */}
            <div className="pt-3 border-t border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 font-bold block">
                    តម្លៃសរុបគិតតាមម៉ូដ 3D (Calculated Price)
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-black text-rose-600">
                      ${totalPriceUsd.toFixed(2)}
                    </span>
                    <span className="text-xs font-bold text-slate-600">
                      ~ {totalPriceKhr.toLocaleString()} ៛
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                    Custom 3D Spec
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="py-2.5 px-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white rounded-xl text-xs font-black shadow-md shadow-pink-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>+ បញ្ចូលកន្ត្រក POS</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundFx.playPop();
                    if (onSendToCustomOrder) {
                      onSendToCustomOrder({
                        theme: `3D Custom Cake (${tiers} ជាន់)`,
                        flavor: flavorColor.name,
                        size: `${tiers} Tiers`,
                        price: totalPriceUsd,
                        inscription,
                        notes: `Drip: ${dripType}, Toppers: ${hasStrawberries ? 'Strawberries ' : ''}${hasMacarons ? 'Macarons ' : ''}${hasCandles ? 'Candles ' : ''}`,
                      });
                      onClose();
                    } else {
                      handleAddToCart();
                    }
                  }}
                  className="py-2.5 px-3 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-md"
                >
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>កត់ត្រាកុម្ម៉ង់ខួបកំណើត</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
