/**
 * Production Monitoring and Alerting Service
 * Handles system health, performance monitoring, and automated alerts
 */

export interface SystemMetrics {
  timestamp: Date;
  cpu: {
    usage: number;
    load: number[];
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  database: {
    connections: number;
    queryTime: number;
    errorRate: number;
  };
  api: {
    requestsPerMinute: number;
    averageResponseTime: number;
    errorRate: number;
    slowQueries: number;
  };
  ai: {
    requestsPerMinute: number;
    averageResponseTime: number;
    tokenUsage: number;
    errorRate: number;
  };
  revenue: {
    totalToday: number;
    subscriptionsActive: number;
    conversionRate: number;
  };
}

export interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  category: 'system' | 'performance' | 'business' | 'security';
  title: string;
  message: string;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
  metadata: Record<string, any>;
}

export interface HealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  lastCheck: Date;
  details?: Record<string, any>;
}

export class MonitoringService {
  private metrics: SystemMetrics[] = [];
  private alerts: Alert[] = [];
  private healthChecks: Map<string, HealthCheck> = new Map();
  private alertThresholds = {
    cpu: 80,
    memory: 85,
    apiResponseTime: 2000,
    apiErrorRate: 5,
    dbQueryTime: 1000,
    dbErrorRate: 2,
    aiResponseTime: 10000,
    aiErrorRate: 3
  };

  constructor() {
    this.initializeHealthChecks();
    this.startMonitoring();
  }

  /**
   * Initialize health checks for all services
   */
  private initializeHealthChecks(): void {
    const services = [
      'database',
      'redis',
      'openai',
      'stripe',
      'twilio',
      'email',
      'storage'
    ];

    services.forEach(service => {
      this.healthChecks.set(service, {
        service,
        status: 'healthy',
        responseTime: 0,
        lastCheck: new Date()
      });
    });
  }

  /**
   * Start monitoring system
   */
  private startMonitoring(): void {
    // Collect metrics every minute
    setInterval(() => {
      this.collectMetrics();
    }, 60000);

    // Run health checks every 30 seconds
    setInterval(() => {
      this.runHealthChecks();
    }, 30000);

    // Check for alerts every 5 minutes
    setInterval(() => {
      this.checkAlerts();
    }, 300000);
  }

  /**
   * Collect system metrics
   */
  private async collectMetrics(): Promise<void> {
    try {
      const metrics: SystemMetrics = {
        timestamp: new Date(),
        cpu: await this.getCPUMetrics(),
        memory: await this.getMemoryMetrics(),
        database: await this.getDatabaseMetrics(),
        api: await this.getAPIMetrics(),
        ai: await this.getAIMetrics(),
        revenue: await this.getRevenueMetrics()
      };

      this.metrics.push(metrics);

      // Keep only last 24 hours of metrics
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
      this.metrics = this.metrics.filter(m => m.timestamp > cutoff);

      // Check for threshold violations
      this.checkMetricThresholds(metrics);

    } catch (error) {
      console.error('Failed to collect metrics:', error);
      this.createAlert('critical', 'system', 'Metrics Collection Failed', 'Unable to collect system metrics');
    }
  }

  /**
   * Get CPU metrics
   */
  private async getCPUMetrics(): Promise<SystemMetrics['cpu']> {
    // In a real implementation, this would use system monitoring tools
    return {
      usage: Math.random() * 100,
      load: [Math.random() * 2, Math.random() * 2, Math.random() * 2]
    };
  }

  /**
   * Get memory metrics
   */
  private async getMemoryMetrics(): Promise<SystemMetrics['memory']> {
    // In a real implementation, this would use system monitoring tools
    const total = 8 * 1024 * 1024 * 1024; // 8GB
    const used = Math.random() * total;
    
    return {
      used,
      total,
      percentage: (used / total) * 100
    };
  }

  /**
   * Get database metrics
   */
  private async getDatabaseMetrics(): Promise<SystemMetrics['database']> {
    try {
      // This would query your database for actual metrics
      return {
        connections: Math.floor(Math.random() * 50),
        queryTime: Math.random() * 500,
        errorRate: Math.random() * 5
      };
    } catch (error) {
      return {
        connections: 0,
        queryTime: 0,
        errorRate: 100
      };
    }
  }

