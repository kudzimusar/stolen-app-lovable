// Browser-safe version of background jobs service
// This provides mock implementations for browser environments

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

class BrowserBackgroundJobService {
  private static instance: BrowserBackgroundJobService;

  static getInstance(): BrowserBackgroundJobService {
    if (!BrowserBackgroundJobService.instance) {
      BrowserBackgroundJobService.instance = new BrowserBackgroundJobService();
    }
    return BrowserBackgroundJobService.instance;
  }

  constructor() {
    console.log('🌐 Using browser-safe background job service');
  }

  // Mock implementations for browser environment
  async addNotificationJob(data: JobData, options?: JobOptions): Promise<void> {
    console.log('📧 Mock: Adding notification job', data);
    // In browser, we might make an API call instead
    return Promise.resolve();
  }

  async addEmailJob(data: JobData, options?: JobOptions): Promise<void> {
    console.log('📧 Mock: Adding email job', data);
    return Promise.resolve();
  }

  async addDataProcessingJob(data: JobData, options?: JobOptions): Promise<void> {
    console.log('📊 Mock: Adding data processing job', data);
    return Promise.resolve();
  }

  async addImageProcessingJob(data: JobData, options?: JobOptions): Promise<void> {
    console.log('🖼️ Mock: Adding image processing job', data);
    return Promise.resolve();
  }

  async addAnalyticsJob(data: JobData, options?: JobOptions): Promise<void> {
    console.log('📈 Mock: Adding analytics job', data);
    return Promise.resolve();
  }

  async addCleanupJob(data: JobData, options?: JobOptions): Promise<void> {
    console.log('🧹 Mock: Adding cleanup job', data);
    return Promise.resolve();
  }

  async getQueueStats() {
    // Return mock queue statistics for browser
    return {
      notifications: {
        waiting: 0,
        active: 0,
        completed: 0,
        failed: 0,
      },
      emails: {
        waiting: 0,
        active: 0,
        completed: 0,
        failed: 0,
      },
      dataProcessing: {
        waiting: 0,
        active: 0,
        completed: 0,
        failed: 0,
      },
      imageProcessing: {
        waiting: 0,
        active: 0,
        completed: 0,
        failed: 0,
      },
      analytics: {
        waiting: 0,
        active: 0,
        completed: 0,
        failed: 0,
      },
      cleanup: {
        waiting: 0,
        active: 0,
        completed: 0,
        failed: 0,
      },
    };
  }

  async pauseAllQueues(): Promise<void> {
    console.log('⏸️ Mock: Pausing all queues');
    return Promise.resolve();
  }

  async resumeAllQueues(): Promise<void> {
    console.log('▶️ Mock: Resuming all queues');
    return Promise.resolve();
  }

  async cleanAllQueues(): Promise<void> {
    console.log('🧹 Mock: Cleaning all queues');
    return Promise.resolve();
  }
}

// Background job hooks for browser
export const useBackgroundJobs = () => {
  const jobService = BrowserBackgroundJobService.getInstance();

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

export default BrowserBackgroundJobService.getInstance();
