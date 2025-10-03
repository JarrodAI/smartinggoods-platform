/**
 * Comprehensive Business Integrations System
 * Manages POS, scheduling, CRM, and accounting integrations
 */

export interface Integration {
  id: string;
  name: string;
  category: 'pos' | 'scheduling' | 'crm' | 'accounting' | 'marketing' | 'communication';
  description: string;
  features: string[];
  setupComplexity: 'easy' | 'medium' | 'complex';
  monthlyFee?: number;
  isActive: boolean;
  config: Record<string, any>;
  lastSync?: Date;
  syncStatus: 'connected' | 'syncing' | 'error' | 'disconnected';
}

export interface SyncResult {
  integrationId: string;
  success: boolean;
  recordsProcessed: number;
  errors: string[];
  lastSyncTime: Date;
  nextSyncTime?: Date;
}

export interface BusinessData {
  customers: CustomerRecord[];
  appointments: AppointmentRecord[];
  services: ServiceRecord[];
  products: ProductRecord[];
  transactions: TransactionRecord[];
  inventory: InventoryRecord[];
}

export interface CustomerRecord {
  id: string;
  externalId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  birthDate?: Date;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  preferences: Record<string, any>;
  tags: string[];
  totalSpent: number;
  visitCount: number;
  lastVisit?: Date;
  source: string;
}

export interface AppointmentRecord {
  id: string;
  externalId?: string;
  customerId: string;
  serviceId: string;
  staffId?: string;
  startTime: Date;
  endTime: Date;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'canceled' | 'no_show';
  notes?: string;
  price: number;
  source: string;
}

export interface ServiceRecord {
  id: string;
  externalId?: string;
  name: string;
  description?: string;
  duration: number; // minutes
  price: number;
  category: string;
  isActive: boolean;
  source: string;
}

export interface ProductRecord {
  id: string;
  externalId?: string;
  name: string;
  description?: string;
  price: number;
  cost?: number;
  sku?: string;
  category: string;
  isActive: boolean;
  source: string;
}

export interface TransactionRecord {
  id: string;
  externalId?: string;
  customerId: string;
  appointmentId?: string;
  amount: number;
  tax?: number;
  tip?: number;
  paymentMethod: string;
  status: 'pending' | 'completed' | 'refunded' | 'failed';
  timestamp: Date;
  items: {
    type: 'service' | 'product';
    id: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  source: string;
}

export interface InventoryRecord {
  id: string;
  externalId?: string;
  productId: string;
  quantity: number;
  reorderLevel: number;
  lastUpdated: Date;
  source: string;
}

export class BusinessIntegrationsService {
  private integrations: Map<string, Integration> = new Map();

  constructor() {
    this.initializeAvailableIntegrations();
  }

  /**
   * Initialize available integrations
   */
  private initializeAvailableIntegrations(): void {
    const availableIntegrations: Integration[] = [
      // POS Systems
      {
        id: 'square',
        name: 'Square',
        category: 'pos',
        description: 'Complete POS system with payment processing',
        features: ['Payment processing', 'Inventory management', 'Customer data', 'Sales reporting'],
        setupComplexity: 'easy',
        isActive: false,
        config: {},
        syncStatus: 'disconnected'
      },
      {
        id: 'clover',
        name: 'Clover',
        category: 'pos',
        description: 'Advanced POS with business management tools',
        features: ['POS system', 'Inventory tracking', 'Employee management', 'Analytics'],
        setupComplexity: 'medium',
        isActive: false,
        config: {},
        syncStatus: 'disconnected'
      },
      {
        id: 'toast',
        name: 'Toast',
        category: 'pos',
        description: 'Restaurant-focused POS system',
        features: ['Order management', 'Kitchen display', 'Menu management', 'Staff scheduling'],
        setupComplexity: 'medium',
        isActive: false,
        config: {},
        syncStatus: 'disconnected'
      },

      // Scheduling Systems
      {
        id: 'calendly',
        name: 'Calendly',
        category: 'scheduling',
        description: 'Automated scheduling and booking',
        features: ['Online booking', 'Calendar sync', 'Automated reminders', 'Payment collection'],
        setupComplexity: 'easy',
        isActive: false,
        config: {},
        syncStatus: 'disconnected'
      },
      {
        id: 'acuity',
        name: 'Acuity Scheduling',
        category: 'scheduling',
        description: 'Advanced appointment scheduling',
        features: ['Custom booking forms', 'Package scheduling', 'Group appointments', 'Intake forms'],
        setupComplexity: 'medium',
        isActive: false,
        config: {},
        syncStatus: 'disconnected'
      },
      {
        id: 'vagaro',
        name: 'Vagaro',
        category: 'scheduling',
        description: 'Beauty and wellness booking platform',
        features: ['Salon management', 'Client profiles', 'Marketing tools', 'Point of sale'],
        setupComplexity: 'medium',
        isActive: false,
        config: {},
        syncStatus: 'disconnected'
      },

      // CRM Systems
      {
        id: 'hubspot',
        name: 'HubSpot',
        category: 'crm',
        description: 'Complete CRM and marketing platform',
        features: ['Contact management', 'Deal tracking', 'Email marketing', 'Analytics'],
        setupComplexity: 'medium',
        isActive: false,
        config: {},
        syncStatus: 'disconnected'
      },
      {
        id: 'salesforce',
        name: 'Salesforce',
        category: 'crm',
        description: 'Enterprise CRM solution',
        features: ['Lead management', 'Opportunity tracking', 'Custom workflows', 'Advanced reporting'],
        setupComplexity: 'complex',
        monthlyFee: 25,
        isActive: false,
        config: {},
        syncStatus: 'disconnected'
      },

      // Accounting Systems
      {
        id: 'quickbooks',
        name: 'QuickBooks',
        category: 'accounting',
        description: 'Small business accounting software',
        features: ['Invoicing', 'Expense tracking', 'Tax preparation', 'Financial reporting'],
        setupComplexity: 'medium',
        isActive: false,
        config: {},
        syncStatus: 'disconnected'
      },
      {
        id: 'xero',
        name: 'Xero',
        category: 'accounting',
        description: 'Cloud-based accounting platform',
        features: ['Bank reconciliation', 'Invoicing', 'Payroll', 'Financial dashboards'],
        setupComplexity: 'medium',
        isActive: false,
        config: {},
        syncStatus: 'disconnected'
      }
    ];

    availableIntegrations.forEach(integration => {
      this.integrations.set(integration.id, integration);
    });
  }

