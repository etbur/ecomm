import React, { useState } from 'react';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General', icon: 'fas fa-cog' },
    { id: 'security', label: 'Security', icon: 'fas fa-shield-alt' },
    { id: 'notifications', label: 'Notifications', icon: 'fas fa-bell' },
    { id: 'integrations', label: 'Integrations', icon: 'fas fa-plug' },
    { id: 'billing', label: 'Billing', icon: 'fas fa-credit-card' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="settings-section">
            <h3>General Settings</h3>
            <div className="settings-group">
              <div className="setting-item">
                <label>Platform Name</label>
                <input type="text" defaultValue="ProjectHub" />
              </div>
              <div className="setting-item">
                <label>Platform URL</label>
                <input type="url" defaultValue="https://projecthub.com" />
              </div>
              <div className="setting-item">
                <label>Default Language</label>
                <select defaultValue="en">
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>
              <div className="setting-item">
                <label>Timezone</label>
                <select defaultValue="UTC">
                  <option value="UTC">UTC</option>
                  <option value="EST">Eastern Time</option>
                  <option value="PST">Pacific Time</option>
                  <option value="GMT">GMT</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="settings-section">
            <h3>Security Settings</h3>
            <div className="settings-group">
              <div className="setting-item">
                <label>Two-Factor Authentication</label>
                <div className="toggle-switch">
                  <input type="checkbox" id="2fa" defaultChecked />
                  <label htmlFor="2fa" className="toggle-slider"></label>
                </div>
              </div>
              <div className="setting-item">
                <label>Session Timeout (minutes)</label>
                <input type="number" defaultValue="30" min="5" max="480" />
              </div>
              <div className="setting-item">
                <label>Password Policy</label>
                <select defaultValue="strong">
                  <option value="basic">Basic (6+ characters)</option>
                  <option value="medium">Medium (8+ characters)</option>
                  <option value="strong">Strong (12+ characters, mixed)</option>
                </select>
              </div>
              <div className="setting-item">
                <label>IP Whitelist</label>
                <textarea placeholder="Enter IP addresses, one per line"></textarea>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="settings-section">
            <h3>Notification Settings</h3>
            <div className="settings-group">
              <div className="setting-item">
                <label>Email Notifications</label>
                <div className="toggle-switch">
                  <input type="checkbox" id="email-notif" defaultChecked />
                  <label htmlFor="email-notif" className="toggle-slider"></label>
                </div>
              </div>
              <div className="setting-item">
                <label>Push Notifications</label>
                <div className="toggle-switch">
                  <input type="checkbox" id="push-notif" defaultChecked />
                  <label htmlFor="push-notif" className="toggle-slider"></label>
                </div>
              </div>
              <div className="setting-item">
                <label>Weekly Reports</label>
                <div className="toggle-switch">
                  <input type="checkbox" id="weekly-reports" />
                  <label htmlFor="weekly-reports" className="toggle-slider"></label>
                </div>
              </div>
              <div className="setting-item">
                <label>Maintenance Alerts</label>
                <div className="toggle-switch">
                  <input type="checkbox" id="maintenance-alerts" defaultChecked />
                  <label htmlFor="maintenance-alerts" className="toggle-slider"></label>
                </div>
              </div>
            </div>
          </div>
        );

      case 'integrations':
        return (
          <div className="settings-section">
            <h3>Third-party Integrations</h3>
            <div className="integrations-grid">
              <div className="integration-card">
                <div className="integration-header">
                  <i className="fab fa-stripe"></i>
                  <h4>Stripe</h4>
                </div>
                <p>Payment processing integration</p>
                <button className="btn btn-sm">Configure</button>
              </div>
              <div className="integration-card">
                <div className="integration-header">
                  <i className="fab fa-mailchimp"></i>
                  <h4>Mailchimp</h4>
                </div>
                <p>Email marketing automation</p>
                <button className="btn btn-sm">Configure</button>
              </div>
              <div className="integration-card">
                <div className="integration-header">
                  <i className="fab fa-slack"></i>
                  <h4>Slack</h4>
                </div>
                <p>Team communication</p>
                <button className="btn btn-sm">Configure</button>
              </div>
              <div className="integration-card">
                <div className="integration-header">
                  <i className="fab fa-google"></i>
                  <h4>Google Analytics</h4>
                </div>
                <p>Website analytics</p>
                <button className="btn btn-sm">Configure</button>
              </div>
            </div>
          </div>
        );

      case 'billing':
        return (
          <div className="settings-section">
            <h3>Billing & Subscription</h3>
            <div className="settings-group">
              <div className="setting-item">
                <label>Current Plan</label>
                <div className="plan-info">
                  <span className="plan-name">Enterprise Plan</span>
                  <span className="plan-price">$299/month</span>
                </div>
              </div>
              <div className="setting-item">
                <label>Payment Method</label>
                <div className="payment-info">
                  <i className="fab fa-cc-visa"></i>
                  **** **** **** 4242
                  <button className="btn-link">Change</button>
                </div>
              </div>
              <div className="setting-item">
                <label>Billing Cycle</label>
                <select defaultValue="monthly">
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly (Save 20%)</option>
                </select>
              </div>
              <div className="billing-actions">
                <button className="btn btn-primary">Upgrade Plan</button>
                <button className="btn btn-secondary">View Invoice History</button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="admin-settings">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Configure your platform settings and preferences</p>
      </div>

      <div className="settings-container">
        <div className="settings-sidebar">
          <nav className="settings-nav">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`settings-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <i className={tab.icon}></i>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="settings-content">
          {renderTabContent()}
          <div className="settings-actions">
            <button className="btn btn-secondary">Cancel</button>
            <button className="btn btn-primary">Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;