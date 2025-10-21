// @ts-nocheck
import Queue from 'bull';
import cacheManager from './redis';
import performanceMonitor from './performance-monitoring';

// Queue configurations
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Create queues for different job types
const queues = {
  notifications: new Queue('notifications', REDIS_URL),
  emails: new Queue('emails', REDIS_URL),
  dataProcessing: new Queue('data-processing', REDIS_URL),
  imageProcessing: new Queue('image-processing', REDIS_URL),
  analytics: new Queue('analytics', REDIS_URL),
  cleanup: new Queue('cleanup', REDIS_URL),
} as const;

export interface JobData {
  [key: string]: any;
}

export interface JobOptions {
  priority?: number;
  delay?: number;
  attempts?: number;
  backoff?: number | 'exponential';
  removeOnComplete?: boolean | number;
  removeOnFail?: boolean | number;
  timeout?: number;
}

export class BackgroundJobService {
  private static instance: BackgroundJobService;

  static getInstance(): BackgroundJobService {
    if (!BackgroundJobService.instance) {
      BackgroundJobService.instance = new BackgroundJobService();
    }
    return BackgroundJobService.instance;
  }

  constructor() {
    this.initializeQueues();
  }

  /**
   * Initialize all queues with processors
   */
  private initializeQueues() {
    // Notifications queue
    queues.notifications.process(async (job) => {
      return this.processNotification(job.data);
    });

    // Emails queue
    queues.emails.process(async (job) => {
      return this.processEmail(job.data);
    });

    // Data processing queue
    queues.dataProcessing.process(async (job) => {
      return this.processData(job.data);
    });

    // Image processing queue
    queues.imageProcessing.process(async (job) => {
      return this.processImage(job.data);
    });

    // Analytics queue
    queues.analytics.process(async (job) => {
      return this.processAnalytics(job.data);
    });

    // Cleanup queue
    queues.cleanup.process(async (job) => {
      return this.processCleanup(job.data);
    });

    // Error handling for all queues
    Object.values(queues).forEach(queue => {
      queue.on('error', (error) => {
        console.error('Queue error:', error);
        performanceMonitor.trackError(error, { queue: queue.name });
      });

      queue.on('failed', (job, error) => {
        console.error(`Job ${job.id} failed:`, error);
        performanceMonitor.trackError(error, { 
          queue: queue.name, 
          jobId: job.id,
          jobData: job.data 
        });
      });

      queue.on('completed', (job) => {
        console.log(`Job ${job.id} completed successfully`);
      });
    });

    console.log('✅ Background job queues initialized');
  }

  /**
   * Add notification job
   */
  async addNotificationJob(data: JobData, options: JobOptions = {}) {
    const job = await queues.notifications.add(data, {
      priority: options.priority || 1,
      delay: options.delay || 0,
      attempts: options.attempts || 3,
      backoff: options.backoff || 'exponential',
      removeOnComplete: options.removeOnComplete ?? true,
      removeOnFail: options.removeOnFail ?? false,
      timeout: options.timeout || 30000,
    });

    console.log(`📧 Notification job added: ${job.id}`);
    return job;
  }

  /**
   * Add email job
   */
  async addEmailJob(data: JobData, options: JobOptions = {}) {
    const job = await queues.emails.add(data, {
      priority: options.priority || 2,
      delay: options.delay || 0,
      attempts: options.attempts || 5,
      backoff: options.backoff || 'exponential',
      removeOnComplete: options.removeOnComplete ?? true,
      removeOnFail: options.removeOnFail ?? false,
      timeout: options.timeout || 60000,
    });

    console.log(`📧 Email job added: ${job.id}`);
    return job;
  }

  /**
   * Add data processing job
   */
  async addDataProcessingJob(data: JobData, options: JobOptions = {}) {
    const job = await queues.dataProcessing.add(data, {
      priority: options.priority || 3,
      delay: options.delay || 0,
      attempts: options.attempts || 3,
      backoff: options.backoff || 'exponential',
      removeOnComplete: options.removeOnComplete ?? true,
      removeOnFail: options.removeOnFail ?? false,
      timeout: options.timeout || 300000, // 5 minutes
    });

    console.log(`🔄 Data processing job added: ${job.id}`);
    return job;
  }

