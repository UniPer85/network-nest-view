class NetworkNestDeviceCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('Please define a network device entity');
    }
    this.config = config;
  }

  set hass(hass) {
    this._hass = hass;
    this.render();
  }

  render() {
    if (!this._hass || !this.config) return;

    const entity = this._hass.states[this.config.entity];
    if (!entity) {
      this.shadowRoot.innerHTML = `
        <ha-card>
          <div class="card-content">
            <div class="error">Entity not found: ${this.config.entity}</div>
          </div>
        </ha-card>
      `;
      return;
    }

    const attributes = entity.attributes;
    const deviceName = attributes.friendly_name || entity.entity_id;
    const deviceType = attributes.device_type || 'Unknown';
    const ipAddress = attributes.ip_address || 'N/A';
    const bandwidth = attributes.bandwidth || '0 MB/s';
    const status = entity.state;
    
    const statusColor = status === 'online' ? '#4CAF50' : 
                       status === 'idle' ? '#FF9800' : '#F44336';
    
    const deviceIcon = this.getDeviceIcon(deviceType);

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }
        ha-card {
          padding: 16px;
          background: linear-gradient(135deg, var(--primary-color, #03DAC6) 0%, var(--accent-color, #6200EA) 100%);
          color: white;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          transition: transform 0.2s ease;
        }
        ha-card:hover {
          transform: translateY(-2px);
        }
        .device-header {
          display: flex;
          align-items: center;
          margin-bottom: 16px;
        }
        .device-icon {
          width: 48px;
          height: 48px;
          background: rgba(255,255,255,0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
          font-size: 24px;
        }
        .device-info h3 {
          margin: 0 0 4px 0;
          font-size: 18px;
          font-weight: 600;
        }
        .device-type {
          font-size: 14px;
          opacity: 0.8;
        }
        .device-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .stat-item {
          background: rgba(255,255,255,0.1);
          padding: 12px;
          border-radius: 8px;
          text-align: center;
        }
        .stat-label {
          font-size: 12px;
          opacity: 0.8;
          margin-bottom: 4px;
        }
        .stat-value {
          font-size: 16px;
          font-weight: 600;
        }
        .status-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .error {
          color: var(--error-color, #F44336);
          text-align: center;
          padding: 20px;
        }
      </style>
      <ha-card>
        <div class="status-badge" style="background-color: ${statusColor}">
          ${status}
        </div>
        <div class="device-header">
          <div class="device-icon">${deviceIcon}</div>
          <div class="device-info">
            <h3>${deviceName}</h3>
            <div class="device-type">${deviceType}</div>
          </div>
        </div>
        <div class="device-stats">
          <div class="stat-item">
            <div class="stat-label">IP Address</div>
            <div class="stat-value">${ipAddress}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Bandwidth</div>
            <div class="stat-value">${bandwidth}</div>
          </div>
        </div>
      </ha-card>
    `;
  }

  getDeviceIcon(deviceType) {
    const icons = {
      'Computer': '💻',
      'Mobile': '📱',
      'Smart TV': '📺',
      'Gaming': '🎮',
      'Network': '🌐',
      'Tablet': '📱',
      'Smart Speaker': '🔊',
      'IoT Device': '📹',
      'Router': '📡',
      'Switch': '🔀',
      'Access Point': '📶'
    };
    return icons[deviceType] || '🔌';
  }

  getCardSize() {
    return 3;
  }

  static getConfigElement() {
    return document.createElement('networknest-device-card-editor');
  }

  static getStubConfig() {
    return { entity: 'sensor.networknest_device' };
  }
}

// Card Editor for Home Assistant UI
class NetworkNestDeviceCardEditor extends HTMLElement {
  setConfig(config) {
    this.config = config;
    this.render();
  }

  render() {
    this.innerHTML = `
      <div style="padding: 16px;">
        <div style="margin-bottom: 12px;">
          <label for="entity">Network Device Entity:</label>
          <input 
            type="text" 
            id="entity" 
            value="${this.config?.entity || ''}"
            placeholder="sensor.networknest_device"
            style="width: 100%; padding: 8px; margin-top: 4px; border: 1px solid #ddd; border-radius: 4px;"
          />
        </div>
      </div>
    `;

    const entityInput = this.querySelector('#entity');
    entityInput.addEventListener('input', (e) => {
      this.config = { ...this.config, entity: e.target.value };
      this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this.config } }));
    });
  }
}

customElements.define('networknest-device-card', NetworkNestDeviceCard);
customElements.define('networknest-device-card-editor', NetworkNestDeviceCardEditor);

// Register the card with Home Assistant
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'networknest-device-card',
  name: 'NetworkNest Device Card',
  description: 'A custom card for displaying NetworkNest device information',
  preview: false,
  documentationURL: 'https://github.com/your-repo/networknest'
});