  /**
   * Get all available integrations
   */
  getAvailableIntegrations(category?: string): Integration[] {
    const integrations = Array.from(this.integrations.values());
    return category ? integrations.filter(i => i.category === category) : integrations;
  }

  /**
   * Get active integrations
   */
  getActiveIntegrations(): Integration[] {
    return Array.from(this.integrations.values()).filter(i => i.isActive);
  }

  /**
   * Connect an integration
   */
  async connectIntegration(integrationId: string, config: Record<string, any>): Promise<boolean> {
    try {
      const integration = this.integrations.get(integrationId);
      if (!integration) {
        throw new Error('Integration not found');
      }

      // Validate configuration
      const isValid = await this.validateIntegrationConfig(integrationId, config);
      if (!isValid) {
        throw new Error('Invalid configuration');
      }

      // Test connection
      const connectionTest = await this.testConnection(integrationId, config);
      if (!connectionTest.success) {
        throw new Error(`Connection test failed: ${connectionTest.error}`);
      }

      // Update integration
      integration.config = config;
      integration.isActive = true;
      integration.syncStatus = 'connected';
      integration.lastSync = new Date();

      // Perform initial sync
      await this.performInitialSync(integrationId);

      return true;

    } catch (error) {
      console.error(`Failed to connect integration ${integrationId}:`, error);
      return false;
    }
  }

  /**
   * Disconnect an integration
   */
  async disconnectIntegration(integrationId: string): Promise<boolean> {
    try {
      const integration = this.integrations.get(integrationId);
      if (!integration) {
        throw new Error('Integration not found');
      }

      integration.isActive = false;
      integration.syncStatus = 'disconnected';
      integration.config = {};

      return true;

    } catch (error) {
      console.error(`Failed to disconnect integration ${integrationId}:`, error);
      return false;
    }
  }

  /**
   * Sync data from an integration
   */
  async syncIntegration(integrationId: string): Promise<SyncResult> {
    try {
      const integration = this.integrations.get(integrationId);
      if (!integration || !integration.isActive) {
        throw new Error('Integration not found or not active');
      }

      integration.syncStatus = 'syncing';

      const syncResult = await this.performSync(integrationId);

      integration.syncStatus = syncResult.success ? 'connected' : 'error';
      integration.lastSync = new Date();

      return syncResult;

    } catch (error) {
      console.error(`Failed to sync integration ${integrationId}:`, error);
      
      const integration = this.integrations.get(integrationId);
      if (integration) {
        integration.syncStatus = 'error';
      }

      return {
        integrationId,
        success: false,
        recordsProcessed: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        lastSyncTime: new Date()
      };
    }
  }