  /**
   * Add image processing job
   */
  async addImageProcessingJob(data: JobData, options: JobOptions = {}) {
    const job = await queues.imageProcessing.add(data, {
      priority: options.priority || 4,
      delay: options.delay || 0,
      attempts: options.attempts || 3,
      backoff: options.backoff || 'exponential',
      removeOnComplete: options.removeOnComplete ?? true,
      removeOnFail: options.removeOnFail ?? false,
      timeout: options.timeout || 120000, // 2 minutes
    });

    console.log(`🖼️ Image processing job added: ${job.id}`);
    return job;
  }

  /**
   * Add analytics job
   */
  async addAnalyticsJob(data: JobData, options: JobOptions = {}) {
    const job = await queues.analytics.add(data, {
      priority: options.priority || 5,
      delay: options.delay || 0,
      attempts: options.attempts || 2,
      backoff: options.backoff || 'exponential',
      removeOnComplete: options.removeOnComplete ?? true,
      removeOnFail: options.removeOnFail ?? false,
      timeout: options.timeout || 600000, // 10 minutes
    });

    console.log(`📊 Analytics job added: ${job.id}`);
    return job;
  }

  /**
   * Add cleanup job
   */
  async addCleanupJob(data: JobData, options: JobOptions = {}) {
    const job = await queues.cleanup.add(data, {
      priority: options.priority || 6,
      delay: options.delay || 0,
      attempts: options.attempts || 1,
      backoff: options.backoff || 'exponential',
      removeOnComplete: options.removeOnComplete ?? true,
      removeOnFail: options.removeOnFail ?? false,
      timeout: options.timeout || 300000, // 5 minutes
    });

    console.log(`🧹 Cleanup job added: ${job.id}`);
    return job;
  }