  /**
   * Get API metrics
   */
  private async getAPIMetrics(): Promise<SystemMetrics['api']> {
    // This would collect from your API monitoring
    return {
      requestsPerMinute: Math.floor(Math.random() * 1000),
      averageResponseTime: Math.random() * 1000,
      errorRate: Math.random() * 10,
      slowQueries: Math.floor(Math.random() * 10)
    };
  }

  /**
   * Get AI metrics
   */
  private async getAIMetrics(): Promise<SystemMetrics['ai']> {
    // This would collect from your AI service monitoring
    return {
      requestsPerMinute: Math.floor(Math.random() * 100),
      averageResponseTime: Math.random() * 5000,
      tokenUsage: Math.floor(Math.random() * 10000),
      errorRate: Math.random() * 5
    };
  }

  /**
   * Get revenue metrics
   */
  private async getRevenueMetrics(): Promise<SystemMetrics['revenue']> {
    // This would query your business metrics
    return {
      totalToday: Math.random() * 10000,
      subscriptionsActive: Math.floor(Math.random() * 500),
      conversionRate: Math.random() * 20
    };
  }

  /**
   * Run health checks on all services
   */
  private async runHealthChecks(): Promise<void> {
    const services = Array.from(this.healthChecks.keys());

    for (const service of services) {
      try {
        const startTime = Date.now();
        const isHealthy = await this.checkServiceHealth(service);
        const responseTime = Date.now() - startTime;

        const healthCheck: HealthCheck = {
          service,
          status: isHealthy ? 'healthy' : 'unhealthy',
          responseTime,
          lastCheck: new Date()
        };

        this.healthChecks.set(service, healthCheck);

        // Create alert if service is unhealthy
        if (!isHealthy) {
          this.createAlert('critical', 'system', `${service} Service Down`, `${service} service is not responding`);
        }

      } catch (error) {
        console.error(`Health check failed for ${service}:`, error);
        
        this.healthChecks.set(service, {
          service,
          status: 'unhealthy',
          responseTime: 0,
          lastCheck: new Date(),
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        });
      }
    }
  }

  /**
   * Check individual service health
   */
  private async checkServiceHealth(service: string): Promise<boolean> {
    switch (service) {
      case 'database':
        return await this.checkDatabaseHealth();
      case 'redis':
        return await this.checkRedisHealth();
      case 'openai':
        return await this.checkOpenAIHealth();
      case 'stripe':
        return await this.checkStripeHealth();
      case 'twilio':
        return await this.checkTwilioHealth();
      case 'email':
        return await this.checkEmailHealth();
      case 'storage':
        return await this.checkStorageHealth();
      default:
        return true;
    }
  }

  /**
   * Check database health
   */
  private async checkDatabaseHealth(): Promise<boolean> {
    try {
      // This would run a simple query against your database
      // For now, simulate with random success/failure
      return Math.random() > 0.05; // 95% success rate
    } catch (error) {
      return false;
    }
  }

  /**
   * Check Redis health
   */
  private async checkRedisHealth(): Promise<boolean> {
    try {
      // This would ping your Redis instance
      return Math.random() > 0.02; // 98% success rate
    } catch (error) {
      return false;
    }
  }

  /**
   * Check OpenAI health
   */
  private async checkOpenAIHealth(): Promise<boolean> {
    try {
      // This would make a simple API call to OpenAI
      return Math.random() > 0.03; // 97% success rate
    } catch (error) {
      return false;
    }
  }

  /**
   * Check Stripe health
   */
  private async checkStripeHealth(): Promise<boolean> {
    try {
      // This would check Stripe API status
      return Math.random() > 0.01; // 99% success rate
    } catch (error) {
      return false;
    }
  }

  /**
   * Check Twilio health
   */
  private async checkTwilioHealth(): Promise<boolean> {
    try {
      // This would check Twilio API status
      return Math.random() > 0.02; // 98% success rate
    } catch (error) {
      return false;
    }
  }

  /**
   * Check email service health
   */
  private async checkEmailHealth(): Promise<boolean> {
    try {
      // This would check your email service
      return Math.random() > 0.01; // 99% success rate
    } catch (error) {
      return false;
    }
  }

  /**
   * Check storage health
   */
  private async checkStorageHealth(): Promise<boolean> {
    try {
      // This would check your storage service
      return Math.random() > 0.01; // 99% success rate
    } catch (error) {
      return false;
    }
  }

