class NetworkNestOverviewCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  setConfig(config) {
    this.config = config || {};
  }

  set hass(hass) {
    this._hass = hass;
    this.render();
  }

  render() {
    if (!this._hass) return;

    // Collect NetworkNest entities
    const entities = Object.keys(this._hass.states).filter(entityId => 
      entityId.startsWith('sensor.networknest_') || 
      entityId.includes('network')
    );

    const statusEntity = entities.find(e => e.includes('status')) || entities[0];
    const deviceCountEntity = entities.find(e => e.includes('devices')) || entities[1];
    const bandwidthEntity = entities.find(e => e.includes('bandwidth')) || entities[2];
    const uptimeEntity = entities.find(e => e.includes('uptime')) || entities[3];

    const networkStatus = statusEntity ? this._hass.states[statusEntity]?.state : 'unknown';
    const deviceCount = deviceCountEntity ? this._hass.states[deviceCountEntity]?.state : '0';
    const bandwidth = bandwidthEntity ? this._hass.states[bandwidthEntity]?.state : '0';
    const uptime = uptimeEntity ? this._hass.states[uptimeEntity]?.state : '0';

    const statusColor = networkStatus === 'online' ? '#4CAF50' : '#F44336';

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }
        ha-card {
          padding: 20px;
          background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
          color: white;
          border-radius: 16px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
          position: relative;
          overflow: hidden;
        }
        .background-pattern {
          position: absolute;
          top: 0;
          right: 0;
          width: 200px;
          height: 200px;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="2"/><circle cx="50" cy="50" r="25" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/><circle cx="50" cy="50" r="10" fill="rgba(255,255,255,0.1)"/></svg>') no-repeat center;
          background-size: contain;
          opacity: 0.3;
        }
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          position: relative;
          z-index: 2;
        }
        .title {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .network-icon {
          width: 48px;
          height: 48px;
          background: rgba(255,255,255,0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }
        .title-text h2 {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
        }
        .title-text p {
          margin: 4px 0 0 0;
          font-size: 14px;
          opacity: 0.8;
        }
        .status-indicator {
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 16px;
          position: relative;
          z-index: 2;
        }
        .metric-card {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 12px;
          padding: 16px;
          text-align: center;
          transition: transform 0.2s ease, background 0.2s ease;
        }
        .metric-card:hover {
          transform: translateY(-2px);
          background: rgba(255,255,255,0.15);
        }
        .metric-icon {
          font-size: 24px;
          margin-bottom: 8px;
          display: block;
        }
        .metric-value {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 4px;
          display: block;
        }
        .metric-label {
          font-size: 12px;
          opacity: 0.8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .footer {
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid rgba(255,255,255,0.2);
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          opacity: 0.8;
          position: relative;
          z-index: 2;
        }
        .last-updated {
          display: flex;
          align-items: center;
          gap: 4px;
        }
      </style>
      <ha-card>
        <div class="background-pattern"></div>
        
        <div class="header">
          <div class="title">
            <div class="network-icon">🌐</div>
            <div class="title-text">
              <h2>NetworkNest</h2>
              <p>Network Monitoring</p>
            </div>
          </div>
          <div class="status-indicator" style="background-color: ${statusColor}">
            <div class="status-dot" style="background-color: white"></div>
            ${networkStatus}
          </div>
        </div>

        <div class="metrics-grid">
          <div class="metric-card">
            <span class="metric-icon">📱</span>
            <span class="metric-value">${deviceCount}</span>
            <span class="metric-label">Devices</span>
          </div>
          
          <div class="metric-card">
            <span class="metric-icon">⚡</span>
            <span class="metric-value">${bandwidth}</span>
            <span class="metric-label">Bandwidth</span>
          </div>
          
          <div class="metric-card">
            <span class="metric-icon">⏱️</span>
            <span class="metric-value">${uptime}%</span>
            <span class="metric-label">Uptime</span>
          </div>
          
          <div class="metric-card">
            <span class="metric-icon">🔒</span>
            <span class="metric-value">Secure</span>
            <span class="metric-label">Status</span>
          </div>
        </div>

        <div class="footer">
          <div class="last-updated">
            <span>🔄</span>
            <span>Last updated: ${new Date().toLocaleTimeString()}</span>
          </div>
          <div>NetworkNest v2.0</div>
        </div>
      </ha-card>
    `;
  }

  getCardSize() {
    return 3;
  }

  static getConfigElement() {
    return document.createElement('networknest-overview-card-editor');
  }

  static getStubConfig() {
    return {};
  }
}

// Simple editor for the overview card
class NetworkNestOverviewCardEditor extends HTMLElement {
  setConfig(config) {
    this.config = config || {};
    this.render();
  }

  render() {
    this.innerHTML = `
      <div style="padding: 16px;">
        <p style="margin: 0; color: #666; font-size: 14px;">
          This card automatically detects NetworkNest entities and displays an overview of your network status.
          No configuration required.
        </p>
      </div>
    `;
  }
}

customElements.define('networknest-overview-card', NetworkNestOverviewCard);
customElements.define('networknest-overview-card-editor', NetworkNestOverviewCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'networknest-overview-card',
  name: 'NetworkNest Overview Card',
  description: 'A comprehensive overview card for NetworkNest network monitoring',
  preview: false,
  documentationURL: 'https://github.com/your-repo/networknest'
});