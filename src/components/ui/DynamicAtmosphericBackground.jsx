import React, { useMemo, useState, useEffect, useRef } from 'react';

// Dense deterministic seed of 100+ ambient knowledge particles spanning the entire infinite canvas
const AMBIENT_PARTICLES = [{"id":1,"x":-3200,"y":-2200,"r":2.8,"speed":0.35,"phase":0,"op":0.8,"glow":true},{"id":2,"x":-2800,"y":-1800,"r":1.5499999999999998,"speed":0.47,"phase":0.37,"op":0.53,"glow":false},{"id":3,"x":-2400,"y":-2100,"r":1.9,"speed":0.59,"phase":0.74,"op":0.61,"glow":false},{"id":4,"x":-2100,"y":-1500,"r":2.25,"speed":0.71,"phase":1.1099999999999999,"op":0.69,"glow":false},{"id":5,"x":-1800,"y":-2400,"r":1.2,"speed":0.83,"phase":1.48,"op":0.77,"glow":false},{"id":6,"x":-1500,"y":-1700,"r":3.5999999999999996,"speed":0.95,"phase":1.85,"op":0.8,"glow":false},{"id":7,"x":-1200,"y":-2200,"r":1.9,"speed":0.35,"phase":2.2199999999999998,"op":0.53,"glow":false},{"id":8,"x":-900,"y":-1600,"r":2.25,"speed":0.47,"phase":2.59,"op":0.61,"glow":true},{"id":9,"x":-2900,"y":-1200,"r":1.2,"speed":0.59,"phase":2.96,"op":0.69,"glow":false},{"id":10,"x":-2500,"y":-900,"r":1.5499999999999998,"speed":0.71,"phase":3.33,"op":0.77,"glow":false},{"id":11,"x":-2200,"y":-1250,"r":3.1999999999999997,"speed":0.83,"phase":3.7,"op":0.8,"glow":false},{"id":12,"x":-1900,"y":-800,"r":2.25,"speed":0.95,"phase":4.07,"op":0.53,"glow":false},{"id":13,"x":-1600,"y":-1100,"r":1.2,"speed":0.35,"phase":4.4399999999999995,"op":0.61,"glow":false},{"id":14,"x":-1300,"y":-650,"r":1.5499999999999998,"speed":0.47,"phase":4.81,"op":0.69,"glow":false},{"id":15,"x":-1000,"y":-950,"r":1.9,"speed":0.59,"phase":5.18,"op":0.77,"glow":true},{"id":16,"x":-700,"y":-500,"r":2.8,"speed":0.71,"phase":5.55,"op":0.8,"glow":false},{"id":17,"x":-500,"y":-300,"r":1.2,"speed":0.83,"phase":5.92,"op":0.53,"glow":false},{"id":18,"x":-350,"y":150,"r":1.5499999999999998,"speed":0.95,"phase":0.0068146928204138035,"op":0.61,"glow":false},{"id":19,"x":-200,"y":-100,"r":1.9,"speed":0.35,"phase":0.3768146928204139,"op":0.69,"glow":false},{"id":20,"x":-50,"y":250,"r":2.25,"speed":0.47,"phase":0.746814692820414,"op":0.77,"glow":false},{"id":21,"x":100,"y":-250,"r":3.5999999999999996,"speed":0.59,"phase":1.1168146928204141,"op":0.8,"glow":false},{"id":22,"x":250,"y":100,"r":1.5499999999999998,"speed":0.71,"phase":1.4868146928204133,"op":0.53,"glow":true},{"id":23,"x":400,"y":-150,"r":1.9,"speed":0.83,"phase":1.8568146928204143,"op":0.61,"glow":false},{"id":24,"x":550,"y":280,"r":2.25,"speed":0.95,"phase":2.2268146928204136,"op":0.69,"glow":false},{"id":25,"x":700,"y":-80,"r":1.2,"speed":0.35,"phase":2.5968146928204128,"op":0.77,"glow":false},{"id":26,"x":850,"y":320,"r":3.1999999999999997,"speed":0.47,"phase":2.9668146928204138,"op":0.8,"glow":false},{"id":27,"x":1000,"y":-200,"r":1.9,"speed":0.59,"phase":3.336814692820413,"op":0.53,"glow":false},{"id":28,"x":1150,"y":180,"r":2.25,"speed":0.71,"phase":3.706814692820414,"op":0.61,"glow":false},{"id":29,"x":1300,"y":-120,"r":1.2,"speed":0.83,"phase":4.076814692820413,"op":0.69,"glow":true},{"id":30,"x":1450,"y":350,"r":1.5499999999999998,"speed":0.95,"phase":4.446814692820414,"op":0.77,"glow":false},{"id":31,"x":1600,"y":-50,"r":2.8,"speed":0.35,"phase":4.816814692820413,"op":0.8,"glow":false},{"id":32,"x":1750,"y":220,"r":2.25,"speed":0.47,"phase":5.186814692820414,"op":0.53,"glow":false},{"id":33,"x":1900,"y":-180,"r":1.2,"speed":0.59,"phase":5.556814692820414,"op":0.61,"glow":false},{"id":34,"x":2050,"y":300,"r":1.5499999999999998,"speed":0.71,"phase":5.926814692820413,"op":0.69,"glow":false},{"id":35,"x":2200,"y":-100,"r":1.9,"speed":0.83,"phase":0.013629385640827607,"op":0.77,"glow":false},{"id":36,"x":2400,"y":-1600,"r":3.5999999999999996,"speed":0.95,"phase":0.3836293856408268,"op":0.8,"glow":true},{"id":37,"x":2700,"y":-2100,"r":1.2,"speed":0.35,"phase":0.7536293856408278,"op":0.53,"glow":false},{"id":38,"x":3000,"y":-1500,"r":1.5499999999999998,"speed":0.47,"phase":1.123629385640827,"op":0.61,"glow":false},{"id":39,"x":3300,"y":-2200,"r":1.9,"speed":0.59,"phase":1.493629385640828,"op":0.69,"glow":false},{"id":40,"x":3600,"y":-1800,"r":2.25,"speed":0.71,"phase":1.8636293856408273,"op":0.77,"glow":false},{"id":41,"x":3900,"y":-2400,"r":3.1999999999999997,"speed":0.83,"phase":2.2336293856408282,"op":0.8,"glow":false},{"id":42,"x":4200,"y":-1600,"r":1.5499999999999998,"speed":0.95,"phase":2.6036293856408275,"op":0.53,"glow":false},{"id":43,"x":4500,"y":-2000,"r":1.9,"speed":0.35,"phase":2.9736293856408267,"op":0.61,"glow":true},{"id":44,"x":4800,"y":-1400,"r":2.25,"speed":0.47,"phase":3.3436293856408277,"op":0.69,"glow":false},{"id":45,"x":2600,"y":-1100,"r":1.2,"speed":0.59,"phase":3.7136293856408287,"op":0.77,"glow":false},{"id":46,"x":2900,"y":-750,"r":2.8,"speed":0.71,"phase":4.083629385640826,"op":0.8,"glow":false},{"id":47,"x":3200,"y":-1200,"r":1.9,"speed":0.83,"phase":4.453629385640827,"op":0.53,"glow":false},{"id":48,"x":3500,"y":-850,"r":2.25,"speed":0.95,"phase":4.823629385640828,"op":0.61,"glow":false},{"id":49,"x":3800,"y":-1300,"r":1.2,"speed":0.35,"phase":5.1936293856408255,"op":0.69,"glow":false},{"id":50,"x":4100,"y":-700,"r":1.5499999999999998,"speed":0.47,"phase":5.5636293856408265,"op":0.77,"glow":true},{"id":51,"x":4400,"y":-1150,"r":3.5999999999999996,"speed":0.59,"phase":5.9336293856408275,"op":0.8,"glow":false},{"id":52,"x":4700,"y":-600,"r":2.25,"speed":0.71,"phase":0.0204440784612423,"op":0.53,"glow":false},{"id":53,"x":5000,"y":-950,"r":1.2,"speed":0.83,"phase":0.39044407846123974,"op":0.61,"glow":false},{"id":54,"x":-3000,"y":600,"r":1.5499999999999998,"speed":0.95,"phase":0.7604440784612407,"op":0.69,"glow":false},{"id":55,"x":-2700,"y":1100,"r":1.9,"speed":0.35,"phase":1.1304440784612417,"op":0.77,"glow":false},{"id":56,"x":-2400,"y":750,"r":3.1999999999999997,"speed":0.47,"phase":1.5004440784612427,"op":0.8,"glow":false},{"id":57,"x":-2100,"y":1300,"r":1.2,"speed":0.59,"phase":1.8704440784612402,"op":0.53,"glow":true},{"id":58,"x":-1800,"y":850,"r":1.5499999999999998,"speed":0.71,"phase":2.240444078461241,"op":0.61,"glow":false},{"id":59,"x":-1500,"y":1450,"r":1.9,"speed":0.83,"phase":2.610444078461242,"op":0.69,"glow":false},{"id":60,"x":-1200,"y":950,"r":2.25,"speed":0.95,"phase":2.9804440784612396,"op":0.77,"glow":false},{"id":61,"x":-900,"y":1600,"r":2.8,"speed":0.35,"phase":3.3504440784612406,"op":0.8,"glow":false},{"id":62,"x":-600,"y":1100,"r":1.5499999999999998,"speed":0.47,"phase":3.7204440784612416,"op":0.53,"glow":false},{"id":63,"x":-2800,"y":1800,"r":1.9,"speed":0.59,"phase":4.090444078461243,"op":0.61,"glow":false},{"id":64,"x":-2500,"y":2300,"r":2.25,"speed":0.71,"phase":4.46044407846124,"op":0.69,"glow":true},{"id":65,"x":-2200,"y":1900,"r":1.2,"speed":0.83,"phase":4.830444078461241,"op":0.77,"glow":false},{"id":66,"x":-1900,"y":2500,"r":3.5999999999999996,"speed":0.95,"phase":5.200444078461242,"op":0.8,"glow":false},{"id":67,"x":-1600,"y":2100,"r":1.9,"speed":0.35,"phase":5.5704440784612395,"op":0.53,"glow":false},{"id":68,"x":-1300,"y":2700,"r":2.25,"speed":0.47,"phase":5.9404440784612405,"op":0.61,"glow":false},{"id":69,"x":-1000,"y":2200,"r":1.2,"speed":0.59,"phase":0.027258771281655214,"op":0.69,"glow":false},{"id":70,"x":-700,"y":2800,"r":1.5499999999999998,"speed":0.71,"phase":0.3972587712816562,"op":0.77,"glow":false},{"id":71,"x":-400,"y":2350,"r":3.1999999999999997,"speed":0.83,"phase":0.7672587712816537,"op":0.8,"glow":true},{"id":72,"x":-200,"y":850,"r":2.25,"speed":0.95,"phase":1.1372587712816546,"op":0.53,"glow":false},{"id":73,"x":0,"y":1400,"r":1.2,"speed":0.35,"phase":1.5072587712816556,"op":0.61,"glow":false},{"id":74,"x":200,"y":950,"r":1.5499999999999998,"speed":0.47,"phase":1.877258771281653,"op":0.69,"glow":false},{"id":75,"x":400,"y":1600,"r":1.9,"speed":0.59,"phase":2.247258771281654,"op":0.77,"glow":false},{"id":76,"x":600,"y":1100,"r":2.8,"speed":0.71,"phase":2.617258771281655,"op":0.8,"glow":false},{"id":77,"x":800,"y":1750,"r":1.2,"speed":0.83,"phase":2.987258771281656,"op":0.53,"glow":false},{"id":78,"x":1000,"y":1250,"r":1.5499999999999998,"speed":0.95,"phase":3.3572587712816535,"op":0.61,"glow":true},{"id":79,"x":1200,"y":1900,"r":1.9,"speed":0.35,"phase":3.7272587712816545,"op":0.69,"glow":false},{"id":80,"x":1400,"y":1350,"r":2.25,"speed":0.47,"phase":4.0972587712816555,"op":0.77,"glow":false},{"id":81,"x":1600,"y":2050,"r":3.5999999999999996,"speed":0.59,"phase":4.4672587712816565,"op":0.8,"glow":false},{"id":82,"x":1800,"y":1500,"r":1.5499999999999998,"speed":0.71,"phase":4.837258771281654,"op":0.53,"glow":false},{"id":83,"x":2000,"y":2200,"r":1.9,"speed":0.83,"phase":5.207258771281655,"op":0.61,"glow":false},{"id":84,"x":2200,"y":1650,"r":2.25,"speed":0.95,"phase":5.577258771281656,"op":0.69,"glow":false},{"id":85,"x":2400,"y":2350,"r":1.2,"speed":0.35,"phase":5.947258771281653,"op":0.77,"glow":true},{"id":86,"x":2600,"y":1750,"r":3.1999999999999997,"speed":0.47,"phase":0.03407346410206813,"op":0.8,"glow":false},{"id":87,"x":2800,"y":2450,"r":1.9,"speed":0.59,"phase":0.4040734641020691,"op":0.53,"glow":false},{"id":88,"x":3000,"y":1850,"r":2.25,"speed":0.71,"phase":0.7740734641020666,"op":0.61,"glow":false},{"id":89,"x":3200,"y":2600,"r":1.2,"speed":0.83,"phase":1.1440734641020711,"op":0.69,"glow":false},{"id":90,"x":3400,"y":1950,"r":1.5499999999999998,"speed":0.95,"phase":1.5140734641020686,"op":0.77,"glow":false},{"id":91,"x":3600,"y":300,"r":2.8,"speed":0.35,"phase":1.884073464102066,"op":0.8,"glow":false},{"id":92,"x":3900,"y":850,"r":2.25,"speed":0.47,"phase":2.2540734641020705,"op":0.53,"glow":true},{"id":93,"x":4200,"y":200,"r":1.2,"speed":0.59,"phase":2.624073464102068,"op":0.61,"glow":false},{"id":94,"x":4500,"y":950,"r":1.5499999999999998,"speed":0.71,"phase":2.9940734641020654,"op":0.69,"glow":false},{"id":95,"x":4800,"y":400,"r":1.9,"speed":0.83,"phase":3.36407346410207,"op":0.77,"glow":false},{"id":96,"x":5100,"y":1100,"r":3.5999999999999996,"speed":0.95,"phase":3.7340734641020674,"op":0.8,"glow":false},{"id":97,"x":5400,"y":500,"r":1.2,"speed":0.35,"phase":4.104073464102065,"op":0.53,"glow":false},{"id":98,"x":5700,"y":1250,"r":1.5499999999999998,"speed":0.47,"phase":4.474073464102069,"op":0.61,"glow":false},{"id":99,"x":3700,"y":1450,"r":1.9,"speed":0.59,"phase":4.844073464102067,"op":0.69,"glow":true},{"id":100,"x":4000,"y":2100,"r":2.25,"speed":0.71,"phase":5.214073464102071,"op":0.77,"glow":false},{"id":101,"x":4300,"y":1600,"r":3.1999999999999997,"speed":0.83,"phase":5.584073464102069,"op":0.8,"glow":false},{"id":102,"x":4600,"y":2300,"r":1.5499999999999998,"speed":0.95,"phase":5.954073464102066,"op":0.53,"glow":false},{"id":103,"x":4900,"y":1750,"r":1.9,"speed":0.35,"phase":0.0408881569224846,"op":0.61,"glow":false},{"id":104,"x":5200,"y":2500,"r":2.25,"speed":0.47,"phase":0.41088815692248204,"op":0.69,"glow":false},{"id":105,"x":5500,"y":1900,"r":1.2,"speed":0.59,"phase":0.7808881569224795,"op":0.77,"glow":false},{"id":106,"x":5800,"y":2700,"r":2.8,"speed":0.71,"phase":1.150888156922484,"op":0.8,"glow":true},{"id":107,"x":-3400,"y":0,"r":1.9,"speed":0.83,"phase":1.5208881569224815,"op":0.53,"glow":false},{"id":108,"x":-3100,"y":-600,"r":2.25,"speed":0.95,"phase":1.890888156922479,"op":0.61,"glow":false},{"id":109,"x":-2000,"y":0,"r":1.2,"speed":0.35,"phase":2.2608881569224835,"op":0.69,"glow":false},{"id":110,"x":-100,"y":-1800,"r":1.5499999999999998,"speed":0.47,"phase":2.630888156922481,"op":0.77,"glow":false},{"id":111,"x":500,"y":-2200,"r":3.5999999999999996,"speed":0.59,"phase":3.0008881569224855,"op":0.8,"glow":false},{"id":112,"x":1100,"y":-2500,"r":2.25,"speed":0.71,"phase":3.370888156922483,"op":0.53,"glow":false},{"id":113,"x":1800,"y":-2100,"r":1.2,"speed":0.83,"phase":3.7408881569224803,"op":0.61,"glow":true},{"id":114,"x":2500,"y":-2600,"r":1.5499999999999998,"speed":0.95,"phase":4.110888156922485,"op":0.69,"glow":false},{"id":115,"x":-2600,"y":3100,"r":1.9,"speed":0.35,"phase":4.480888156922482,"op":0.77,"glow":false},{"id":116,"x":-1800,"y":3400,"r":3.1999999999999997,"speed":0.47,"phase":4.85088815692248,"op":0.8,"glow":false},{"id":117,"x":-900,"y":3200,"r":1.2,"speed":0.59,"phase":5.220888156922484,"op":0.53,"glow":false},{"id":118,"x":100,"y":3500,"r":1.5499999999999998,"speed":0.71,"phase":5.590888156922482,"op":0.61,"glow":false},{"id":119,"x":1100,"y":3300,"r":1.9,"speed":0.83,"phase":5.960888156922479,"op":0.69,"glow":false},{"id":120,"x":2100,"y":3600,"r":2.25,"speed":0.95,"phase":0.04770284974289751,"op":0.77,"glow":true},{"id":121,"x":3100,"y":3400,"r":2.8,"speed":0.35,"phase":0.41770284974289495,"op":0.8,"glow":false},{"id":122,"x":4100,"y":3700,"r":1.5499999999999998,"speed":0.47,"phase":0.7877028497428924,"op":0.53,"glow":false},{"id":123,"x":5100,"y":3500,"r":1.9,"speed":0.59,"phase":1.157702849742897,"op":0.61,"glow":false}];