  /**
   * Check metric thresholds and create alerts
   */
  private checkMetricThresholds(metrics: SystemMetrics): void {
    // CPU usage alert
    if (metrics.cpu.usage > this.alertThresholds.cpu) {
      this.createAlert('warning', 'performance', 'High CPU Usage', `CPU usage is ${metrics.cpu.usage.toFixed(1)}%`);
    }

    // Memory usage alert
    if (metrics.memory.percentage > this.alertThresholds.memory) {
      this.createAlert('warning', 'performance', 'High Memory Usage', `Memory usage is ${metrics.memory.percentage.toFixed(1)}%`);
    }

    // API response time alert
    if (metrics.api.averageResponseTime > this.alertThresholds.apiResponseTime) {
      this.createAlert('warning', 'performance', 'Slow API Response', `API response time is ${metrics.api.averageResponseTime}ms`);
    }

    // API error rate alert
    if (metrics.api.errorRate > this.alertThresholds.apiErrorRate) {
      this.createAlert('critical', 'system', 'High API Error Rate', `API error rate is ${metrics.api.errorRate.toFixed(1)}%`);
    }

    // Database query time alert
    if (metrics.database.queryTime > this.alertThresholds.dbQueryTime) {
      this.createAlert('warning', 'performance', 'Slow Database Queries', `Database query time is ${metrics.database.queryTime}ms`);
    }

    // AI response time alert
    if (metrics.ai.averageResponseTime > this.alertThresholds.aiResponseTime) {
      this.createAlert('warning', 'performance', 'Slow AI Response', `AI response time is ${metrics.ai.averageResponseTime}ms`);
    }
  }

  /**
   * Create an alert
   */
  private createAlert(
    type: Alert['type'],
    category: Alert['category'],
    title: string,
    message: string,
    metadata: Record<string, any> = {}
  ): void {
    // Check if similar alert already exists and is not resolved
    const existingAlert = this.alerts.find(alert => 
      alert.title === title && 
      !alert.resolved && 
      Date.now() - alert.timestamp.getTime() < 300000 // 5 minutes
    );

    if (existingAlert) {
      return; // Don't create duplicate alerts
    }

    const alert: Alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      category,
      title,
      message,
      timestamp: new Date(),
      resolved: false,
      metadata
    };

    this.alerts.push(alert);

