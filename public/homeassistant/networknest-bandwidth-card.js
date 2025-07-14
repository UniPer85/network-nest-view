class NetworkNestBandwidthCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.chart = null;
  }

  setConfig(config) {
    if (!config.download_entity || !config.upload_entity) {
      throw new Error('Please define both download_entity and upload_entity');
    }
    this.config = config;
  }

  set hass(hass) {
    this._hass = hass;
    this.render();
  }

  render() {
    if (!this._hass || !this.config) return;

    const downloadEntity = this._hass.states[this.config.download_entity];
    const uploadEntity = this._hass.states[this.config.upload_entity];
    
    if (!downloadEntity || !uploadEntity) {
      this.shadowRoot.innerHTML = `
        <ha-card>
          <div class="card-content">
            <div class="error">Entities not found</div>
          </div>
        </ha-card>
      `;
      return;
    }

    const downloadSpeed = parseFloat(downloadEntity.state) || 0;
    const uploadSpeed = parseFloat(uploadEntity.state) || 0;
    const totalSpeed = downloadSpeed + uploadSpeed;
    
    const maxSpeed = this.config.max_speed || 1000; // Default 1 Gbps
    const downloadPercent = (downloadSpeed / maxSpeed) * 100;
    const uploadPercent = (uploadSpeed / maxSpeed) * 100;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }
        ha-card {
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .bandwidth-header {
          text-align: center;
          margin-bottom: 24px;
        }
        .bandwidth-header h2 {
          margin: 0 0 8px 0;
          font-size: 24px;
          font-weight: 600;
        }
        .total-speed {
          font-size: 32px;
          font-weight: 700;
          margin: 8px 0;
        }
        .speed-unit {
          font-size: 16px;
          opacity: 0.8;
        }
        .bandwidth-bars {
          margin: 24px 0;
        }
        .speed-row {
          display: flex;
          align-items: center;
          margin-bottom: 16px;
        }
        .speed-icon {
          width: 24px;
          height: 24px;
          margin-right: 12px;
          font-size: 18px;
        }
        .speed-info {
          flex: 1;
          margin-right: 12px;
        }
        .speed-label {
          font-size: 14px;
          opacity: 0.9;
          margin-bottom: 4px;
        }
        .speed-bar {
          width: 100%;
          height: 8px;
          background: rgba(255,255,255,0.2);
          border-radius: 4px;
          overflow: hidden;
        }
        .speed-fill {
          height: 100%;
          transition: width 0.3s ease;
          border-radius: 4px;
        }
        .download-fill {
          background: linear-gradient(90deg, #4CAF50, #8BC34A);
        }
        .upload-fill {
          background: linear-gradient(90deg, #FF9800, #FFC107);
        }
        .speed-value {
          font-size: 16px;
          font-weight: 600;
          min-width: 80px;
          text-align: right;
        }
        .chart-container {
          height: 120px;
          margin: 16px 0;
          background: rgba(255,255,255,0.1);
          border-radius: 8px;
          position: relative;
          overflow: hidden;
        }
        .error {
          color: #ffcccb;
          text-align: center;
          padding: 20px;
        }
      </style>
      <ha-card>
        <div class="bandwidth-header">
          <h2>Network Bandwidth</h2>
          <div class="total-speed">
            ${totalSpeed.toFixed(1)} <span class="speed-unit">Mbps</span>
          </div>
        </div>
        
        <div class="bandwidth-bars">
          <div class="speed-row">
            <div class="speed-icon">⬇️</div>
            <div class="speed-info">
              <div class="speed-label">Download</div>
              <div class="speed-bar">
                <div class="speed-fill download-fill" style="width: ${Math.min(downloadPercent, 100)}%"></div>
              </div>
            </div>
            <div class="speed-value">${downloadSpeed.toFixed(1)} Mbps</div>
          </div>
          
          <div class="speed-row">
            <div class="speed-icon">⬆️</div>
            <div class="speed-info">
              <div class="speed-label">Upload</div>
              <div class="speed-bar">
                <div class="speed-fill upload-fill" style="width: ${Math.min(uploadPercent, 100)}%"></div>
              </div>
            </div>
            <div class="speed-value">${uploadSpeed.toFixed(1)} Mbps</div>
          </div>
        </div>
        
        <div class="chart-container">
          <canvas id="bandwidthChart" width="100%" height="120"></canvas>
        </div>
      </ha-card>
    `;
    
    this.initChart();
  }

  initChart() {
    // Simple canvas-based chart for bandwidth history
    const canvas = this.shadowRoot.querySelector('#bandwidthChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = 120;
    
    // Generate sample data for demo
    const dataPoints = 30;
    const downloadData = [];
    const uploadData = [];
    
    for (let i = 0; i < dataPoints; i++) {
      downloadData.push(Math.random() * 100 + 20);
      uploadData.push(Math.random() * 40 + 10);
    }
    
    this.drawChart(ctx, canvas.width, canvas.height, downloadData, uploadData);
  }

  drawChart(ctx, width, height, downloadData, uploadData) {
    ctx.clearRect(0, 0, width, height);
    
    const maxValue = Math.max(...downloadData, ...uploadData);
    const stepX = width / (downloadData.length - 1);
    
    // Draw download line
    ctx.strokeStyle = '#4CAF50';
    ctx.lineWidth = 2;
    ctx.beginPath();
    downloadData.forEach((value, index) => {
      const x = index * stepX;
      const y = height - (value / maxValue) * height;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    
    // Draw upload line
    ctx.strokeStyle = '#FF9800';
    ctx.lineWidth = 2;
    ctx.beginPath();
    uploadData.forEach((value, index) => {
      const x = index * stepX;
      const y = height - (value / maxValue) * height;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }

  getCardSize() {
    return 4;
  }

  static getConfigElement() {
    return document.createElement('networknest-bandwidth-card-editor');
  }

  static getStubConfig() {
    return { 
      download_entity: 'sensor.networknest_bandwidth_down',
      upload_entity: 'sensor.networknest_bandwidth_up',
      max_speed: 1000
    };
  }
}

// Card Editor
class NetworkNestBandwidthCardEditor extends HTMLElement {
  setConfig(config) {
    this.config = config;
    this.render();
  }

  render() {
    this.innerHTML = `
      <div style="padding: 16px;">
        <div style="margin-bottom: 12px;">
          <label for="download_entity">Download Entity:</label>
          <input 
            type="text" 
            id="download_entity" 
            value="${this.config?.download_entity || ''}"
            placeholder="sensor.networknest_bandwidth_down"
            style="width: 100%; padding: 8px; margin-top: 4px; border: 1px solid #ddd; border-radius: 4px;"
          />
        </div>
        <div style="margin-bottom: 12px;">
          <label for="upload_entity">Upload Entity:</label>
          <input 
            type="text" 
            id="upload_entity" 
            value="${this.config?.upload_entity || ''}"
            placeholder="sensor.networknest_bandwidth_up"
            style="width: 100%; padding: 8px; margin-top: 4px; border: 1px solid #ddd; border-radius: 4px;"
          />
        </div>
        <div style="margin-bottom: 12px;">
          <label for="max_speed">Max Speed (Mbps):</label>
          <input 
            type="number" 
            id="max_speed" 
            value="${this.config?.max_speed || 1000}"
            placeholder="1000"
            style="width: 100%; padding: 8px; margin-top: 4px; border: 1px solid #ddd; border-radius: 4px;"
          />
        </div>
      </div>
    `;

    ['download_entity', 'upload_entity', 'max_speed'].forEach(field => {
      const input = this.querySelector(`#${field}`);
      input.addEventListener('input', (e) => {
        this.config = { 
          ...this.config, 
          [field]: field === 'max_speed' ? parseInt(e.target.value) : e.target.value 
        };
        this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this.config } }));
      });
    });
  }
}

customElements.define('networknest-bandwidth-card', NetworkNestBandwidthCard);
customElements.define('networknest-bandwidth-card-editor', NetworkNestBandwidthCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'networknest-bandwidth-card',
  name: 'NetworkNest Bandwidth Card',
  description: 'A custom card for displaying NetworkNest bandwidth usage with charts',
  preview: false,
  documentationURL: 'https://github.com/your-repo/networknest'
});