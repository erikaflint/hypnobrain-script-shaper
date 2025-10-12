import { db } from "./db";
import { dimensions, archetypes, styles, pricing } from "@shared/schema";

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    // Seed dimensions (4 enabled, 4 disabled)
    console.log("📊 Seeding dimensions...");
    await db.insert(dimensions).values([
      {
        name: "Direct/Authoritarian",
        description: "Use direct commands and authoritative language vs gentle suggestions",
        enabled: true,
        sortOrder: 1,
      },
      {
        name: "Indirect/Permissive",
        description: "Use gentle, permissive suggestions vs direct commands",
        enabled: false,
        sortOrder: 2,
      },
      {
        name: "Analytical/Rational",
        description: "Use logical, rational language and cognitive reframes",
        enabled: true,
        sortOrder: 3,
      },
      {
        name: "Emotional/Metaphorical",
        description: "Use emotional, metaphorical language and storytelling",
        enabled: false,
        sortOrder: 4,
      },
      {
        name: "Paternal/Parental",
        description: "Use protective, authoritative parental guidance",
        enabled: true,
        sortOrder: 5,
      },
      {
        name: "Maternal/Nurturing",
        description: "Use nurturing, maternal comfort and support",
        enabled: false,
        sortOrder: 6,
      },
      {
        name: "Inward/Introspective",
        description: "Focus on internal reflection and self-discovery",
        enabled: true,
        sortOrder: 7,
      },
      {
        name: "Outward/Social",
        description: "Focus on external relationships and social connections",
        enabled: false,
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
