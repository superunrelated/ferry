#!/usr/bin/env node

/**
 * Script to deploy the ferry app to Google Cloud Storage
 * Run with: npm run deploy:gcs
 * 
 * Requires gcloud CLI to be installed and authenticated
 * Install: https://cloud.google.com/sdk/docs/install
 * Auth: gcloud auth login
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, '..', 'dist', 'apps', 'ferry');
const bucketName = 'vibes-ferry';
const projectId = 'vibes-479107';

function deploy() {
  try {
    // Check if dist directory exists
    if (!fs.existsSync(distDir)) {
      console.error('❌ Error: Build directory not found at:', distDir);
      console.error('Please run "npm run build" first.');
      process.exit(1);
    }

    // Check if gcloud is installed
    try {
      execSync('gcloud --version', { stdio: 'ignore' });
    } catch (error) {
      console.error('❌ Error: gcloud CLI is not installed or not in PATH');
      console.error('Please install it from: https://cloud.google.com/sdk/docs/install');
      process.exit(1);
    }

    // Ensure correct project is set
    console.log(`Setting project to ${projectId}...`);
    try {
      execSync(`gcloud config set project ${projectId}`, { stdio: 'inherit' });
    } catch (error) {
      console.warn('⚠️  Warning: Could not set project. Make sure you have access.');
    }

    console.log('🚀 Deploying to Google Cloud Storage...');
    console.log(`   Bucket: ${bucketName}`);
    console.log(`   Source: ${distDir}\n`);

    // Upload files to GCS bucket with cache-control and make public
    // Upload all files and folders from dist directory to bucket root
    console.log(`Uploading files from ${distDir} to gs://${bucketName}/\n`);
    
    // List files that will be uploaded
    console.log('Files to upload:');
    const files = fs.readdirSync(distDir, { withFileTypes: true, recursive: true });
    files.forEach(file => {
      const filePath = path.join(distDir, file.path || '', file.name);
      const relativePath = path.relative(distDir, filePath);
      if (file.isFile()) {
        console.log(`  - ${relativePath}`);
      }
    });
    console.log('');
    
    // Upload files with Cache-Control: no-cache header
    // Change to dist directory and upload all files to bucket root
    const uploadCommand = `gcloud storage cp -r . "gs://${bucketName}/" --cache-control="no-cache"`;
    
    console.log('Uploading files with Cache-Control: no-cache...\n');
    execSync(uploadCommand, {
      stdio: 'inherit',
      cwd: distDir,
      shell: true,
    });
    
    // Verify upload by listing bucket contents
    console.log('\nVerifying upload...\n');
    try {
      execSync(`gcloud storage ls "gs://${bucketName}/**"`, {
        stdio: 'inherit',
        shell: true,
      });
    } catch (listError) {
      console.warn('Could not list bucket contents for verification');
    }
    
    // Update cache-control on all existing files to ensure no-cache
    console.log('\nUpdating Cache-Control: no-cache on all files...\n');
    try {
      execSync(`gcloud storage objects update -r "gs://${bucketName}/**" --cache-control="no-cache"`, {
        stdio: 'inherit',
        shell: true,
      });
      console.log('✅ Cache-Control: no-cache set on all files');
    } catch (updateError) {
      console.warn('⚠️  Warning: Could not update cache-control on existing files.');
      console.warn('Files uploaded with no-cache, but existing files may still be cached.');
    }
    
    // Make all files in the bucket publicly readable
    // Try using IAM binding first (for uniform bucket-level access)
    console.log('\nMaking files publicly accessible...\n');
    
    try {
      // First, try to add IAM binding for public access (works with uniform bucket-level access)
      console.log('Setting bucket-level public access...');
      execSync(`gcloud storage buckets add-iam-policy-binding "gs://${bucketName}" --member="allUsers" --role="roles/storage.objectViewer"`, {
        stdio: 'inherit',
        shell: true,
      });
      console.log('✅ Bucket is now publicly accessible via IAM');
    } catch (iamError) {
      // If IAM fails, try ACL method (for legacy buckets)
      console.log('IAM method failed, trying ACL method...');
      try {
        execSync(`gsutil -m acl ch -u AllUsers:R "gs://${bucketName}/**"`, {
          stdio: 'inherit',
          shell: true,
        });
        console.log('✅ Files are now publicly accessible via ACL');
      } catch (aclError) {
        console.warn('⚠️  Warning: Could not set public access automatically.');
        console.warn('You may need to set it manually in the Google Cloud Console:');
        console.warn(`   https://console.cloud.google.com/storage/browser/${bucketName}`);
        console.warn('Or run: gcloud storage buckets add-iam-policy-binding');
      }
    }

    // Set CORS configuration for the bucket to allow ES modules
    console.log('\nSetting CORS configuration...\n');
    try {
      // Create a temporary CORS config file
      const corsConfig = JSON.stringify([
        {
          origin: ['*'],
          method: ['GET', 'HEAD'],
          responseHeader: ['Content-Type', 'Cache-Control'],
          maxAgeSeconds: 3600
        }
      ]);
      
      const corsFile = path.join(__dirname, '..', '.cors-config.json');
      fs.writeFileSync(corsFile, corsConfig);
      
      execSync(`gsutil cors set "${corsFile}" "gs://${bucketName}"`, {
        stdio: 'inherit',
        shell: true,
      });
      
      // Clean up temp file
      fs.unlinkSync(corsFile);
      console.log('✅ CORS configuration set');
    } catch (corsError) {
      console.warn('⚠️  Warning: Could not set CORS configuration.');
      console.warn('You may need to set it manually in the Google Cloud Console.');
      console.warn('This is required for ES modules to work properly.');
    }

    console.log('\n✅ Successfully deployed to Google Cloud Storage!');
    console.log(`   URL: https://console.cloud.google.com/storage/browser/${bucketName}`);
    console.log(`   App URL: https://storage.googleapis.com/${bucketName}/index.html`);
  } catch (error) {
    console.error('\n❌ Error deploying to Google Cloud Storage:');
    if (error.message) {
      console.error(error.message);
    }
    console.error('\nMake sure you are authenticated:');
    console.error('  gcloud auth login');
    console.error(`  gcloud config set project ${projectId}`);
    process.exit(1);
  }
}

deploy();

