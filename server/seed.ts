import { db } from "./db";
import { dimensions, archetypes, styles, pricing } from "@shared/schema";

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    // Seed 8D Hypnosis Framework dimensions (all 8 are independent emphasis levels)
    console.log("📊 Seeding 8D Framework dimensions...");
    await db.insert(dimensions).values([
      {
        name: "Somatic",
        description: "Use the body as an entry point for transformation. Anchor the experience in breath, posture, temperature, or physical sensations. Guide awareness of bodily shifts to deepen trance.",
        enabled: true,
        sortOrder: 1,
      },
      {
        name: "Temporal",
        description: "Leverage the mind's fluid experience of time. Guide backward to access formative memories or forward to inhabit future states. Stretch, compress, or dissolve time.",
        enabled: true,
        sortOrder: 2,
      },
      {
        name: "Symbolic",
        description: "Use metaphors, imagery, and archetypal stories to speak directly to the subconscious. Transform struggles into landscapes, journeys, or symbolic transformations.",
        enabled: true,
        sortOrder: 3,
      },
      {
        name: "Psychological",
        description: "Engage the deeper structures of the mind. Address cognitive patterns, limiting beliefs, protective parts, and inner conflicts. Bridge conscious awareness and subconscious transformation.",
        enabled: true,
        sortOrder: 4,
      },
      {
        name: "Perspective",
        description: "Change how the client sees themselves and their story by shifting viewpoint. Use observer mode for insight, first-person for integration, or future-self perspective for clarity.",
        enabled: true,
        sortOrder: 5,
      },
      {
        name: "Spiritual",
        description: "Tap into the client's sense of meaning, purpose, or connection to something greater. Invite connection with higher self, inner wisdom, or transpersonal sources of strength.",
        enabled: true,
        sortOrder: 6,
      },
      {
        name: "Relational",
        description: "Integrate relationships—real, imagined, or symbolic—to activate emotional change. Include dialogues, forgiveness work, or experiences of support and belonging.",
        enabled: true,
        sortOrder: 7,
      },
      {
        name: "Language",
        description: "Use hypnotic phrasing, pacing, and rhythm deliberately. Embed commands, layer ambiguity, and shape sentence flow to mirror trance depth and bypass resistance.",
        enabled: true,
        sortOrder: 8,
      },
    ]);

    // Seed archetypes
    console.log("🎭 Seeding archetypes...");
    await db.insert(archetypes).values([
      {
        name: "The Healer",
        description: "Gentle, nurturing approach focused on emotional healing and self-compassion. Uses soothing metaphors and emphasizes inner strength.",
        sortOrder: 1,
      },
      {
        name: "The Guide",
        description: "Wise, knowledgeable presence that leads clients through transformative journeys. Uses clear directions with supportive encouragement.",
        sortOrder: 2,
      },
      {
        name: "The Coach",
        description: "Motivational, action-oriented approach that builds confidence and drives change. Uses direct language with empowering suggestions.",
        sortOrder: 3,
      },
      {
        name: "The Storyteller",
        description: "Weaves therapeutic narratives and metaphors to create deep subconscious shifts. Uses rich imagery and symbolic language.",
        sortOrder: 4,
      },
      {
        name: "The Analyst",
        description: "Logical, structured approach that reframes thoughts and beliefs. Uses cognitive techniques with rational explanations.",
        sortOrder: 5,
      },
      {
        name: "The Nurturer",
        description: "Deeply caring, protective presence that creates safety and comfort. Uses warm, maternal language with unconditional support.",
        sortOrder: 6,
      },
    ]);

    // Seed styles
    console.log("🎨 Seeding styles...");
    await db.insert(styles).values([
      {
        name: "Conversational",
        description: "Natural, flowing language as if having a relaxed conversation. Creates rapport through friendly, accessible tone.",
        sortOrder: 1,
      },
      {
        name: "Formal/Traditional",
        description: "Classic hypnotherapy language with structured protocols. Uses traditional induction techniques and formal phrasing.",
        sortOrder: 2,
      },
      {
        name: "Modern/Integrative",
        description: "Blends contemporary psychology with hypnosis. Uses current therapeutic language and evidence-based approaches.",
        sortOrder: 3,
      },
    ]);

    // Seed pricing
    console.log("💰 Seeding pricing...");
    await db.insert(pricing).values([
      {
        tierName: "free",
        priceCents: 0,
        description: "Free Weekly Script - Weekly access, Basic script, Email required, 1 per week limit",
      },
      {
        tierName: "create_new",
        priceCents: 300,
        description: "Create New Script - Full dimension control, 6 archetype options, 3 style approaches, 6 marketing assets, PDF/Word download, Unlimited previews",
      },
      {
        tierName: "remix",
        priceCents: 300,
        description: "Remix Script - AI dimension analysis, Adjust emphasis, Before/after comparison, 6 marketing assets, PDF/Word download, Keep remixing freely",
      },
    ]);

    console.log("✅ Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

seed()
  .then(() => {
    console.log("🎉 Seed complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Seed failed:", error);
    process.exit(1);
  });
