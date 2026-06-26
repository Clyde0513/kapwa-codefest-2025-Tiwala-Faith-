import { supabaseDb } from './supabase-db';

// Utility function to handle database operations with retry logic
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      const isLastAttempt = i === maxRetries - 1;
      const isPreparedStatementError = error && 
        typeof error === 'object' && 
        'message' in error && 
        typeof error.message === 'string' &&
        error.message.includes('prepared statement');

      if (isPreparedStatementError && !isLastAttempt) {
        console.log(`Database operation failed, retrying... (attempt ${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}

// Safe database operations
export const db = {
  async createPost(options: any) {
    return withRetry(() => supabaseDb.post.create(options));
  },

  async findManyPosts(options: any) {
    return withRetry(() => supabaseDb.post.findMany(options));
  },

  async createEvent(options: any) {
    return withRetry(() => supabaseDb.event.create(options));
  },

  async findManyEvents(options: any) {
    return withRetry(() => supabaseDb.event.findMany(options));
  },

  async countPosts(options: any) {
    return withRetry(() => supabaseDb.post.count(options));
  },

  async countEvents(options: any) {
    return withRetry(() => supabaseDb.event.count(options));
  },

  async findUniquePost(options: any) {
    return withRetry(() => supabaseDb.post.findUnique(options));
  },

  async updatePost(options: any) {
    return withRetry(() => supabaseDb.post.update(options));
  },

  async deletePost(options: any) {
    return withRetry(() => supabaseDb.post.delete(options));
  },

  async createPhoto(options: any) {
    return withRetry(() => supabaseDb.photo.create(options));
  },

  async findManyPhotos(options: any) {
    return withRetry(() => supabaseDb.photo.findMany(options));
  },

  async countPhotos(options: any) {
    return withRetry(() => supabaseDb.photo.count(options));
  },

  async findUniquePhoto(options: any) {
    return withRetry(() => supabaseDb.photo.findUnique(options));
  },

  async updatePhoto(options: any) {
    return withRetry(() => supabaseDb.photo.update(options));
  },

  async deletePhoto(options: any) {
    return withRetry(() => supabaseDb.photo.delete(options));
  },

  // Video operations
  async createVideo(options: any) {
    return withRetry(() => supabaseDb.video.create(options));
  },

  async findManyVideos(options: any) {
    return withRetry(() => supabaseDb.video.findMany(options));
  },

  async countVideos(options: any) {
    return withRetry(() => supabaseDb.video.count(options));
  },

  async findUniqueVideo(options: any) {
    return withRetry(() => supabaseDb.video.findUnique(options));
  },

  async updateVideo(options: any) {
    return withRetry(() => supabaseDb.video.update(options));
  },

  async deleteVideo(options: any) {
    return withRetry(() => supabaseDb.video.delete(options));
  },

  // Settings operations
  async createSettings(options: any) {
    return withRetry(() => supabaseDb.settings.create(options));
  },

  async findUniqueSettings(options: any) {
    return withRetry(() => supabaseDb.settings.findUnique(options));
  },

  async updateSettings(options: any) {
    return withRetry(() => supabaseDb.settings.update(options));
  },

  async upsertSettings(options: any) {
    return withRetry(() => supabaseDb.settings.upsert(options));
  },
};