  /**
   * Process notification job
   */
  private async processNotification(data: JobData) {
    const startTime = performance.now();
    
    try {
      const { userId, type, message, metadata } = data;
      
      // Store notification in database/cache
      const notification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        type,
        message,
        metadata,
        createdAt: new Date().toISOString(),
        read: false,
      };

      // Cache notification
      await cacheManager.set(
        `notification:${userId}:${notification.id}`,
        notification,
        86400 // 24 hours
      );

      // Update notification count
      const countKey = `notification:count:${userId}`;
      const currentCount = await cacheManager.get<number>(countKey) || 0;
      await cacheManager.set(countKey, currentCount + 1, 86400);

      const duration = performance.now() - startTime;
      performanceMonitor.trackApiCall('processNotification', duration, 200);

      console.log(`✅ Notification processed for user ${userId}`);
      return { success: true, notificationId: notification.id };
    } catch (error) {
      const duration = performance.now() - startTime;
      performanceMonitor.trackApiCall('processNotification', duration, 500);
      throw error;
    }
  }

  /**
   * Process email job
   */
  private async processEmail(data: JobData) {
    const startTime = performance.now();
    
    try {
      const { to, subject, template, variables } = data;
      
      // Simulate email sending (replace with actual email service)
      console.log(`📧 Sending email to ${to}: ${subject}`);
      
      // Add delay to simulate email processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const duration = performance.now() - startTime;
      performanceMonitor.trackApiCall('processEmail', duration, 200);

      return { success: true, emailId: `email_${Date.now()}` };
    } catch (error) {
      const duration = performance.now() - startTime;
      performanceMonitor.trackApiCall('processEmail', duration, 500);
      throw error;
    }
  }

  /**
   * Process data job
   */
  private async processData(data: JobData) {
    const startTime = performance.now();
    
    try {
      const { type, payload } = data;
      
      switch (type) {
        case 'aggregate_transactions':
          // Aggregate transaction data
          console.log('🔄 Aggregating transaction data...');
          break;
        case 'update_user_stats':
          // Update user statistics
          console.log('🔄 Updating user statistics...');
          break;
        case 'process_device_data':
          // Process device registration data
          console.log('🔄 Processing device data...');
          break;
        default:
          console.log(`🔄 Processing data type: ${type}`);
      }
      
      const duration = performance.now() - startTime;
      performanceMonitor.trackApiCall('processData', duration, 200);

      return { success: true, processedType: type };
    } catch (error) {
      const duration = performance.now() - startTime;
      performanceMonitor.trackApiCall('processData', duration, 500);
      throw error;
    }
  }

  /**
   * Process image job
   */
  private async processImage(data: JobData) {
    const startTime = performance.now();
    
    try {
      const { imageUrl, operations } = data;
      
      // Simulate image processing
      console.log(`🖼️ Processing image: ${imageUrl}`);
      
      // Add delay to simulate image processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const duration = performance.now() - startTime;
      performanceMonitor.trackApiCall('processImage', duration, 200);

      return { success: true, processedImageUrl: imageUrl };
    } catch (error) {
      const duration = performance.now() - startTime;
      performanceMonitor.trackApiCall('processImage', duration, 500);
      throw error;
    }
  }

  /**
   * Process analytics job
   */
  private async processAnalytics(data: JobData) {
    const startTime = performance.now();
    
    try {
      const { type, data: analyticsData } = data;
      
      // Process analytics data
      console.log(`📊 Processing analytics: ${type}`);
      
      // Cache analytics results
      await cacheManager.set(
        `analytics:${type}:${Date.now()}`,
        analyticsData,
        3600 // 1 hour
      );
      
      const duration = performance.now() - startTime;
      performanceMonitor.trackApiCall('processAnalytics', duration, 200);

      return { success: true, analyticsType: type };
    } catch (error) {
      const duration = performance.now() - startTime;
      performanceMonitor.trackApiCall('processAnalytics', duration, 500);
      throw error;
    }
  }

  /**
   * Process cleanup job
   */
  private async processCleanup(data: JobData) {
    const startTime = performance.now();
    
    try {
      const { type } = data;
      
      switch (type) {
        case 'expired_sessions':
          // Clean up expired sessions
          console.log('🧹 Cleaning up expired sessions...');
          break;
        case 'old_notifications':
          // Clean up old notifications
          console.log('🧹 Cleaning up old notifications...');
          break;
        case 'temp_files':
          // Clean up temporary files
          console.log('🧹 Cleaning up temporary files...');
          break;
        default:
          console.log(`🧹 Running cleanup: ${type}`);
      }
      
      const duration = performance.now() - startTime;
      performanceMonitor.trackApiCall('processCleanup', duration, 200);

      return { success: true, cleanupType: type };
    } catch (error) {
      const duration = performance.now() - startTime;
      performanceMonitor.trackApiCall('processCleanup', duration, 500);
      throw error;
    }
  }

  /**
   * Get queue statistics
   */
  async getQueueStats() {
    const stats: Record<string, any> = {};
    
    for (const [name, queue] of Object.entries(queues)) {
      const waiting = await queue.getWaiting();
      const active = await queue.getActive();
      const completed = await queue.getCompleted();
      const failed = await queue.getFailed();
      
      stats[name] = {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
      };
    }
    
    return stats;
  }

  /**
   * Pause all queues
   */
  async pauseAllQueues() {
    for (const queue of Object.values(queues)) {
      await queue.pause();
    }
    console.log('⏸️ All queues paused');
  }

  /**
   * Resume all queues
   */
  async resumeAllQueues() {
    for (const queue of Object.values(queues)) {
      await queue.resume();
    }
    console.log('▶️ All queues resumed');
  }

  /**
   * Clean all queues
   */
  async cleanAllQueues() {
    for (const queue of Object.values(queues)) {
      await queue.clean(0, 'completed');
      await queue.clean(0, 'failed');
    }
    console.log('🧹 All queues cleaned');
  }
}

// Background job hooks
export const useBackgroundJobs = () => {
  const jobService = BackgroundJobService.getInstance();

  return {
    addNotificationJob: jobService.addNotificationJob.bind(jobService),
    addEmailJob: jobService.addEmailJob.bind(jobService),
    addDataProcessingJob: jobService.addDataProcessingJob.bind(jobService),
    addImageProcessingJob: jobService.addImageProcessingJob.bind(jobService),
    addAnalyticsJob: jobService.addAnalyticsJob.bind(jobService),
    addCleanupJob: jobService.addCleanupJob.bind(jobService),
    getQueueStats: jobService.getQueueStats.bind(jobService),
    pauseAllQueues: jobService.pauseAllQueues.bind(jobService),
    resumeAllQueues: jobService.resumeAllQueues.bind(jobService),
    cleanAllQueues: jobService.cleanAllQueues.bind(jobService),
  };
};

export default BackgroundJobService.getInstance();
