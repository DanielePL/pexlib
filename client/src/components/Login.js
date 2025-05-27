import { useState } from 'react';

function Login({ setIsAuthenticated }) {
  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validPassword1 = 'Kraft';
  const validPassword2 = 'Vision';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Epic success sound like in the pitch
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();

      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(45, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(25, audioContext.currentTime + 0.8);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(150, audioContext.currentTime);

      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.8);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.8);
    } catch (error) {
      console.log('Audio not supported');
    }

    await new Promise(resolve => setTimeout(resolve, 1200));

    if (password1 === validPassword1 && password2 === validPassword2) {
      localStorage.setItem('authToken', 'team-authenticated');
      setIsAuthenticated(true);
      setIsLoading(false);
      setPassword1('');
      setPassword2('');
    } else {
      setError('Invalid credentials. Please check your passwords.');
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Background with animated gradients from pitch */}
      <div className="gradient-background">
        <div className="gradient-circle gradient-circle-1"></div>
        <div className="gradient-circle gradient-circle-2"></div>
      </div>

      {/* Floating exercises instead of formulas */}
      <div className="floating-exercises">
        <div className="exercise exercise-1">Barbell Squat</div>
        <div className="exercise exercise-2">Deadlift</div>
        <div className="exercise exercise-3">Bench Press</div>
        <div className="exercise exercise-4">Pull-ups</div>
        <div className="exercise exercise-5">Overhead Press</div>
        <div className="exercise exercise-6">Romanian Deadlift</div>
        <div className="exercise exercise-7">Hip Thrust</div>
        <div className="exercise exercise-8">Bulgarian Split Squat</div>
        <div className="exercise exercise-9">Lat Pulldown</div>
        <div className="exercise exercise-10">Dumbbell Row</div>
        <div className="exercise exercise-11">Front Squat</div>
        <div className="exercise exercise-12">Incline Press</div>
        <div className="exercise exercise-13">Walking Lunges</div>
        <div className="exercise exercise-14">Push-ups</div>
        <div className="exercise exercise-15">Barbell Row</div>
        <div className="exercise exercise-16">Leg Press</div>
        <div className="exercise exercise-17">Tricep Dips</div>
        <div className="exercise exercise-18">Face Pulls</div>
        <div className="exercise exercise-19">Goblet Squat</div>
        <div className="exercise exercise-20">Plank</div>
        <div className="exercise exercise-21">Mountain Climbers</div>
        <div className="exercise exercise-22">Burpees</div>
        <div className="exercise exercise-23">Russian Twists</div>
        <div className="exercise exercise-24">Box Jumps</div>
        <div className="exercise exercise-25">Kettlebell Swings</div>
        <div className="exercise exercise-26">Battle Ropes</div>
        <div className="exercise exercise-27">Medicine Ball Slam</div>
        <div className="exercise exercise-28">TRX Rows</div>
        <div className="exercise exercise-29">Farmer's Walk</div>
        <div className="exercise exercise-30">Turkish Get-up</div>
      </div>

      {/* Fire particles from pitch */}
      <div className="fire-container">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="fire-particle"
            style={{
              width: `${4 + (i % 5)}px`,
              height: `${4 + (i % 5)}px`,
              left: `${(i * 5 + 5) % 95}%`,
              animationDelay: `${i * 0.4}s`,
              animationDuration: `${8 + (i % 4)}s`
            }}
          />
        ))}
      </div>

      {/* Pulsing rings from pitch - bigger and more prominent */}
      <div className="pulse-ring-container">
        <div className="pulse-ring ring-1"></div>
        <div className="pulse-ring ring-2"></div>
        <div className="pulse-ring ring-3"></div>
      </div>

      {/* Main login card */}
      <div className="login-card">
        {/* Flash effect above the form */}
        <div className="flash-container">
          <div className="flash-effect"></div>
          <div className="flash-effect flash-delay"></div>
        </div>

        {/* Header with Prometheus branding */}
        <div className="login-header">
          <div className="logo-container">
            <div className="logo-icon">
              ⚡
            </div>
            <div className="logo-pulse"></div>
          </div>
          <h1 className="login-title">PROMETHEUS</h1>
          <p className="login-subtitle">Exercise Library</p>
          <p className="login-tagline">*Powered by cutting-edge sports science*</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="error-message">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="2"/>
              <path d="M8 4v4M8 12h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            {error}
          </div>
        )}

        {/* Login form */}
        <div className="login-form">
          <div className="input-group">
            <label className="input-label">First Key</label>
            <div className="input-container">
              <input
                type="password"
                value={password1}
                onChange={(e) => setPassword1(e.target.value)}
                placeholder="Enter first access key"
                className="login-input"
                disabled={isLoading}
              />
              <div className="input-glow"></div>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Second Key</label>
            <div className="input-container">
              <input
                type="password"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                placeholder="Enter second access key"
                className="login-input"
                disabled={isLoading}
              />
              <div className="input-glow"></div>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="login-button"
          >
            {isLoading ? (
              <div className="loading-content">
                <div className="loading-spinner"></div>
                <span>Accessing Exercise Library...</span>
              </div>
            ) : (
              <div className="button-content">
                <span>Access Exercise Library</span>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M4 10h12M12 6l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="login-footer">
          <div className="security-badge">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1L3 3v4c0 3.5 2.5 6.5 5 7 2.5-.5 5-3.5 5-7V3L8 1z" fill="currentColor"/>
              <path d="M6 8l1.5 1.5L11 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Secure Access Protocol
          </div>
        </div>
      </div>

      <style jsx>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(ellipse at 85% 85%, rgba(237, 137, 54, 0.15) 0%, rgba(26, 32, 44, 0.95) 30%, #0d1117 100%);
          padding: 20px;
          position: relative;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        /* Background gradients from pitch */
        .gradient-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
        }

        .gradient-circle {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .gradient-circle-1 {
          background: radial-gradient(circle at 85% 85%, rgba(237, 137, 54, 0.25) 0%, rgba(0, 0, 0, 0) 40%);
          opacity: 0.6;
          animation: pulse 8s infinite alternate;
        }

        .gradient-circle-2 {
          background: radial-gradient(circle at 90% 90%, rgba(237, 137, 54, 0.15) 0%, rgba(0, 0, 0, 0) 50%);
          opacity: 0.4;
          animation: pulse 12s infinite alternate-reverse;
        }

        /* Floating exercises */
        .floating-exercises {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 10;
        }

        .exercise {
          position: absolute;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.6);
          text-shadow: 0 0 10px rgba(237, 137, 54, 0.7);
          animation: float 20s infinite ease-in-out;
        }

        .exercise-1 {
          top: 15%;
          left: 15%;
          font-size: 18px;
          transform: rotate(-12deg);
          animation-delay: 0s;
        }

        .exercise-2 {
          top: 25%;
          right: 15%;
          font-size: 16px;
          transform: rotate(8deg);
          animation-delay: -3s;
        }

        .exercise-3 {
          bottom: 15%;
          left: 10%;
          font-size: 14px;
          transform: rotate(-5deg);
          animation-delay: -6s;
        }

        .exercise-4 {
          bottom: 25%;
          right: 10%;
          font-size: 12px;
          transform: rotate(6deg);
          animation-delay: -9s;
        }

        .exercise-5 {
          top: 60%;
          left: 5%;
          font-size: 15px;
          transform: rotate(-8deg);
          animation-delay: -12s;
        }

        .exercise-6 {
          top: 70%;
          right: 20%;
          font-size: 13px;
          transform: rotate(4deg);
          animation-delay: -15s;
        }

        .exercise-7 {
          top: 35%;
          left: 8%;
          font-size: 17px;
          transform: rotate(-10deg);
          animation-delay: -18s;
        }

        .exercise-8 {
          top: 80%;
          left: 25%;
          font-size: 14px;
          transform: rotate(7deg);
          animation-delay: -21s;
        }

        .exercise-9 {
          top: 45%;
          right: 12%;
          font-size: 16px;
          transform: rotate(-6deg);
          animation-delay: -24s;
        }

        .exercise-10 {
          bottom: 35%;
          left: 18%;
          font-size: 15px;
          transform: rotate(9deg);
          animation-delay: -27s;
        }

        .exercise-11 {
          top: 20%;
          left: 40%;
          font-size: 13px;
          transform: rotate(-4deg);
          animation-delay: -30s;
        }

        .exercise-12 {
          bottom: 40%;
          right: 25%;
          font-size: 14px;
          transform: rotate(5deg);
          animation-delay: -33s;
        }

        .exercise-13 {
          top: 55%;
          right: 5%;
          font-size: 12px;
          transform: rotate(-7deg);
          animation-delay: -36s;
        }

        .exercise-14 {
          bottom: 60%;
          left: 12%;
          font-size: 16px;
          transform: rotate(8deg);
          animation-delay: -39s;
        }

        .exercise-15 {
          top: 40%;
          left: 35%;
          font-size: 15px;
          transform: rotate(-9deg);
          animation-delay: -42s;
        }

        .exercise-16 {
          bottom: 20%;
          right: 35%;
          font-size: 13px;
          transform: rotate(6deg);
          animation-delay: -45s;
        }

        .exercise-17 {
          top: 65%;
          left: 45%;
          font-size: 14px;
          transform: rotate(-3deg);
          animation-delay: -48s;
        }

        .exercise-18 {
          bottom: 50%;
          right: 8%;
          font-size: 12px;
          transform: rotate(4deg);
          animation-delay: -51s;
        }

        .exercise-19 {
          top: 30%;
          left: 60%;
          font-size: 16px;
          transform: rotate(-11deg);
          animation-delay: -54s;
        }

        .exercise-20 {
          bottom: 30%;
          left: 40%;
          font-size: 15px;
          transform: rotate(7deg);
          animation-delay: -57s;
        }

        .exercise-21 {
          top: 50%;
          right: 30%;
          font-size: 13px;
          transform: rotate(-5deg);
          animation-delay: -60s;
        }

        .exercise-22 {
          bottom: 45%;
          left: 30%;
          font-size: 17px;
          transform: rotate(9deg);
          animation-delay: -63s;
        }

        .exercise-23 {
          top: 75%;
          right: 40%;
          font-size: 12px;
          transform: rotate(-8deg);
          animation-delay: -66s;
        }

        .exercise-24 {
          top: 85%;
          left: 50%;
          font-size: 14px;
          transform: rotate(3deg);
          animation-delay: -69s;
        }

        .exercise-25 {
          bottom: 70%;
          right: 15%;
          font-size: 16px;
          transform: rotate(-6deg);
          animation-delay: -72s;
        }

        .exercise-26 {
          top: 10%;
          right: 30%;
          font-size: 15px;
          transform: rotate(10deg);
          animation-delay: -75s;
        }

        .exercise-27 {
          bottom: 10%;
          left: 55%;
          font-size: 13px;
          transform: rotate(-4deg);
          animation-delay: -78s;
        }

        .exercise-28 {
          top: 90%;
          right: 50%;
          font-size: 14px;
          transform: rotate(8deg);
          animation-delay: -81s;
        }

        .exercise-29 {
          bottom: 80%;
          left: 35%;
          font-size: 12px;
          transform: rotate(-7deg);
          animation-delay: -84s;
        }

        .exercise-30 {
          top: 5%;
          left: 70%;
          font-size: 16px;
          transform: rotate(5deg);
          animation-delay: -87s;
        }

        /* Fire particles */
        .fire-container {
          position: absolute;
          width: 100%;
          height: 100%;
          overflow: hidden;
          opacity: 0.3;
          z-index: 20;
        }

        .fire-particle {
          position: absolute;
          border-radius: 50%;
          background: linear-gradient(45deg, #ff6600, #ff9900);
          bottom: 0;
          opacity: 0.8;
          animation: rise linear infinite;
        }

        /* Pulsing rings - bigger and more prominent */
        .pulse-ring-container {
          position: absolute;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 5;
        }

        .pulse-ring {
          position: absolute;
          border: 3px solid rgba(237, 137, 54, 0.6);
          border-radius: 50%;
          opacity: 0;
        }

        .ring-1 {
          width: 400px;
          height: 400px;
          animation: pulseRing 4s infinite ease-out;
        }

        .ring-2 {
          width: 400px;
          height: 400px;
          animation: pulseRing 4s infinite ease-out;
          animation-delay: 1.3s;
        }

        .ring-3 {
          width: 400px;
          height: 400px;
          animation: pulseRing 4s infinite ease-out;
          animation-delay: 2.6s;
        }

        .login-card {
          background: rgba(26, 32, 44, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 60px 50px;
          width: 100%;
          max-width: 480px;
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(237, 137, 54, 0.3);
          position: relative;
          z-index: 30;
          animation: slideUp 0.8s ease-out;
        }

        /* Flash effect above form */
        .flash-container {
          position: absolute;
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
          width: 120%;
          height: 40px;
          overflow: hidden;
        }

        .flash-effect {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(237, 137, 54, 0.6), transparent);
          animation: flash 3s infinite ease-in-out;
        }

        .flash-delay {
          animation-delay: 1.5s;
        }

        .login-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .logo-container {
          position: relative;
          display: inline-block;
          margin-bottom: 30px;
        }

        .logo-icon {
          width: 120px;
          height: 120px;
          background: linear-gradient(135deg, #ed8936, #f6ad55);
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 64px;
          color: white;
          box-shadow: 0 15px 40px rgba(237, 137, 54, 0.5);
          animation: logoPulse 2s ease-in-out infinite;
          position: relative;
          z-index: 2;
        }

        .logo-pulse {
          position: absolute;
          top: -4px;
          left: -4px;
          right: -4px;
          bottom: -4px;
          border: 2px solid rgba(237, 137, 54, 0.3);
          border-radius: 28px;
          animation: pulse 2s ease-in-out infinite;
        }

        .login-title {
          font-size: 36px;
          font-weight: 800;
          background: linear-gradient(90deg, #ed8936, #f6ad55);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0 0 10px 0;
          letter-spacing: 2px;
          text-shadow: 0 0 30px rgba(237, 137, 54, 0.4);
          animation: titleGlow 3s infinite alternate;
        }

        .login-subtitle {
          font-size: 16px;
          color: #a0aec0;
          margin: 0 0 10px 0;
          font-weight: 500;
        }

        .login-tagline {
          font-size: 14px;
          color: #718096;
          margin: 0;
          font-style: italic;
          font-weight: 500;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(245, 101, 101, 0.1);
          border: 1px solid rgba(245, 101, 101, 0.3);
          color: #fed7d7;
          padding: 15px 20px;
          border-radius: 10px;
          margin-bottom: 25px;
          font-size: 14px;
          animation: shake 0.5s ease-in-out;
        }

        .login-form {
          margin-bottom: 35px;
        }

        .input-group {
          margin-bottom: 25px;
        }

        .input-label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #a0aec0;
          margin-bottom: 8px;
        }

        .input-container {
          position: relative;
        }

        .login-input {
          width: 100%;
          padding: 18px 22px;
          border: 2px solid rgba(160, 174, 192, 0.2);
          border-radius: 12px;
          font-size: 16px;
          background: rgba(74, 85, 104, 0.3);
          color: white;
          transition: all 0.3s ease;
          outline: none;
          font-weight: 500;
          box-sizing: border-box;
        }

        .login-input:focus {
          border-color: #ed8936;
          background: rgba(74, 85, 104, 0.5);
          box-shadow: 0 0 25px rgba(237, 137, 54, 0.3);
          transform: translateY(-2px);
        }

        .login-input::placeholder {
          color: #a0aec0;
          font-weight: 400;
        }

        .login-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .input-glow {
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #ed8936, #f6ad55);
          transition: all 0.3s ease;
          transform: translateX(-50%);
        }

        .login-input:focus + .input-glow {
          width: 100%;
        }

        .login-button {
          width: 100%;
          padding: 18px;
          background: linear-gradient(135deg, #ed8936 0%, #f6ad55 100%);
          border: none;
          border-radius: 12px;
          color: white;
          font-size: 18px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 10px 30px rgba(237, 137, 54, 0.4);
          position: relative;
          overflow: hidden;
        }

        .login-button:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 15px 40px rgba(237, 137, 54, 0.5);
        }

        .login-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .button-content, .loading-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }

        .loading-spinner {
          width: 22px;
          height: 22px;
          border: 2px solid transparent;
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .login-footer {
          text-align: center;
        }

        .security-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #718096;
          font-size: 14px;
          font-weight: 500;
          font-style: italic;
        }

        /* Animations */
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(var(--rotation)); }
          25% { transform: translate(15px, -15px) rotate(var(--rotation)); }
          50% { transform: translate(5px, 20px) rotate(var(--rotation)); }
          75% { transform: translate(-15px, -10px) rotate(var(--rotation)); }
        }

        @keyframes rise {
          0% { transform: translateY(0) scale(1); opacity: 0.8; }
          100% { transform: translateY(-1000px) scale(0); opacity: 0; }
        }

        @keyframes pulseRing {
          0% { transform: scale(0.2); opacity: 0.8; }
          100% { transform: scale(4.5); opacity: 0; }
        }

        @keyframes logoPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 15px 40px rgba(237, 137, 54, 0.5); }
          50% { transform: scale(1.05); box-shadow: 0 20px 50px rgba(237, 137, 54, 0.7); }
        }

        @keyframes titleGlow {
          0% { text-shadow: 0 0 10px rgba(237, 137, 54, 0.4); }
          100% { text-shadow: 0 0 30px rgba(237, 137, 54, 0.7), 0 0 60px rgba(237, 137, 54, 0.3); }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes flash {
          0%, 100% { left: -100%; }
          50% { left: 100%; }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Responsive design */
        @media (max-width: 480px) {
          .login-card {
            padding: 40px 30px;
            margin: 20px;
          }

          .login-title {
            font-size: 28px;
          }

          .logo-icon {
            width: 80px;
            height: 80px;
            font-size: 48px;
          }
        }
      `}</style>
    </div>
  );
}

export default Login;