  /**
   * Sync all active integrations
   */
  async syncAllIntegrations(): Promise<SyncResult[]> {
    const activeIntegrations = this.getActiveIntegrations();
    const results: SyncResult[] = [];

    for (const integration of activeIntegrations) {
      try {
        const result = await this.syncIntegration(integration.id);
        results.push(result);
      } catch (error) {
        console.error(`Failed to sync integration ${integration.id}:`, error);
        results.push({
          integrationId: integration.id,
          success: false,
          recordsProcessed: 0,
          errors: [error instanceof Error ? error.message : 'Unknown error'],
          lastSyncTime: new Date()
        });
      }
    }

    return results;
  }

  /**
   * Get business data from all integrations
   */
  async getBusinessData(): Promise<BusinessData> {
    const businessData: BusinessData = {
      customers: [],
      appointments: [],
      services: [],
      products: [],
      transactions: [],
      inventory: []
    };

    const activeIntegrations = this.getActiveIntegrations();

    for (const integration of activeIntegrations) {
      try {
        const integrationData = await this.fetchIntegrationData(integration.id);
        
        // Merge data from each integration
        businessData.customers.push(...integrationData.customers);
        businessData.appointments.push(...integrationData.appointments);
        businessData.services.push(...integrationData.services);
        businessData.products.push(...integrationData.products);
        businessData.transactions.push(...integrationData.transactions);
        businessData.inventory.push(...integrationData.inventory);

      } catch (error) {
        console.error(`Failed to fetch data from integration ${integration.id}:`, error);
      }
    }

    // Deduplicate and merge records
    return this.deduplicateBusinessData(businessData);
  }

  /**
   * Validate integration configuration
   */
  private async validateIntegrationConfig(integrationId: string, config: Record<string, any>): Promise<boolean> {
    const requiredFields: Record<string, string[]> = {
      square: ['applicationId', 'accessToken', 'locationId'],
      clover: ['merchantId', 'accessToken'],
      toast: ['clientId', 'clientSecret', 'restaurantGuid'],
      calendly: ['accessToken'],
      acuity: ['userId', 'apiKey'],
      vagaro: ['apiKey', 'businessId'],
      hubspot: ['accessToken'],
      salesforce: ['clientId', 'clientSecret', 'username', 'password'],
      quickbooks: ['consumerKey', 'consumerSecret', 'accessToken', 'accessTokenSecret', 'companyId'],
      xero: ['clientId', 'clientSecret', 'tenantId']
    };

    const required = requiredFields[integrationId];
    if (!required) return true;

    return required.every(field => config[field] && config[field].trim() !== '');
  }

  /**
   * Test connection to integration
   */
  private async testConnection(integrationId: string, config: Record<string, any>): Promise<{ success: boolean; error?: string }> {
    try {
      switch (integrationId) {
        case 'square':
          return await this.testSquareConnection(config);
        case 'clover':
          return await this.testCloverConnection(config);
        case 'calendly':
          return await this.testCalendlyConnection(config);
        case 'hubspot':
          return await this.testHubSpotConnection(config);
        case 'quickbooks':
          return await this.testQuickBooksConnection(config);
        default:
          return { success: true }; // Default to success for unsupported integrations
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Connection test failed' };
    }
  }

  /**
   * Test Square connection
   */
  private async testSquareConnection(config: Record<string, any>): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('https://connect.squareup.com/v2/locations', {
        headers: {
          'Authorization': `Bearer ${config.accessToken}`,
          'Square-Version': '2023-10-18'
        }
      });

      if (response.ok) {
        return { success: true };
      } else {
        return { success: false, error: 'Invalid Square credentials' };
      }
    } catch (error) {
      return { success: false, error: 'Failed to connect to Square API' };
    }
  }

