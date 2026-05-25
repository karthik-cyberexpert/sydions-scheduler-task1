import { useState, useEffect, useRef } from 'react';

function App() {
  // Preloading state
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Mobile menu state
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Canvas refs
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const totalFrames = 150;
  const loadedCount = useRef(0);

  // 1. Preload motion background frames
  useEffect(() => {
    let active = true;
    
    const loadFrames = async () => {
      const promises = Array.from({ length: totalFrames }, (_, index) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.src = `/frames/frame_${String(index + 1).padStart(4, '0')}.png`;
          img.onload = () => {
            if (active) {
              loadedCount.current += 1;
              const progress = Math.round((loadedCount.current / totalFrames) * 100);
              setLoadingProgress(progress);
            }
            resolve(img);
          };
          img.onerror = () => {
            if (active) {
              loadedCount.current += 1;
              const progress = Math.round((loadedCount.current / totalFrames) * 100);
              setLoadingProgress(progress);
            }
            resolve(null);
          };
          imagesRef.current[index] = img;
        });
      });

      await Promise.all(promises);
      
      // Delay slightly for a smoother transition out of preloader
      setTimeout(() => {
        if (active) setLoading(false);
      }, 500);
    };

    loadFrames();

    return () => {
      active = false;
    };
  }, []);

  // Helper to draw a specific frame on the canvas
  const drawFrame = (index) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = imagesRef.current[index];
    if (!img || !img.complete) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Canvas size
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Image size
    const imgWidth = img.width;
    const imgHeight = img.height;

    // Scale ratio
    let ratio = Math.max(canvasWidth / imgWidth, canvasHeight / imgHeight);
    
    // Force image to maintain landscape aspect ratio (fit width) on mobile screens
    if (window.innerWidth <= 768) {
      ratio = canvasWidth / imgWidth;
    }

    const newWidth = imgWidth * ratio;
    const newHeight = imgHeight * ratio;

    // Centered position
    const x = (canvasWidth - newWidth) / 2;
    const y = (canvasHeight - newHeight) / 2;

    ctx.drawImage(img, x, y, newWidth, newHeight);
  };

  // 2. Set up scroll event listener to update frame draw
  useEffect(() => {
    if (loading) return;

    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Initial render on resize
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollFraction = scrollHeight > 0 ? window.scrollY / scrollHeight : 0;
      const frameIndex = Math.min(
        totalFrames - 1,
        Math.max(0, Math.floor(scrollFraction * totalFrames))
      );
      drawFrame(frameIndex);
    };

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;
      const scrollFraction = window.scrollY / scrollHeight;
      const frameIndex = Math.min(
        totalFrames - 1,
        Math.max(0, Math.floor(scrollFraction * totalFrames))
      );

      requestAnimationFrame(() => {
        drawFrame(frameIndex);
      });
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);

    // Run initial canvas size and draw
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [loading]);

  // 3. Intersection Observer to trigger scroll-triggered animations
  useEffect(() => {
    if (loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          } else {
            entry.target.classList.remove('visible');
          }
        });
      },
      {
        threshold: 0.12, // trigger when 12% of the section is visible
        rootMargin: '0px 0px -10% 0px' // slightly offset trigger point for natural entry
      }
    );

    const sections = document.querySelectorAll('.story-section');
    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, [loading]);

  return (
    <>
      {/* 3D Preloader Overlay */}
      {loading && (
        <div className="preloader-overlay">
          <div className="preloader-container">
            <h2 className="brand-logo preloader-logo">
              VELOCITY<span className="brand-dot"></span>
            </h2>
            <p className="preloader-subtitle">Loading dynamic motion frames...</p>
            <div className="preloader-progress-bar-container">
              <div 
                className="preloader-progress-bar" 
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
            <div className="preloader-percentage">{loadingProgress}%</div>
          </div>
        </div>
      )}

      {/* Fixed Motion Background Canvas and Overlay */}
      <canvas ref={canvasRef} className="motion-canvas" />
      <div className="motion-overlay" />

      {/* Header / Navbar */}
      <header className="navbar">
        <div className="container navbar-container">
          <a href="#hero" className="brand-logo" onClick={() => setIsMenuOpen(false)}>
            VELOCITY<span className="brand-dot"></span>
          </a>

          {/* Hamburger Menu Icon */}
          <div 
            className={`hamburger ${isMenuOpen ? 'open' : ''}`} 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </div>

          <nav className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
            <ul className="nav-links">
              <li><a href="#design" className="nav-link" onClick={() => setIsMenuOpen(false)}>Chassis</a></li>
              <li><a href="#aero" className="nav-link" onClick={() => setIsMenuOpen(false)}>Aero</a></li>
              <li><a href="#drivetrain" className="nav-link" onClick={() => setIsMenuOpen(false)}>Power</a></li>
              <li><a href="#speed" className="nav-link" onClick={() => setIsMenuOpen(false)}>Performance</a></li>
              <li><a href="#cockpit" className="nav-link" onClick={() => setIsMenuOpen(false)}>Cockpit</a></li>
              <li><a href="#reserve" className="nav-link" onClick={() => setIsMenuOpen(false)}>Reserve</a></li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" className="story-section">
        <div className="container">
          <div className="story-content">
            <span className="story-tagline">VELOCITY MOTOR LABS</span>
            <h1 className="story-title glow-text">THE NEXUS S-1</h1>
            <p className="story-body">
              An evolutionary leap in speed. Pure electric hypercars engineered without compromise.
            </p>
            <div className="scroll-indicator">
              <span className="scroll-arrow">↓</span> Scroll to Unveil
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Chassis */}
      <section id="design" className="story-section">
        <div className="container">
          <div className="story-content">
            <span className="story-tagline">STRUCTURAL INTEGRITY</span>
            <h2 className="story-title">CARBON MONOCOQUE</h2>
            <p className="story-body">
              Molded under 400 tons of pressure. A high-tensile frame stronger than steel, yet lighter than air.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2b: Suspension Spec Detail */}
      <section id="suspension" className="story-section">
        <div className="container">
          <div className="story-content">
            <span className="story-tagline">SUSPENSION GEOMETRY</span>
            <h2 className="story-title">ACTIVE MAGNETIC RIDE</h2>
            <p className="story-body">
              Magnetorheological dampers processing road input 1,000 times per second to deliver flawless grip and cornering stability.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: Aero */}
      <section id="aero" className="story-section">
        <div className="container">
          <div className="story-content">
            <span className="story-tagline">DEFYING THE WIND</span>
            <h2 className="story-title">ACTIVE AERODYNAMICS</h2>
            <p className="story-body">
              A variable tilt wing matrix dynamically adjusting to downforce loads, delivering up to 800kg of vertical pressure.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3b: Venturi Aero Detail */}
      <section id="venturi" className="story-section">
        <div className="container">
          <div className="story-content">
            <span className="story-tagline">GROUND EFFECT PHENOMENON</span>
            <h2 className="story-title">VENTURI CHANNELS</h2>
            <p className="story-body">
              Sculpted underbody airflow channels creating a vacuum seal to the asphalt, pulling the vehicle down without increasing drag.
            </p>
          </div>
        </div>
      </section>

      {/* Section 4: Power Output */}
      <section id="drivetrain" className="story-section">
        <div className="container">
          <div className="story-content">
            <span className="story-tagline">UNLEASHED ELECTRIC FORCE</span>
            <h2 className="story-title">1,250 HORSEPOWER</h2>
            <p className="story-body">
              Dual-motor torque vectoring. Digital intelligence distributing raw energy to individual contact points instantly.
            </p>
          </div>
        </div>
      </section>

      {/* Section 4b: Vector Control Detail */}
      <section id="vector" className="story-section">
        <div className="container">
          <div className="story-content">
            <span className="story-tagline">TORQUE DISTRIBUTION</span>
            <h2 className="story-title">VECTOR CONTROL</h2>
            <p className="story-body">
              Zero-lag microsecond calculations shifting torque between left and right wheels to eliminate understeer completely.
            </p>
          </div>
        </div>
      </section>

      {/* Section 5: Performance Acceleration */}
      <section id="speed" className="story-section">
        <div className="container">
          <div className="story-content">
            <span className="story-tagline">BEYOND INSTANT</span>
            <h2 className="story-title gradient-text">0-60 IN 1.79 SECONDS</h2>
            <p className="story-body">
              Redefining the boundaries of classical mechanics. Acceleration that shifts human perspective.
            </p>
          </div>
        </div>
      </section>

      {/* Section 5b: Braking Detail */}
      <section id="brakes" className="story-section">
        <div className="container">
          <div className="story-content">
            <span className="story-tagline">DECELERATION VELOCITY</span>
            <h2 className="story-title">REGEN CARBOCERAMIC BRAKES</h2>
            <p className="story-body">
              6-piston front calipers combined with a 500kW kinetic energy recovery system. Halting power that charges the cell.
            </p>
          </div>
        </div>
      </section>

      {/* Section 6: Battery Cells */}
      <section id="energy" className="story-section">
        <div className="container">
          <div className="story-content">
            <span className="story-tagline">SOLID-STATE METRIC</span>
            <h2 className="story-title">410 MILE RANGE</h2>
            <p className="story-body">
              State-of-the-art thermal coolant loops. Recharge to 80% capacity in under 9 minutes.
            </p>
          </div>
        </div>
      </section>

      {/* Section 6b: Thermal Detail */}
      <section id="cooling" className="story-section">
        <div className="container">
          <div className="story-content">
            <span className="story-tagline">THERMODYNAMIC LOOP</span>
            <h2 className="story-title">LIQUID PHASE COOLING</h2>
            <p className="story-body">
              Independent liquid glycol loops keeping solid-state packs at their optimal 35°C operating point under continuous track load.
            </p>
          </div>
        </div>
      </section>

      {/* Section 7: Safety Grid */}
      <section id="autonomy" className="story-section">
        <div className="container">
          <div className="story-content">
            <span className="story-tagline">COGNITIVE SAFETY</span>
            <h2 className="story-title">LEVEL 4 AUTONOMY</h2>
            <p className="story-body">
              Twelve high-definition LIDAR sensors continuously mapping a 3D bubble of the vehicle's surrounding path.
            </p>
          </div>
        </div>
      </section>

      {/* Section 7b: HUD Cockpit Detail */}
      <section id="cockpit" className="story-section">
        <div className="container">
          <div className="story-content">
            <span className="story-tagline">COCKPIT INTERACTION</span>
            <h2 className="story-title">NEURAL INTERFACE HUD</h2>
            <p className="story-body">
              Eye-tracking head-up display projecting telemetry directly onto the windscreen, with interactive controls mapped to gestures.
            </p>
          </div>
        </div>
      </section>

      {/* Section 8: Call to Action */}
      <section id="reserve" className="story-section">
        <div className="container">
          <div className="story-content">
            <span className="story-tagline">PRIVATE RESERVATIONS OPEN</span>
            <h2 className="story-title glow-text">SECURE THE EXPERIENCE</h2>
            <p className="story-body" style={{ marginBottom: '40px' }}>
              Reserve your exclusive track evaluation. Space is strictly limited.
            </p>
            <a href="mailto:reserve@velocitymotors.com" className="story-link">
              REQUEST DRIVING PASS &rarr;
            </a>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="minimal-footer">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} Velocity Locomotives Inc. All terms apply.</p>
        </div>
      </footer>
    </>
  );
}

export default App;
