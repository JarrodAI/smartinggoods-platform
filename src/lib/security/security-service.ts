/**
 * Security and Compliance Service
 * Handles data encryption, GDPR/CCPA compliance, audit logging, and security policies
 */

import crypto from 'crypto';
import { redisService } from '../ai/redis-service';

export interface SecurityConfig {
  encryption: {
    algorithm: string;
    keyLength: number;
    ivLength: number;
  };
  compliance: {
    gdprEnabled: boolean;
    ccpaEnabled: boolean;
    dataRetentionDays: number;
    auditLogRetentionDays: number;
  };
  authentication: {
    sessionTimeout: number;
    maxLoginAttempts: number;
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
    };
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
}

export interface AuditLog {
  id: string;
  timestamp: Date;
  userId?: string;
  businessId?: string;
  action: string;
  resource: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface DataProcessingRecord {
  id: string;
  businessId: string;
  customerId: string;
  dataType: 'personal' | 'sensitive' | 'financial' | 'health' | 'biometric';
  purpose: string;
  legalBasis: 'consent' | 'contract' | 'legal_obligation' | 'vital_interests' | 'public_task' | 'legitimate_interests';
  retention: {
    period: number; // days
    reason: string;
  };
  processing: {
    collected: Date;
    lastAccessed?: Date;
    lastModified?: Date;
    scheduledDeletion?: Date;
  };
  consent: {
    given: boolean;
    timestamp?: Date;
    withdrawn?: Date;
    method: 'explicit' | 'implicit' | 'opt_in' | 'opt_out';
  };
}

export interface SecurityIncident {
  id: string;
  type: 'data_breach' | 'unauthorized_access' | 'malware' | 'phishing' | 'ddos' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'detected' | 'investigating' | 'contained' | 'resolved';
  description: string;
  affectedData?: string[];
  affectedUsers?: string[];
  detectedAt: Date;
  resolvedAt?: Date;
  reportedToAuthorities: boolean;
  mitigationSteps: string[];
}

export class SecurityService {
  private static instance: SecurityService;
  private encryptionKey: Buffer;
  private config: SecurityConfig;
  private auditLogs: AuditLog[] = [];
  private dataProcessingRecords: Map<string, DataProcessingRecord> = new Map();
  private securityIncidents: SecurityIncident[] = [];

  public static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  constructor() {
    this.encryptionKey = this.generateEncryptionKey();
    this.config = this.getDefaultSecurityConfig();
  }

  /**
   * Initialize security service
   */
  async initialize(): Promise<void> {
    console.log('🔒 Initializing security service...');
    
    // Set up audit logging
    this.setupAuditLogging();
    
    // Initialize compliance monitoring
    this.initializeComplianceMonitoring();
    
    // Set up security monitoring
    this.setupSecurityMonitoring();
    
    console.log('✅ Security service initialized');
  }

  /**
   * Encrypt sensitive data
   */
  encryptData(data: string): { encrypted: string; iv: string } {
    const iv = crypto.randomBytes(this.config.encryption.ivLength);
    const cipher = crypto.createCipher(this.config.encryption.algorithm, this.encryptionKey);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return {
      encrypted,
      iv: iv.toString('hex')
    };
  }

  /**
   * Decrypt sensitive data
   */
  decryptData(encryptedData: string, iv: string): string {
    const decipher = crypto.createDecipher(this.config.encryption.algorithm, this.encryptionKey);
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Hash sensitive data (one-way)
   */
  hashData(data: string, salt?: string): { hash: string; salt: string } {
    const actualSalt = salt || crypto.randomBytes(32).toString('hex');
    const hash = crypto.pbkdf2Sync(data, actualSalt, 10000, 64, 'sha512').toString('hex');
    
    return { hash, salt: actualSalt };
  }

  /**
   * Verify hashed data
   */
  verifyHash(data: string, hash: string, salt: string): boolean {
    const { hash: computedHash } = this.hashData(data, salt);
    return computedHash === hash;
  }

  /**
   * Log audit event
   */
  async logAuditEvent(
    action: string,
    resource: string,
    details: Record<string, any>,
    options: {
      userId?: string;
      businessId?: string;
      ipAddress?: string;
      userAgent?: string;
      success?: boolean;
      riskLevel?: 'low' | 'medium' | 'high' | 'critical';
    } = {}
  ): Promise<void> {
    const auditLog: AuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      userId: options.userId,
      businessId: options.businessId,
      action,
      resource,
      details,
      ipAddress: options.ipAddress,
      userAgent: options.userAgent,
      success: options.success !== false,
      riskLevel: options.riskLevel || 'low'
    };

    this.auditLogs.push(auditLog);

    // Store in persistent storage
    await redisService.cacheAIResponse(
      `audit_log_${auditLog.id}`,
      auditLog,
      { prefix: 'security:audit', ttl: this.config.compliance.auditLogRetentionDays * 24 * 60 * 60 }
    );

    // Alert on high-risk events
    if (auditLog.riskLevel === 'high' || auditLog.riskLevel === 'critical') {
      await this.handleHighRiskEvent(auditLog);
    }

    console.log(`📋 Audit logged: ${action} on ${resource} (${auditLog.riskLevel})`);
  }