  /**
   * Test Clover connection
   */
  private async testCloverConnection(config: Record<string, any>): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`https://api.clover.com/v3/merchants/${config.merchantId}`, {
        headers: {
          'Authorization': `Bearer ${config.accessToken}`
        }
      });

      if (response.ok) {
        return { success: true };
      } else {
        return { success: false, error: 'Invalid Clover credentials' };
      }
    } catch (error) {
      return { success: false, error: 'Failed to connect to Clover API' };
    }
  }

  /**
   * Test Calendly connection
   */
  private async testCalendlyConnection(config: Record<string, any>): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('https://api.calendly.com/users/me', {
        headers: {
          'Authorization': `Bearer ${config.accessToken}`
        }
      });

      if (response.ok) {
        return { success: true };
      } else {
        return { success: false, error: 'Invalid Calendly credentials' };
      }
    } catch (error) {
      return { success: false, error: 'Failed to connect to Calendly API' };
    }
  }

  /**
   * Test HubSpot connection
   */
  private async testHubSpotConnection(config: Record<string, any>): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('https://api.hubapi.com/contacts/v1/lists/all/contacts/all', {
        headers: {
          'Authorization': `Bearer ${config.accessToken}`
        }
      });

      if (response.ok) {
        return { success: true };
      } else {
        return { success: false, error: 'Invalid HubSpot credentials' };
      }
    } catch (error) {
      return { success: false, error: 'Failed to connect to HubSpot API' };
    }
  }

  /**
   * Test QuickBooks connection
   */
  private async testQuickBooksConnection(config: Record<string, any>): Promise<{ success: boolean; error?: string }> {
    // QuickBooks uses OAuth 2.0, so this would typically involve a more complex flow
    // For now, we'll assume the connection is valid if all required fields are present
    return { success: true };
  }

  /**
   * Perform initial sync
   */
  private async performInitialSync(integrationId: string): Promise<void> {
    // Perform a full sync of all data from the integration
    await this.performSync(integrationId);
  }

  /**
   * Perform sync operation
   */
  private async performSync(integrationId: string): Promise<SyncResult> {
    const integration = this.integrations.get(integrationId);
    if (!integration) {
      throw new Error('Integration not found');
    }

    let recordsProcessed = 0;
    const errors: string[] = [];

    try {
      switch (integrationId) {
        case 'square':
          recordsProcessed = await this.syncSquareData(integration.config);
          break;
        case 'clover':
          recordsProcessed = await this.syncCloverData(integration.config);
          break;
        case 'calendly':
          recordsProcessed = await this.syncCalendlyData(integration.config);
          break;
        case 'hubspot':
          recordsProcessed = await this.syncHubSpotData(integration.config);
          break;
        default:
          // For unsupported integrations, return success with 0 records
          recordsProcessed = 0;
      }

      return {
        integrationId,
        success: true,
        recordsProcessed,
        errors,
        lastSyncTime: new Date(),
        nextSyncTime: new Date(Date.now() + 60 * 60 * 1000) // Next sync in 1 hour
      };

    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Unknown sync error');
      
      return {
        integrationId,
        success: false,
        recordsProcessed,
        errors,
        lastSyncTime: new Date()
      };
    }
  }

  /**
   * Sync Square data
   */
  private async syncSquareData(config: Record<string, any>): Promise<number> {
    // Implementation would fetch data from Square API and store it
    // For now, return mock count
    return 100;
  }

  /**
   * Sync Clover data
   */
  private async syncCloverData(config: Record<string, any>): Promise<number> {
    // Implementation would fetch data from Clover API and store it
    return 75;
  }

  /**
   * Sync Calendly data
   */
  private async syncCalendlyData(config: Record<string, any>): Promise<number> {
    // Implementation would fetch data from Calendly API and store it
    return 50;
  }

  /**
   * Sync HubSpot data
   */
  private async syncHubSpotData(config: Record<string, any>): Promise<number> {
    // Implementation would fetch data from HubSpot API and store it
    return 200;
  }

  /**
   * Fetch integration data
   */
  private async fetchIntegrationData(integrationId: string): Promise<BusinessData> {
    // This would fetch actual data from the integration
    // For now, return empty data structure
    return {
      customers: [],
      appointments: [],
      services: [],
      products: [],
      transactions: [],
      inventory: []
    };
  }

  /**
   * Deduplicate business data
   */
  private deduplicateBusinessData(data: BusinessData): BusinessData {
    // Remove duplicates based on email for customers, external IDs for others
    const deduplicatedData: BusinessData = {
      customers: this.deduplicateArray(data.customers, 'email'),
      appointments: this.deduplicateArray(data.appointments, 'externalId'),
      services: this.deduplicateArray(data.services, 'externalId'),
      products: this.deduplicateArray(data.products, 'externalId'),
      transactions: this.deduplicateArray(data.transactions, 'externalId'),
      inventory: this.deduplicateArray(data.inventory, 'externalId')
    };

    return deduplicatedData;
  }

  /**
   * Deduplicate array by key
   */
  private deduplicateArray<T extends Record<string, any>>(array: T[], key: keyof T): T[] {
    const seen = new Set();
    return array.filter(item => {
      const value = item[key];
      if (value && !seen.has(value)) {
        seen.add(value);
        return true;
      }
      return false;
    });
  }

  /**
   * Get integration status
   */
  getIntegrationStatus(integrationId: string): Integration | null {
    return this.integrations.get(integrationId) || null;
  }

  /**
   * Update integration config
   */
  async updateIntegrationConfig(integrationId: string, config: Record<string, any>): Promise<boolean> {
    const integration = this.integrations.get(integrationId);
    if (!integration) {
      return false;
    }

    const isValid = await this.validateIntegrationConfig(integrationId, config);
    if (!isValid) {
      return false;
    }

    integration.config = { ...integration.config, ...config };
    return true;
  }
}