#!/usr/bin/env node

/**
 * Migration Script: Database Posts → Sanity CMS
 * 
 * This script migrates posts from your Prisma database to Sanity CMS
 * while preserving all user interactions (comments, likes) in the database.
 */

import { createClient } from '@sanity/client';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma client with connection pooling fix
const prisma = new PrismaClient({
  log: ['error'],
  datasourceUrl: process.env.DATABASE_URL + '?pgbouncer=true&connection_limit=1'
});

// Initialize Sanity client with your actual credentials
const sanityClient = createClient({
  projectId: 'b4h3ckxo', // Your actual Sanity project ID
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false, // Important for migrations
  token: 'sk9cTsLD6pPs4ZjM8toxujjJjPuxdt0iaHtGk7pG45wlcdwbSyXj8Ga4wQvNsc2csIc38ahelQOhp8Xn9HBJAUCGVQYkcEjGMlixWQphkjXAXookgx9ttaHWg57zYG6CcojBJEQMFOvAnlQxgGsEuOWBmusnVyhP6BxETyPEiUYci3Mm4uJP', // Your API token
});

// Helper function to convert plain text to Portable Text
function textToPortableText(text) {
  if (!text || text.trim() === '') {
    return [];
  }

  // Split text into paragraphs and convert to Portable Text blocks
  const paragraphs = text.split('\n\n').filter(p => p.trim() !== '');
  
  return paragraphs.map(paragraph => ({
    _type: 'block',
    _key: Math.random().toString(36).substr(2, 9),
    style: 'normal',
    children: [
      {
        _type: 'span',
        _key: Math.random().toString(36).substr(2, 9),
        text: paragraph.trim(),
        marks: []
      }
    ],
    markDefs: []
  }));
}

// Helper function to create a slug from title
function createSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim('-'); // Remove leading/trailing hyphens
}

// Main migration function
async function migratePosts() {
  console.log('🚀 Starting migration: Database Posts → Sanity CMS');
  console.log('─'.repeat(60));

  try {
    // 1. Fetch all posts from database
    console.log('📊 Fetching posts from database...');
    const dbPosts = await prisma.post.findMany({
      orderBy: { createdAt: 'asc' }, // Migrate oldest first
      include: {
        author: {
          select: { name: true, email: true }
        }
      }
    });

    console.log(`Found ${dbPosts.length} posts to migrate`);

    if (dbPosts.length === 0) {
      console.log('✅ No posts to migrate. Exiting.');
      return;
    }

    // 2. Check if Sanity is accessible
    console.log('🔍 Testing Sanity connection...');
    try {
      await sanityClient.fetch('*[_type == "post"][0]');
      console.log('✅ Sanity connection successful');
    } catch (error) {
      console.log('⚠️  Sanity connection test failed:', error.message);
      console.log('   This might be expected if no posts exist yet.');
    }

    // 3. Create author in Sanity if needed
    console.log('👤 Setting up author...');
    let authorRef = null;
    
    // Check if any author exists in Sanity
    const existingAuthors = await sanityClient.fetch('*[_type == "author"]');
    
    if (existingAuthors.length === 0) {
      // Create a default author
      const defaultAuthor = await sanityClient.create({
        _type: 'author',
        name: 'Church Administrator',
        slug: {
          _type: 'slug',
          current: 'church-administrator'
        }
      });
      authorRef = {
        _type: 'reference',
        _ref: defaultAuthor._id
      };
      console.log('✅ Created default author in Sanity');
    } else {
      authorRef = {
        _type: 'reference',
        _ref: existingAuthors[0]._id
      };
      console.log('✅ Using existing author from Sanity');
    }

    // 4. Migrate each post
    console.log('📝 Migrating posts...');
    const migrationResults = [];

    for (const [index, dbPost] of dbPosts.entries()) {
      try {
        console.log(`\n[${index + 1}/${dbPosts.length}] Migrating: "${dbPost.title}"`);
        
        // Create Sanity post document
        const sanityPost = {
          _type: 'post',
          title: dbPost.title,
          slug: {
            _type: 'slug',
            current: createSlug(dbPost.title)
          },
          author: authorRef,
          publishedAt: dbPost.published ? dbPost.createdAt.toISOString() : null,
          excerpt: dbPost.content.substring(0, 200) + (dbPost.content.length > 200 ? '...' : ''),
          body: textToPortableText(dbPost.content),
          // Store original database ID for reference
          originalDbId: dbPost.id,
          // Add tags based on content analysis
          tags: extractTags(dbPost.title, dbPost.content)
        };

        // Create the post in Sanity
        const createdPost = await sanityClient.create(sanityPost);
        
        migrationResults.push({
          originalId: dbPost.id,
          sanityId: createdPost._id,
          title: dbPost.title,
          status: 'success'
        });
        
        console.log(`   ✅ Created in Sanity: ${createdPost._id}`);
        
      } catch (error) {
        console.log(`   ❌ Failed: ${error.message}`);
        migrationResults.push({
          originalId: dbPost.id,
          title: dbPost.title,
          status: 'failed',
          error: error.message
        });
      }
    }

    // 5. Migration summary
    console.log('\n' + '─'.repeat(60));
    console.log('📋 Migration Summary:');
    console.log(`✅ Successful: ${migrationResults.filter(r => r.status === 'success').length}`);
    console.log(`❌ Failed: ${migrationResults.filter(r => r.status === 'failed').length}`);
    
    // Show failed migrations
    const failed = migrationResults.filter(r => r.status === 'failed');
    if (failed.length > 0) {
      console.log('\n❌ Failed Migrations:');
      failed.forEach(f => console.log(`   - "${f.title}": ${f.error}`));
    }

    // 6. Next steps
    console.log('\n🎯 Next Steps:');
    console.log('1. Verify posts in Sanity Studio: http://localhost:3001/studio');
    console.log('2. Update blog pages to use Sanity instead of database');
    console.log('3. Test that comments/likes still work with Sanity post IDs');
    console.log('4. Remove Post table from database schema (after verification)');

    // Save migration log
    const migrationLog = {
      timestamp: new Date().toISOString(),
      totalPosts: dbPosts.length,
      successful: migrationResults.filter(r => r.status === 'success').length,
      failed: migrationResults.filter(r => r.status === 'failed').length,
      results: migrationResults
    };
    
    // Save migration log using Node.js fs
    const fs = await import('fs/promises');
    await fs.writeFile('migration-log.json', JSON.stringify(migrationLog, null, 2));
    console.log('\n📄 Migration log saved to: migration-log.json');

  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('✅ Migration completed');
  }
}

// Helper function to extract tags from content
function extractTags(title, content) {
  const tags = [];
  const text = `${title} ${content}`.toLowerCase();
  
  // Church-related tags
  const churchKeywords = ['church', 'mass', 'prayer', 'faith', 'god', 'jesus', 'christian', 'catholic'];
  const eventKeywords = ['event', 'celebration', 'festival', 'gathering', 'meeting'];
  const communityKeywords = ['community', 'fellowship', 'welcome', 'family', 'friends'];
  
  if (churchKeywords.some(keyword => text.includes(keyword))) tags.push('church');
  if (eventKeywords.some(keyword => text.includes(keyword))) tags.push('events');
  if (communityKeywords.some(keyword => text.includes(keyword))) tags.push('community');
  
  return tags.length > 0 ? tags : ['general'];
}

// Run migration
migratePosts().catch(console.error);