  /**
   * Record data processing for GDPR compliance
   */
  async recordDataProcessing(
    businessId: string,
    customerId: string,
    dataType: 'personal' | 'sensitive' | 'financial' | 'health' | 'biometric',
    purpose: string,
    legalBasis: string,
    retentionDays: number,
    consentGiven: boolean = false
  ): Promise<DataProcessingRecord> {
    const record: DataProcessingRecord = {
      id: `data_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      businessId,
      customerId,
      dataType,
      purpose,
      legalBasis: legalBasis as any,
      retention: {
        period: retentionDays,
        reason: `Business requirement for ${purpose}`
      },
      processing: {
        collected: new Date(),
        scheduledDeletion: new Date(Date.now() + retentionDays * 24 * 60 * 60 * 1000)
      },
      consent: {
        given: consentGiven,
        timestamp: consentGiven ? new Date() : undefined,
        method: consentGiven ? 'explicit' : 'opt_out'
      }
    };

    this.dataProcessingRecords.set(record.id, record);

    // Store in persistent storage
    await redisService.cacheAIResponse(
      `data_processing_${record.id}`,
      record,
      { prefix: 'security:gdpr', ttl: retentionDays * 24 * 60 * 60 }
    );

    await this.logAuditEvent(
      'data_processing_recorded',
      'customer_data',
      { dataType, purpose, legalBasis, customerId },
      { businessId, riskLevel: dataType === 'sensitive' ? 'medium' : 'low' }
    );

    return record;
  }

  /**
   * Handle data subject request (GDPR Article 15-22)
   */
  async handleDataSubjectRequest(
    customerId: string,
    requestType: 'access' | 'rectification' | 'erasure' | 'portability' | 'restriction' | 'objection',
    businessId: string
  ): Promise<{
    requestId: string;
    status: 'received' | 'processing' | 'completed' | 'rejected';
    data?: any;
    timeline: Date;
  }> {
    const requestId = `dsr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await this.logAuditEvent(
      'data_subject_request',
      'customer_data',
      { requestType, customerId, requestId },
      { businessId, riskLevel: 'medium' }
    );

    // Process request based on type
    let responseData: any = null;
    let status: 'received' | 'processing' | 'completed' | 'rejected' = 'processing';

    switch (requestType) {
      case 'access':
        responseData = await this.getCustomerData(customerId, businessId);
        status = 'completed';
        break;

      case 'erasure':
        await this.deleteCustomerData(customerId, businessId);
        status = 'completed';
        break;

      case 'portability':
        responseData = await this.exportCustomerData(customerId, businessId);
        status = 'completed';
        break;

      default:
        status = 'received';
    }

    // Timeline: 30 days for most requests, 72 hours for data breaches
    const timeline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    console.log(`📋 Data subject request processed: ${requestType} for customer ${customerId}`);

    return {
      requestId,
      status,
      data: responseData,
      timeline
    };
  }

  /**
   * Report security incident
   */
  async reportSecurityIncident(
    type: 'data_breach' | 'unauthorized_access' | 'malware' | 'phishing' | 'ddos' | 'other',
    description: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    affectedData?: string[],
    affectedUsers?: string[]
  ): Promise<SecurityIncident> {
    const incident: SecurityIncident = {
      id: `incident_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity,
      status: 'detected',
      description,
      affectedData,
      affectedUsers,
      detectedAt: new Date(),
      reportedToAuthorities: false,
      mitigationSteps: []
    };

    this.securityIncidents.push(incident);

    // Log the incident
    await this.logAuditEvent(
      'security_incident_reported',
      'security',
      { type, severity, description, affectedUsers: affectedUsers?.length || 0 },
      { riskLevel: 'critical' }
    );

    // Auto-report to authorities if required (GDPR Article 33)
    if (severity === 'critical' || (type === 'data_breach' && affectedUsers && affectedUsers.length > 0)) {
      await this.reportToAuthorities(incident);
    }

    console.log(`🚨 Security incident reported: ${type} (${severity})`);

    return incident;
  }

  /**
   * Validate password against policy
   */
  validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const policy = this.config.authentication.passwordPolicy;

    if (password.length < policy.minLength) {
      errors.push(`Password must be at least ${policy.minLength} characters long`);
    }

    if (policy.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (policy.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (policy.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (policy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate security report
   */
  async generateSecurityReport(businessId?: string): Promise<{
    summary: {
      totalAuditLogs: number;
      highRiskEvents: number;
      securityIncidents: number;
      dataProcessingRecords: number;
      complianceScore: number;
    };
    incidents: SecurityIncident[];
    auditSummary: Record<string, number>;
    recommendations: string[];
  }> {
    const filteredAuditLogs = businessId 
      ? this.auditLogs.filter(log => log.businessId === businessId)
      : this.auditLogs;

    const highRiskEvents = filteredAuditLogs.filter(log => 
      log.riskLevel === 'high' || log.riskLevel === 'critical'
    ).length;

    const auditSummary: Record<string, number> = {};
    filteredAuditLogs.forEach(log => {
      auditSummary[log.action] = (auditSummary[log.action] || 0) + 1;
    });

    // Calculate compliance score
    const complianceScore = this.calculateComplianceScore(businessId);

    // Generate recommendations
    const recommendations = this.generateSecurityRecommendations(
      filteredAuditLogs,
      this.securityIncidents,
      complianceScore
    );

    return {
      summary: {
        totalAuditLogs: filteredAuditLogs.length,
        highRiskEvents,
        securityIncidents: this.securityIncidents.length,
        dataProcessingRecords: this.dataProcessingRecords.size,
        complianceScore
      },
      incidents: this.securityIncidents,
      auditSummary,
      recommendations
    };
  }

  /**
   * Private helper methods
   */
  private generateEncryptionKey(): Buffer {
    return crypto.randomBytes(32);
  }

  private getDefaultSecurityConfig(): SecurityConfig {
    return {
      encryption: {
        algorithm: 'aes-256-cbc',
        keyLength: 32,
        ivLength: 16
      },
      compliance: {
        gdprEnabled: true,
        ccpaEnabled: true,
        dataRetentionDays: 2555, // 7 years
        auditLogRetentionDays: 2555
      },
      authentication: {
        sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
        maxLoginAttempts: 5,
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: true
        }
      },
      rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 100
      }
    };
  }

  private setupAuditLogging(): void {
    // Set up automatic cleanup of old audit logs
    setInterval(() => {
      const cutoff = new Date(Date.now() - this.config.compliance.auditLogRetentionDays * 24 * 60 * 60 * 1000);
      this.auditLogs = this.auditLogs.filter(log => log.timestamp > cutoff);
    }, 24 * 60 * 60 * 1000); // Daily cleanup
  }

  private initializeComplianceMonitoring(): void {
    // Set up automatic data deletion based on retention policies
    setInterval(async () => {
      const now = new Date();
      
      for (const [id, record] of this.dataProcessingRecords) {
        if (record.processing.scheduledDeletion && record.processing.scheduledDeletion <= now) {
          await this.deleteDataProcessingRecord(id);
        }
      }
    }, 24 * 60 * 60 * 1000); // Daily check
  }

  private setupSecurityMonitoring(): void {
    // Monitor for suspicious patterns in audit logs
    setInterval(() => {
      this.detectSuspiciousActivity();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  private async handleHighRiskEvent(auditLog: AuditLog): Promise<void> {
    // Create security incident for critical events
    if (auditLog.riskLevel === 'critical') {
      await this.reportSecurityIncident(
        'unauthorized_access',
        `Critical security event: ${auditLog.action}`,
        'high',
        undefined,
        auditLog.userId ? [auditLog.userId] : undefined
      );
    }

    // Send immediate alerts
    console.log(`🚨 High-risk security event detected: ${auditLog.action}`);
  }

  private async getCustomerData(customerId: string, businessId: string): Promise<any> {
    // Collect all data for the customer
    const dataRecords = Array.from(this.dataProcessingRecords.values())
      .filter(record => record.customerId === customerId && record.businessId === businessId);

    return {
      customerId,
      dataProcessingRecords: dataRecords,
      collectedAt: new Date(),
      format: 'JSON'
    };
  }

  private async deleteCustomerData(customerId: string, businessId: string): Promise<void> {
    // Mark data for deletion
    const recordsToDelete = Array.from(this.dataProcessingRecords.entries())
      .filter(([_, record]) => record.customerId === customerId && record.businessId === businessId);

    for (const [id, _] of recordsToDelete) {
      await this.deleteDataProcessingRecord(id);
    }

    await this.logAuditEvent(
      'customer_data_deleted',
      'customer_data',
      { customerId, recordsDeleted: recordsToDelete.length },
      { businessId, riskLevel: 'medium' }
    );
  }

  private async exportCustomerData(customerId: string, businessId: string): Promise<any> {
    const data = await this.getCustomerData(customerId, businessId);
    
    // Format for portability (JSON, CSV, etc.)
    return {
      ...data,
      exportFormat: 'JSON',
      exportedAt: new Date(),
      portabilityCompliant: true
    };
  }

  private async deleteDataProcessingRecord(recordId: string): Promise<void> {
    this.dataProcessingRecords.delete(recordId);
    
    // Remove from persistent storage
    await redisService.deleteCachedResponse(`data_processing_${recordId}`, 'security:gdpr');
  }

  private async reportToAuthorities(incident: SecurityIncident): Promise<void> {
    // Simulate reporting to data protection authorities
    incident.reportedToAuthorities = true;
    
    console.log(`📋 Security incident reported to authorities: ${incident.id}`);
    
    await this.logAuditEvent(
      'incident_reported_to_authorities',
      'security',
      { incidentId: incident.id, type: incident.type },
      { riskLevel: 'critical' }
    );
  }

  private detectSuspiciousActivity(): void {
    const recentLogs = this.auditLogs.filter(log => 
      log.timestamp > new Date(Date.now() - 60 * 60 * 1000) // Last hour
    );

    // Check for multiple failed login attempts
    const failedLogins = recentLogs.filter(log => 
      log.action === 'login_attempt' && !log.success
    );

    if (failedLogins.length > this.config.authentication.maxLoginAttempts) {
      console.log(`🚨 Suspicious activity detected: ${failedLogins.length} failed login attempts`);
    }

    // Check for unusual data access patterns
    const dataAccess = recentLogs.filter(log => 
      log.action.includes('data_access') && log.riskLevel !== 'low'
    );

    if (dataAccess.length > 10) {
      console.log(`🚨 Suspicious activity detected: High volume of data access attempts`);
    }
  }

  private calculateComplianceScore(businessId?: string): number {
    let score = 100;

    // Deduct points for unresolved incidents
    const unresolvedIncidents = this.securityIncidents.filter(i => i.status !== 'resolved');
    score -= unresolvedIncidents.length * 10;

    // Deduct points for high-risk audit events
    const highRiskEvents = this.auditLogs.filter(log => 
      log.riskLevel === 'high' || log.riskLevel === 'critical'
    );
    score -= highRiskEvents.length * 5;

    // Deduct points for missing consent
    const recordsWithoutConsent = Array.from(this.dataProcessingRecords.values())
      .filter(record => !record.consent.given && record.legalBasis === 'consent');
    score -= recordsWithoutConsent.length * 15;

    return Math.max(0, Math.min(100, score));
  }

  private generateSecurityRecommendations(
    auditLogs: AuditLog[],
    incidents: SecurityIncident[],
    complianceScore: number
  ): string[] {
    const recommendations: string[] = [];

    if (complianceScore < 80) {
      recommendations.push('Improve compliance score by addressing data protection gaps');
    }

    if (incidents.filter(i => i.status !== 'resolved').length > 0) {
      recommendations.push('Resolve all outstanding security incidents');
    }

    const highRiskEvents = auditLogs.filter(log => 
      log.riskLevel === 'high' || log.riskLevel === 'critical'
    );
    
    if (highRiskEvents.length > 5) {
      recommendations.push('Investigate and mitigate high-risk security events');
    }

    recommendations.push('Regularly review and update security policies');
    recommendations.push('Conduct security awareness training for all users');
    recommendations.push('Implement multi-factor authentication for all accounts');

    return recommendations;
  }
}

export const securityService = SecurityService.getInstance();