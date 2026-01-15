import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file
const envPath = join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

console.log('\n🔍 OAuth Configuration Verification');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Check Google OAuth
const hasGoogleId = !!process.env.GOOGLE_CLIENT_ID;
const hasGoogleSecret = !!process.env.GOOGLE_CLIENT_SECRET;
const googleId = process.env.GOOGLE_CLIENT_ID;
const googleSecret = process.env.GOOGLE_CLIENT_SECRET;

console.log('📱 Google OAuth:');
console.log(`   GOOGLE_CLIENT_ID: ${hasGoogleId ? '✅ Found' : '❌ Missing'}`);
if (hasGoogleId) {
  console.log(`   Value: ${googleId.substring(0, 20)}...${googleId.substring(googleId.length - 5)}`);
}
console.log(`   GOOGLE_CLIENT_SECRET: ${hasGoogleSecret ? '✅ Found' : '❌ Missing'}`);
if (hasGoogleSecret) {
  console.log(`   Value: ${googleSecret.substring(0, 4)}...${googleSecret.substring(googleSecret.length - 4)}`);
}
if (hasGoogleId && hasGoogleSecret) {
  console.log('   Status: ✅ Google OAuth is configured');
} else {
  console.log('   Status: ❌ Google OAuth is NOT configured');
  console.log('   💡 Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to server/.env');
}

console.log('\n');

// Check GitHub OAuth
const hasGithubId = !!process.env.GITHUB_CLIENT_ID;
const hasGithubSecret = !!process.env.GITHUB_CLIENT_SECRET;
const githubId = process.env.GITHUB_CLIENT_ID;
const githubSecret = process.env.GITHUB_CLIENT_SECRET;

console.log('🐙 GitHub OAuth:');
console.log(`   GITHUB_CLIENT_ID: ${hasGithubId ? '✅ Found' : '❌ Missing'}`);
if (hasGithubId) {
  console.log(`   Value: ${githubId.substring(0, 20)}...${githubId.substring(githubId.length - 5)}`);
}
console.log(`   GITHUB_CLIENT_SECRET: ${hasGithubSecret ? '✅ Found' : '❌ Missing'}`);
if (hasGithubSecret) {
  console.log(`   Value: ${githubSecret.substring(0, 4)}...${githubSecret.substring(githubSecret.length - 4)}`);
}
if (hasGithubId && hasGithubSecret) {
  console.log('   Status: ✅ GitHub OAuth is configured');
} else {
  console.log('   Status: ❌ GitHub OAuth is NOT configured');
  console.log('   💡 Add GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET to server/.env');
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

if (hasGoogleId && hasGoogleSecret && hasGithubId && hasGithubSecret) {
  console.log('✅ All OAuth providers are configured!');
} else {
  console.log('⚠️  Some OAuth providers are missing configuration.');
  console.log('\n📝 To configure OAuth:');
  console.log('   1. Open server/.env');
  console.log('   2. Add the following variables:');
  if (!hasGoogleId || !hasGoogleSecret) {
    console.log('      GOOGLE_CLIENT_ID=your_google_client_id_here');
    console.log('      GOOGLE_CLIENT_SECRET=your_google_client_secret_here');
  }
  if (!hasGithubId || !hasGithubSecret) {
    console.log('      GITHUB_CLIENT_ID=your_github_client_id_here');
    console.log('      GITHUB_CLIENT_SECRET=your_github_client_secret_here');
  }
  console.log('   3. Restart the server');
}
