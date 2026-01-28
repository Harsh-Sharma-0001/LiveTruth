import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Claim from './models/Claim.js';
import { getEmbedding } from './services/embeddingService.js';

// Load env
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/livetruth';

const claimsToSeed = [
    {
        text: "Donald Trump is the president of USA",
        verdict: "true",
        explanation: "Validated by System Administrator (Manual Override). Served as 45th and elected as 47th President.",
        sources: [
            { title: "Whitehouse.gov", url: "https://www.whitehouse.gov/" },
            { title: "Wikipedia - Donald Trump", url: "https://en.wikipedia.org/wiki/Donald_Trump" }
        ]
    },
    {
        text: "Donald Trump is the president",
        verdict: "true",
        explanation: "Validated by System Administrator (Manual Override).",
        sources: [
             { title: "Whitehouse.gov", url: "https://www.whitehouse.gov/" }
        ]
    }
];

async function seed() {
    console.log('🌱 connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected.');

    for (const item of claimsToSeed) {
        console.log(`Processing: "${item.text}"`);
        
        let embedding = null;
        try {
            console.log('   Generating embedding...');
            embedding = await getEmbedding(item.text);
        } catch (e) {
            console.log('   ⚠️ Embedding failed, skipping vector.');
        }

        // Remove existing
        await Claim.deleteMany({ claimHash: item.text });

        // Insert new
        await Claim.create({
            claim: item.text,
            claimHash: item.text,
            verdict: item.verdict,
            confidence: 100,
            explanation: item.explanation,
            sources: item.sources,
            embedding: embedding || []
        });
        console.log(`✅ Seeded: ${item.text}`);
    }

    console.log('Done.');
    process.exit(0);
}

seed().catch(err => {
    console.error(err);
    process.exit(1);
});