    // Send alert notification
    this.sendAlertNotification(alert);
  }

  /**
   * Send alert notification
   */
  private async sendAlertNotification(alert: Alert): Promise<void> {
    try {
      // In a real implementation, this would send notifications via:
      // - Email
      // - SMS
      // - Slack
      // - Discord
      // - PagerDuty
      // - etc.

      console.log(`🚨 ALERT [${alert.type.toUpperCase()}]: ${alert.title} - ${alert.message}`);

      // For critical alerts, you might want to send immediate notifications
      if (alert.type === 'critical') {
        await this.sendCriticalAlertNotification(alert);
      }

    } catch (error) {
      console.error('Failed to send alert notification:', error);
    }
  }

  /**
   * Send critical alert notification
   */
  private async sendCriticalAlertNotification(alert: Alert): Promise<void> {
    // This would send immediate notifications for critical alerts
    // Implementation would depend on your notification preferences
  }

  /**
   * Check for alerts that need attention
   */
  private checkAlerts(): void {
    const unresolvedAlerts = this.alerts.filter(alert => !alert.resolved);
    
    // Auto-resolve old alerts
    const cutoff = new Date(Date.now() - 60 * 60 * 1000); // 1 hour
    unresolvedAlerts.forEach(alert => {
      if (alert.timestamp < cutoff && alert.type !== 'critical') {
        this.resolveAlert(alert.id);
      }
    });

    // Escalate critical alerts that haven't been resolved
    const criticalAlerts = unresolvedAlerts.filter(alert => 
      alert.type === 'critical' && 
      Date.now() - alert.timestamp.getTime() > 900000 // 15 minutes
    );

    criticalAlerts.forEach(alert => {
      this.escalateAlert(alert);
    });
  }

  /**
   * Resolve an alert
   */
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert && !alert.resolved) {
      alert.resolved = true;
      alert.resolvedAt = new Date();
      return true;
    }
    return false;
  }

  /**
   * Escalate an alert
   */
  private escalateAlert(alert: Alert): void {
    // This would escalate the alert to higher priority channels
    console.log(`🚨 ESCALATED ALERT: ${alert.title} has not been resolved for 15+ minutes`);
  }

  /**
   * Get current system status
   */
  getSystemStatus(): {
    overall: 'healthy' | 'degraded' | 'unhealthy';
    services: HealthCheck[];
    activeAlerts: Alert[];
    metrics: SystemMetrics | null;
  } {
    const services = Array.from(this.healthChecks.values());
    const activeAlerts = this.alerts.filter(alert => !alert.resolved);
    const latestMetrics = this.metrics[this.metrics.length - 1] || null;

    // Determine overall status
    let overall: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    const unhealthyServices = services.filter(s => s.status === 'unhealthy');
    const criticalAlerts = activeAlerts.filter(a => a.type === 'critical');

    if (unhealthyServices.length > 0 || criticalAlerts.length > 0) {
      overall = 'unhealthy';
    } else if (services.some(s => s.status === 'degraded') || activeAlerts.length > 0) {
      overall = 'degraded';
    }

    return {
      overall,
      services,
      activeAlerts,
      metrics: latestMetrics
    };
  }

  /**
   * Get metrics history
   */
  getMetricsHistory(hours: number = 24): SystemMetrics[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.metrics.filter(m => m.timestamp > cutoff);
  }

  /**
   * Get alerts history
   */
  getAlertsHistory(hours: number = 24): Alert[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.alerts.filter(a => a.timestamp > cutoff);
  }

  /**
   * Update alert thresholds
   */
  updateAlertThresholds(thresholds: Partial<typeof this.alertThresholds>): void {
    this.alertThresholds = { ...this.alertThresholds, ...thresholds };
  }

  /**
   * Generate system report
   */
  generateSystemReport(): {
    period: string;
    uptime: number;
    totalAlerts: number;
    criticalAlerts: number;
    averageResponseTime: number;
    errorRate: number;
    recommendations: string[];
  } {
    const last24Hours = this.getMetricsHistory(24);
    const alerts24Hours = this.getAlertsHistory(24);

    const averageResponseTime = last24Hours.length > 0 
      ? last24Hours.reduce((sum, m) => sum + m.api.averageResponseTime, 0) / last24Hours.length
      : 0;

    const errorRate = last24Hours.length > 0
      ? last24Hours.reduce((sum, m) => sum + m.api.errorRate, 0) / last24Hours.length
      : 0;

    const recommendations = this.generateRecommendations(last24Hours, alerts24Hours);

    return {
      period: 'Last 24 hours',
      uptime: 99.9, // Calculate based on actual downtime
      totalAlerts: alerts24Hours.length,
      criticalAlerts: alerts24Hours.filter(a => a.type === 'critical').length,
      averageResponseTime,
      errorRate,
      recommendations
    };
  }

  /**
   * Generate system recommendations
   */
  private generateRecommendations(metrics: SystemMetrics[], alerts: Alert[]): string[] {
    const recommendations: string[] = [];

    // High CPU usage recommendation
    const avgCPU = metrics.reduce((sum, m) => sum + m.cpu.usage, 0) / metrics.length;
    if (avgCPU > 70) {
      recommendations.push('Consider upgrading server resources due to high CPU usage');
    }

    // High memory usage recommendation
    const avgMemory = metrics.reduce((sum, m) => sum + m.memory.percentage, 0) / metrics.length;
    if (avgMemory > 80) {
      recommendations.push('Memory usage is consistently high - consider increasing RAM');
    }

    // Slow API responses recommendation
    const avgResponseTime = metrics.reduce((sum, m) => sum + m.api.averageResponseTime, 0) / metrics.length;
    if (avgResponseTime > 1000) {
      recommendations.push('API response times are slow - optimize database queries and add caching');
    }

    // High error rate recommendation
    const avgErrorRate = metrics.reduce((sum, m) => sum + m.api.errorRate, 0) / metrics.length;
    if (avgErrorRate > 3) {
      recommendations.push('API error rate is high - review error logs and fix common issues');
    }

    // Frequent alerts recommendation
    if (alerts.length > 10) {
      recommendations.push('High number of alerts - review and adjust alert thresholds');
    }

    return recommendations;
  }
}