/**
 * DynamicAtmosphericBackground — Living Scalable Canvas Engine with Scale-Reactive Particles
 */
export const DynamicAtmosphericBackground = ({
  pan = { x: 0, y: 0 },
  zoom = 1,
  canvasDimensions: propDimensions,
}) => {
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight : 1080,
  });

  const [mousePos, setMousePos] = useState({ x: 50, y: 40 });
  const targetMouseRef = useRef({ x: 50, y: 40 });
  const [wavePhase, setWavePhase] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    const handleMouseMove = (e) => {
      const xPct = Math.round((e.clientX / window.innerWidth) * 100);
      const yPct = Math.round((e.clientY / window.innerHeight) * 100);
      targetMouseRef.current = { x: xPct, y: yPct };
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('pointermove', handleMouseMove, { passive: true });

    let animId;
    let startTime = performance.now();

    const renderLoop = (currentTime) => {
      const elapsed = (currentTime - startTime) / 1000;
      setWavePhase(elapsed * 0.25);

      setMousePos((prev) => {
        const dx = targetMouseRef.current.x - prev.x;
        const dy = targetMouseRef.current.y - prev.y;
        if (Math.abs(dx) < 0.2 && Math.abs(dy) < 0.2) return prev;
        return {
          x: prev.x + dx * 0.08,
          y: prev.y + dy * 0.08,
        };
      });

      animId = requestAnimationFrame(renderLoop);
    };
    animId = requestAnimationFrame(renderLoop);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  const width = propDimensions?.width || dimensions.width;
  const height = propDimensions?.height || dimensions.height;
  const aspectRatio = width / (height || 1);

  // 1. Base Gradient Layer Aspect Ratio Adaptation
  const gradientConfig = useMemo(() => {
    if (aspectRatio < 0.95) {
      return {
        angle: '180deg',
        radialShape: 'ellipse 120% 65%',
        stops: '#FFFFFF 0%, #FAF9F7 30%, #F3F1ED 70%, #E8E5DF 100%',
        focalY: Math.max(15, Math.min(45, 25 - (pan.y / height) * 15)),
        focalX: Math.max(20, Math.min(80, 50 - (pan.x / width) * 15)),
      };
    } else if (aspectRatio > 1.4) {
      return {
        angle: '110deg',
        radialShape: 'ellipse 75% 90%',
        stops: '#FFFFFF 0%, #FAF9F7 25%, #F2F0EC 65%, #E8E5DF 100%',
        focalY: Math.max(20, Math.min(80, 45 - (pan.y / height) * 20)),
        focalX: Math.max(20, Math.min(80, 48 - (pan.x / width) * 20)),
      };
    } else {
      return {
        angle: '145deg',
        radialShape: 'ellipse 85% 85%',
        stops: '#FFFFFF 0%, #FAF9F7 25%, #F2F0EC 65%, #E8E5DF 100%',
        focalY: Math.max(20, Math.min(80, 45 - (pan.y / height) * 20)),
        focalX: Math.max(20, Math.min(80, 50 - (pan.x / width) * 20)),
      };
    }
  }, [aspectRatio, pan.x, pan.y, width, height]);

  // 2. Continuous Distance-Based Opacity Functions (Appear/Disappear with Zoom)
  const stdDotOpacity = useMemo(() => {
    const fadeIn = Math.max(0, Math.min(1, (zoom - 0.5) / 0.3));
    const fadeOut = Math.max(0, Math.min(1, (1.6 - zoom) / 0.3));
    return 0.42 * fadeIn * fadeOut;
  }, [zoom]);

  const microGridOpacity = useMemo(() => {
    return Math.max(0, Math.min(0.92, (zoom - 1.15) / 0.4));
  }, [zoom]);

  const macroGridOpacity = useMemo(() => {
    return Math.max(0, Math.min(0.85, (0.8 - zoom) / 0.35));
  }, [zoom]);

  const majorCrossOpacity = useMemo(() => {
    return Math.max(0, Math.min(0.5, (zoom - 0.55) / 0.4));
  }, [zoom]);

  const macroCurvesOpacity = useMemo(() => {
    return Math.max(0.18, Math.min(0.85, 1.15 - zoom * 0.4));
  }, [zoom]);

  const streamlinesOpacity = useMemo(() => {
    return Math.max(0.25, Math.min(0.85, 0.4 + Math.sin(Math.min(Math.PI, zoom * 1.2)) * 0.45));
  }, [zoom]);

  // PARTICLES PROMINENT WHEN ZOOMED OUT / SIZED SMALL / NARROWED
  const particlesMasterOpacity = useMemo(() => {
    return Math.max(0.55, Math.min(0.98, 1.25 - zoom * 0.3));
  }, [zoom]);

  // 3. 4-Tier Parallax Kinematic Offsets
  const pDeepX = (pan.x * 0.12) % 1200;
  const pDeepY = (pan.y * 0.12) % 1200;

  const pMidX = (pan.x * 0.35) % 400;
  const pMidY = (pan.y * 0.35) % 400;

  const dotCellSize = Math.max(18, Math.min(54, 32 / zoom));
  const dotRadius = Math.max(0.45, 0.7 * Math.min(0.9, 1 / zoom));

  const w1 = Math.sin(wavePhase) * 24;
  const w2 = Math.cos(wavePhase * 0.8) * 28;
  const w3 = Math.sin(wavePhase * 0.6 + 1.2) * 20;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0 bg-[#F6F5F2]">
      {/* 1. LIVING BASE GRADIENT LAYER (Aspect-Ratio Responsive) */}
      <div
        className="absolute inset-0 transition-all duration-700 ease-out"
        style={{
          background: `
            radial-gradient(${gradientConfig.radialShape} at ${gradientConfig.focalX}% ${gradientConfig.focalY}%, rgba(255, 255, 255, 0.95) 0%, rgba(250, 249, 247, 0.7) 35%, rgba(242, 240, 236, 0.4) 70%, rgba(230, 227, 221, 0.25) 100%),
            linear-gradient(${gradientConfig.angle}, ${gradientConfig.stops})
          `,
        }}
      />

      {/* 2. LIVING CURSOR AMBIENT DAYLIGHT POOL */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle 380px at ${mousePos.x}% ${mousePos.y}%, rgba(255, 255, 255, 0.65) 0%, rgba(255, 255, 255, 0.25) 45%, transparent 80%)`,
        }}
      />

      {/* 3. DYNAMIC PARALLAX VECTOR GRAPHICS, CURVES & DENSE PARTICLES */}
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* A. Micro Precision Millimeter Graph (Appears on close zoom > 1.2x) */}
          <pattern
            id="micro-eng-grid"
            width={20 / zoom}
            height={20 / zoom}
            patternUnits="userSpaceOnUse"
            patternTransform={`translate(${pan.x % (20 / zoom)}, ${pan.y % (20 / zoom)})`}
          >
            <path
              d={`M ${20 / zoom} 0 L 0 0 0 ${20 / zoom}`}
              fill="none"
              stroke="#D8D5CF"
              strokeWidth={Math.max(0.4, 0.75 * zoom)}
            />
            <path
              d={`M -${2 / zoom} 0 L ${2 / zoom} 0 M 0 -${2 / zoom} L 0 ${2 / zoom}`}
              stroke="#A8A49C"
              strokeWidth={Math.max(0.5, 0.9 * zoom)}
            />
          </pattern>

          {/* B. Architectural Dot Grid (Appears at standard reading zoom) */}
          <pattern
            id="std-dot-grid"
            width={dotCellSize}
            height={dotCellSize}
            patternUnits="userSpaceOnUse"
            patternTransform={`translate(${pan.x % dotCellSize}, ${pan.y % dotCellSize})`}
          >
            <circle
              cx={dotCellSize / 2}
              cy={dotCellSize / 2}
              r={dotRadius}
              fill="#B8B4AC"
            />
          </pattern>

          {/* Major 128px Structural Crosshair Grid */}
          <pattern
            id="major-cross-grid"
            width={128 / zoom}
            height={128 / zoom}
            patternUnits="userSpaceOnUse"
            patternTransform={`translate(${pan.x % (128 / zoom)}, ${pan.y % (128 / zoom)})`}
          >
            <circle cx={(128 / zoom) / 2} cy={(128 / zoom) / 2} r={Math.max(1.0, 1.8 / zoom)} fill="#9E9A92" opacity="0.65" />
            <path
              d={`M ${(128 / zoom) / 2} ${(128 / zoom) / 2 - 5 / zoom} L ${(128 / zoom) / 2} ${(128 / zoom) / 2 + 5 / zoom} M ${(128 / zoom) / 2 - 5 / zoom} ${(128 / zoom) / 2} L ${(128 / zoom) / 2 + 5 / zoom} ${(128 / zoom) / 2}`}
              stroke="#9E9A92"
              strokeWidth={Math.max(0.6, 1.1 * zoom)}
            />
          </pattern>

          {/* C. Macro Constellation Grid (Appears on distant zoom < 0.8x) */}
          <pattern
            id="macro-celestial-grid"
            width="160"
            height="160"
            patternUnits="userSpaceOnUse"
            patternTransform={`translate(${pMidX}, ${pMidY})`}
          >
            <path
              d="M 160 0 L 0 0 0 160"
              fill="none"
              stroke="#C5C2BA"
              strokeWidth="0.85"
              strokeDasharray="5 7"
            />
            <circle cx="80" cy="80" r="3.5" fill="none" stroke="#9E9A92" strokeWidth="0.9" opacity="0.6" />
            <circle cx="0" cy="0" r="5" fill="none" stroke="#6E6A63" strokeWidth="1.1" opacity="0.75" />
            <circle cx="0" cy="0" r="2" fill="#6E6A63" opacity="0.9" />
          </pattern>

          {/* Fluid Current Gradient Definition */}
          <linearGradient id="current-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C8C5BD" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#A8A49C" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#D5D2CB" stopOpacity="0.35" />
          </linearGradient>

          {/* Particle Radial Aura */}
          <radialGradient id="particle-aura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#7A756D" stopOpacity="0.9" />
            <stop offset="35%" stopColor="#B8B4AC" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* TIER 1: SLOW LIVING TOPOGRAPHIC ISOBAR ELEVATION WAVES (Distance Scalable) */}
        <g
          transform={`translate(${pDeepX * 0.4}, ${pDeepY * 0.4})`}
          className="transition-opacity duration-700"
          opacity={macroCurvesOpacity}
        >
          <path
            d={`M -300,${260 + w1} C 150,${100 - w2} 600,${400 + w3} 1050,${240 + w1} C 1500,${80 - w3} 1950,${360 + w2} 2400,${200 + w1}`}
            fill="none"
            stroke="#C5C2BA"
            strokeWidth="1.8"
            strokeDasharray="8 10"
          />
          <path
            d={`M -300,${500 + w2} C 200,${340 + w1} 700,${660 - w3} 1250,${470 + w2} C 1800,${290 + w3} 2250,${580 - w1} 2700,${420 + w2}`}
            fill="none"
            stroke="#D0CDC5"
            strokeWidth="1.4"
          />
          <path
            d={`M -200,${760 - w3} C 350,${620 + w2} 900,${880 - w1} 1450,${720 + w3} C 2000,${560 - w2} 2450,${820 + w1} 2900,${670 - w3}`}
            fill="none"
            stroke="#C5C2BA"
            strokeWidth="1.2"
            strokeDasharray="6 8"
          />
        </g>

        {/* TIER 2: SLOW LIVING KNOWLEDGE CURRENT STREAMLINES (Distance Scalable) */}
        <g
          transform={`translate(${pMidX * 0.6}, ${pMidY * 0.6})`}
          className="transition-opacity duration-500"
          opacity={streamlinesOpacity}
        >
          <path
            d={`M -150,${400 + w2} Q 400,${200 - w1} 950,${420 + w3} T 2100,${360 - w2}`}
            fill="none"
            stroke="url(#current-gradient)"
            strokeWidth="2.0"
            strokeDasharray="14 8"
          />
          <path
            d={`M -100,${620 - w1} Q 550,${460 + w3} 1150,${640 - w2} T 2300,${560 + w1}`}
            fill="none"
            stroke="url(#current-gradient)"
            strokeWidth="1.5"
            strokeDasharray="10 6"
          />
        </g>

        {/* TIER 3: AMBIENT FLOATING KNOWLEDGE PARTICLES (Enhanced when zoomed out / narrowed) */}
        <g
          transform={`translate(${pan.x * 0.28}, ${pan.y * 0.28})`}
          opacity={particlesMasterOpacity}
          className="transition-opacity duration-300"
        >
          {AMBIENT_PARTICLES.map((p) => {
            const driftX = Math.sin(wavePhase * p.speed + p.phase) * 16;
            const driftY = Math.cos(wavePhase * p.speed * 0.8 + p.phase) * 14;
            const pulse = 1 + Math.sin(wavePhase * 1.8 + p.phase) * 0.22;

            return (
              <g key={p.id} transform={`translate(${p.x + driftX}, ${p.y + driftY})`}>
                {p.glow && (
                  <circle
                    cx="0"
                    cy="0"
                    r={p.r * 4.0 * pulse}
                    fill="url(#particle-aura)"
                    opacity="0.4"
                  />
                )}
                <circle
                  cx="0"
                  cy="0"
                  r={Math.max(1.1, p.r * pulse)}
                  fill="#6B655D"
                  opacity={p.op}
                />
              </g>
            );
          })}
        </g>

        {/* TIER 4: DISTANCE-SCALABLE DOTS & GRIDS */}
        {microGridOpacity > 0 && (
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="url(#micro-eng-grid)"
            opacity={microGridOpacity}
            className="transition-opacity duration-300"
          />
        )}

        {stdDotOpacity > 0 && (
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="url(#std-dot-grid)"
            opacity={stdDotOpacity}
            className="transition-opacity duration-300"
          />
        )}

        {majorCrossOpacity > 0 && (
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="url(#major-cross-grid)"
            opacity={majorCrossOpacity}
            className="transition-opacity duration-300"
          />
        )}

        {macroGridOpacity > 0 && (
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="url(#macro-celestial-grid)"
            opacity={macroGridOpacity}
            className="transition-opacity duration-300"
          />
        )}

      </svg>

      {/* 4. TACTILE MONOCHROMATIC PAPER FIBER NOISE */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{
          opacity: zoom > 1.3 ? 0.8 : zoom > 0.7 ? 0.45 : 0.2,
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(56, 52, 48, 0.02) 0%, transparent 70%),
            radial-gradient(circle at 20% 80%, rgba(56, 52, 48, 0.015) 0%, transparent 60%)
          `,
          backgroundSize: '160px 160px',
        }}
      />
    </div>
  );
};
