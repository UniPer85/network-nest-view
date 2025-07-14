class NetworkNestBandwidthCard extends HTMLElement {
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

    // Find bandwidth-related entities
    const entities = Object.keys(this._hass.states).filter(entityId => 
      entityId.startsWith('sensor.networknest_') && 
      (entityId.includes('bandwidth') || entityId.includes('speed'))
    );

    const uploadEntity = entities.find(e => e.includes('upload')) || entities[0];
    const downloadEntity = entities.find(e => e.includes('download')) || entities[1];
    const totalEntity = entities.find(e => e.includes('total')) || entities[2];

    const uploadSpeed = uploadEntity ? this._hass.states[uploadEntity]?.state : '0';
    const downloadSpeed = downloadEntity ? this._hass.states[downloadEntity]?.state : '0';
    const totalBandwidth = totalEntity ? this._hass.states[totalEntity]?.state : '0';

    const uploadUnit = uploadEntity ? this._hass.states[uploadEntity]?.attributes?.unit_of_measurement || 'MB/s' : 'MB/s';
    const downloadUnit = downloadEntity ? this._hass.states[downloadEntity]?.attributes?.unit_of_measurement || 'MB/s' : 'MB/s';

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }
        ha-card {
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 16px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
          position: relative;
          overflow: hidden;
        }
        .background-wave {
          position: absolute;
          top: -50%;
          right: -20%;
          width: 200px;
          height: 200px;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M0,50 Q25,25 50,50 T100,50 V100 H0 Z" fill="rgba(255,255,255,0.1)"/></svg>') no-repeat center;
          background-size: contain;
          opacity: 0.3;
          animation: wave 3s ease-in-out infinite alternate;
        }
        @keyframes wave {
          0% { transform: translateY(0px); }
          100% { transform: translateY(-10px); }
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
        .bandwidth-icon {
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
          font-size: 20px;
          font-weight: 700;
        }
        .title-text p {
          margin: 4px 0 0 0;
          font-size: 14px;
          opacity: 0.8;
        }
        .bandwidth-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 20px;
          position: relative;
          z-index: 2;
        }
        .speed-card {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          transition: transform 0.2s ease, background 0.2s ease;
        }
        .speed-card:hover {
          transform: translateY(-2px);
          background: rgba(255,255,255,0.15);
        }
        .speed-icon {
          font-size: 32px;
          margin-bottom: 12px;
          display: block;
        }
        .speed-value {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 4px;
          display: block;
        }
        .speed-label {
          font-size: 14px;
          opacity: 0.8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .total-bandwidth {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 12px;
          padding: 16px;
          text-align: center;
          position: relative;
          z-index: 2;
        }
        .total-value {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 4px;
        }
        .total-label {
          font-size: 12px;
          opacity: 0.8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
      </style>
      <ha-card>
        <div class="background-wave"></div>
        
        <div class="header">
          <div class="title">
            <div class="bandwidth-icon">⚡</div>
            <div class="title-text">
              <h2>Network Bandwidth</h2>
              <p>Real-time Usage</p>
            </div>
          </div>
        </div>

        <div class="bandwidth-stats">
          <div class="speed-card">
            <span class="speed-icon">⬇️</span>
            <span class="speed-value">${downloadSpeed}</span>
            <span class="speed-label">Download ${downloadUnit}</span>
          </div>
          
          <div class="speed-card">
            <span class="speed-icon">⬆️</span>
            <span class="speed-value">${uploadSpeed}</span>
            <span class="speed-label">Upload ${uploadUnit}</span>
          </div>
        </div>

        <div class="total-bandwidth">
          <div class="total-value">${totalBandwidth} MB/s</div>
          <div class="total-label">Total Bandwidth</div>
        </div>
      </ha-card>
    `;
  }

  getCardSize() {
    return 3;
  }

  static getConfigElement() {
    return document.createElement('networknest-bandwidth-card-editor');
  }

  static getStubConfig() {
    return {};
  }
}

// Simple editor for the bandwidth card
class NetworkNestBandwidthCardEditor extends HTMLElement {
  setConfig(config) {
    this.config = config || {};
    this.render();
  }

  render() {
    this.innerHTML = `
      <div style="padding: 16px;">
        <p style="margin: 0; color: #666; font-size: 14px;">
          This card automatically detects NetworkNest bandwidth entities and displays real-time network usage.
          No configuration required.
        </p>
      </div>
    `;
  }
}

customElements.define('networknest-bandwidth-card', NetworkNestBandwidthCard);
customElements.define('networknest-bandwidth-card-editor', NetworkNestBandwidthCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'networknest-bandwidth-card',
  name: 'NetworkNest Bandwidth Card',
  description: 'A real-time bandwidth monitoring card for NetworkNest',
  preview: false,
  documentationURL: 'https://github.com/your-repo/networknest'
});