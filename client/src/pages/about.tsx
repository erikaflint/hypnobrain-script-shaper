import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Sparkles, CheckCircle2, XCircle, ArrowRight } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <a className="text-2xl font-bold text-primary flex items-center gap-2" data-testid="link-home">
              <Sparkles className="w-6 h-6" />
              HypnoBrain Clinic
            </a>
          </Link>
          <Link href="/app-v2">
            <Button data-testid="button-start-creating">Start Creating</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Custom Script Packages for Your Clients in Minutes
          </h1>
          <p className="text-xl text-muted-foreground">
            Professional hypnosis scripts that match YOUR client's specific situation and desired outcomes
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        
        {/* Problem Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">The Problem We Solve</h2>
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p>
              You're trained in <strong>insight-based hypnosis</strong>. You don't use scripts during the interactive work - age regression, chair therapy, parts integration. You're present, responsive, following the client wherever they need to go.
            </p>
            <p className="text-xl font-semibold text-primary mt-6">
              But your clients need reinforcement between sessions.
            </p>
            <p>
              And you need <strong>direct suggestion scripts</strong> for:
            </p>
            <ul className="space-y-2">
              <li>The installation phase after insight work</li>
              <li>Client self-hypnosis at home</li>
              <li>Reinforcing breakthroughs between sessions</li>
              <li>Building confidence, relaxation, and new patterns</li>
            </ul>
            <p className="text-xl font-semibold mt-6">Right now, you have two options:</p>
            <div className="grid md:grid-cols-2 gap-6 mt-6 not-prose">
              <div className="p-6 border rounded-lg bg-card">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-destructive" />
                  Generic Pre-Made Scripts
                </h3>
                <p className="text-muted-foreground">
                  "Stop Smoking Script #3" that doesn't fit YOUR client with THEIR specific situation and desired outcomes
                </p>
              </div>
              <div className="p-6 border rounded-lg bg-card">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-destructive" />
                  Make Them Yourself
                </h3>
                <p className="text-muted-foreground">
                  Which takes hours per client, and you're not sure you're covering everything they need
                </p>
              </div>
            </div>
            <p className="text-center text-lg font-semibold mt-6">Neither option is ideal.</p>
          </div>
        </section>

        {/* What You Need Section */}
        <section className="mb-16 bg-primary/5 -mx-4 md:-mx-0 p-8 rounded-lg">
          <h2 className="text-3xl font-bold mb-6">What You Actually Need</h2>
          <p className="text-lg mb-6">A way to create a complete script package for each client that:</p>
          <div className="space-y-4">
            {[
              "Matches their specific issue - Stop smoking with stress triggers? Weight loss with emotional eating? Confidence for job interviews?",
              "Honors their desired outcomes - Their words, their goals, their vision",
              "Covers the full journey - Not just one script, but a strategic collection",
              "Is ready to use - For you to read in session or record for them to use at home",
              "Takes minutes, not hours - So you can focus on the live work"
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-1" />
                <p className="text-lg">{item}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Example Use Case */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">How It Works</h2>
          <div className="bg-card border rounded-lg p-8">
            <h3 className="text-2xl font-bold mb-4">Meet Linda (Stop Smoking Client)</h3>
            
            <div className="mb-6">
              <h4 className="font-semibold text-lg mb-3">Linda inputs:</h4>
              <ul className="space-y-2 ml-6">
                <li><strong>Issue:</strong> Stop smoking</li>
                <li><strong>Context:</strong> Smokes when stressed at work, uses cigarettes for breaks</li>
                <li><strong>Desired Outcomes:</strong> Healthy, free, breathing easy, taking real breaks</li>
                <li><strong>Client Overview:</strong> High achiever, perfectionist tendencies, wants to feel in control</li>
              </ul>
            </div>

            <div className="flex items-center justify-center my-6">
              <ArrowRight className="w-8 h-8 text-primary" />
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">HypnoBrain generates a custom package of 10 scripts:</h4>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="p-4 bg-background rounded-lg">
                  <p className="font-semibold mb-2">Relaxation Foundation (2 scripts)</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Deep relaxation for stress management</li>
                    <li>• Body-based calm for anxiety relief</li>
                  </ul>
                </div>
                <div className="p-4 bg-background rounded-lg">
                  <p className="font-semibold mb-2">Confidence Building (2 scripts)</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Confidence in making healthy choices</li>
                    <li>• Self-trust and inner strength</li>
                  </ul>
                </div>
                <div className="p-4 bg-background rounded-lg">
                  <p className="font-semibold mb-2">Core Transformation (4 scripts)</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• The Rebel pattern (smoking as autonomy)</li>
                    <li>• Honoring cigarettes (gratitude before release)</li>
                    <li>• New responses to stress triggers</li>
                    <li>• Future self as non-smoker</li>
                  </ul>
                </div>
                <div className="p-4 bg-background rounded-lg">
                  <p className="font-semibold mb-2">Values & Aspirational (2 scripts)</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Living in alignment with health values</li>
                    <li>• The free, breathing, vibrant version</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Real Use Cases */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">The Real Use Cases</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: "Client Self-Hypnosis Library",
                description: "Record the package. Client listens at home between sessions for daily reinforcement."
              },
              {
                title: "Post-Insight Installation",
                description: "After live insight work, select relevant scripts to read as direct suggestion in their most receptive state."
              },
              {
                title: "Session Preparation",
                description: "Before client arrives, you have scripts ready that match their journey and know which patterns you'll weave in."
              },
              {
                title: "Progressive Journey",
                description: "Strategic sequencing over multiple sessions - relaxation, confidence, transformation, values."
              }
            ].map((useCase, i) => (
              <div key={i} className="p-6 border rounded-lg bg-card">
                <h3 className="text-lg font-semibold mb-3">{useCase.title}</h3>
                <p className="text-muted-foreground">{useCase.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Why Package Section */}
        <section className="mb-16 bg-primary/5 -mx-4 md:-mx-0 p-8 rounded-lg">
          <h2 className="text-3xl font-bold mb-6">Why A Package, Not Just One Script</h2>
          <p className="text-lg mb-6">Clients need different tools for different moments:</p>
          <div className="space-y-3">
            <p><strong>When they're anxious</strong> → Relaxation script</p>
            <p><strong>Before a challenge</strong> → Confidence script</p>
            <p><strong>Daily reinforcement</strong> → Core transformation</p>
            <p><strong>When motivation wanes</strong> → Aspirational script</p>
          </div>
          <p className="text-xl font-semibold mt-6 text-center">
            One script isn't enough. A strategic collection serves the full journey.
          </p>
        </section>

        {/* What Makes Different */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">What Makes This Different</h2>
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 border rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <XCircle className="w-5 h-5 text-destructive" />
                  <h3 className="font-semibold">NOT Generic Scripts</h3>
                </div>
                <p className="text-muted-foreground">"Stop Smoking Script #3" that mentions nothing about Linda's work stress or need for real breaks</p>
              </div>
              <div className="p-6 border rounded-lg bg-primary/5">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Custom to YOUR Client</h3>
                </div>
                <p>Scripts that include HER context, HER language, HER desired outcomes</p>
              </div>
              <div className="p-6 border rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <XCircle className="w-5 h-5 text-destructive" />
                  <h3 className="font-semibold">NOT One-Size-Fits-All</h3>
                </div>
                <p className="text-muted-foreground">Single script approach</p>
              </div>
              <div className="p-6 border rounded-lg bg-primary/5">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Strategic Package</h3>
                </div>
                <p>Complete collection covering relaxation, confidence, transformation, values</p>
              </div>
              <div className="p-6 border rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <XCircle className="w-5 h-5 text-destructive" />
                  <h3 className="font-semibold">NOT Time-Consuming</h3>
                </div>
                <p className="text-muted-foreground">Hours writing scripts yourself</p>
              </div>
              <div className="p-6 border rounded-lg bg-primary/5">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Fast Creation</h3>
                </div>
                <p>10-15 minutes input → Complete package ready to use</p>
              </div>
            </div>
          </div>
        </section>

        {/* Patterns Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">The Patterns You're Deploying</h2>
          <p className="text-lg mb-6">You already know some of these intuitively:</p>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {[
              "Effortlessness - Change happens naturally",
              "Re-Minding - Body remembers peace",
              "Recognition - You're more capable than you know",
              "The Rebel - Give rebellion a promotion",
              "Honoring the Substance - Thank it before releasing",
              "Earned Delight - Joy becomes the reward"
            ].map((pattern, i) => (
              <div key={i} className="p-4 border rounded-lg bg-card">
                <p className="font-medium">{pattern}</p>
              </div>
            ))}
          </div>
          <div className="bg-primary/5 p-6 rounded-lg">
            <p className="text-lg font-semibold mb-3">HypnoBrain ensures:</p>
            <ul className="space-y-2">
              <li>• The RIGHT patterns for THIS issue</li>
              <li>• Proper sequencing across the package</li>
              <li>• Strategic depth in each script</li>
              <li>• Language that makes them land</li>
            </ul>
            <p className="mt-6 text-lg">
              So instead of hoping you remember the good patterns, you're deploying a complete strategic approach.
            </p>
          </div>
        </section>

        {/* For Your Practice */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">For Your Practice</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 border rounded-lg bg-card">
              <h3 className="text-lg font-semibold mb-3">Better Client Outcomes</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Comprehensive reinforcement</li>
                <li>• Tools for different moments</li>
                <li>• Strategic progression</li>
                <li>• Professional library</li>
              </ul>
            </div>
            <div className="p-6 border rounded-lg bg-card">
              <h3 className="text-lg font-semibold mb-3">More Efficient Practice</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• 10-15 min vs hours</li>
                <li>• Prepared before arrival</li>
                <li>• Focus on insight work</li>
                <li>• Confident installation</li>
              </ul>
            </div>
            <div className="p-6 border rounded-lg bg-card">
              <h3 className="text-lg font-semibold mb-3">Professional Polish</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Consistent quality</li>
                <li>• Strategic coherence</li>
                <li>• Professional recordings</li>
                <li>• Ready for any direction</li>
              </ul>
            </div>
          </div>
        </section>

        {/* What Makes You Irreplaceable */}
        <section className="mb-16 bg-gradient-to-br from-primary/10 to-primary/5 -mx-4 md:-mx-0 p-8 rounded-lg">
          <h2 className="text-3xl font-bold mb-6">What Makes You Irreplaceable</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">HypnoBrain can't do the real work:</h3>
              <ul className="space-y-3">
                {[
                  "Live insight work - Age regression, chair therapy, parts integration",
                  "Hold the state - Your nervous system regulates theirs",
                  "Read the room - Know when to push, when to pause",
                  "Witness deeply - The healing relationship",
                  "Improvise from instinct - Follow the energy in the moment"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <XCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">But HypnoBrain CAN:</h3>
              <ul className="space-y-3">
                {[
                  "Create comprehensive script packages fast",
                  "Deploy strategic patterns you might forget",
                  "Give clients professional tools for home use",
                  "Make your preparation and installation more powerful"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="text-xl font-semibold text-center mt-8">
            The insight work is yours. The script library can be optimized.
          </p>
        </section>

        {/* CTA Section */}
        <section className="mb-16 text-center">
          <h2 className="text-3xl font-bold mb-6">The Proposition</h2>
          <div className="max-w-2xl mx-auto space-y-6">
            <p className="text-lg">
              You're brilliant at the live insight work.
            </p>
            <p className="text-lg">
              <strong>But creating comprehensive script packages for each client?</strong> That's hours you don't have. Or you're using generic scripts that don't quite fit.
            </p>
            <div className="bg-primary/5 p-8 rounded-lg my-8">
              <p className="text-xl font-semibold mb-4">What if you could:</p>
              <ul className="space-y-3 text-left max-w-xl mx-auto">
                <li>• Input basic client info and desired outcomes</li>
                <li>• Get a strategic package of 10 scripts in minutes</li>
                <li>• Have tools ready for any session direction</li>
                <li>• Give clients a professional reinforcement library</li>
                <li>• Focus your time on the work only you can do</li>
              </ul>
            </div>
            <p className="text-2xl font-bold">That's HypnoBrain.</p>
            <p className="text-lg text-muted-foreground">
              Not replacing your artistry. Giving you the tools that amplify it.
            </p>
            <div className="pt-8">
              <Link href="/app-v2">
                <Button size="lg" className="text-lg px-8" data-testid="button-start-creating-cta">
                  Start Creating
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="text-center py-12 border-t">
          <h2 className="text-2xl font-bold mb-4">
            Because your clients deserve more than generic scripts.
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            And you deserve tools that match the quality of your live work.
          </p>
          <p className="text-xl font-semibold mb-2">Welcome to HypnoBrain.</p>
          <p className="text-lg text-muted-foreground">
            Custom script packages for your clients in minutes.
          </p>
        </section>

        {/* Footer Note */}
        <footer className="text-center text-sm text-muted-foreground italic py-8 border-t">
          <p>Built by a hypnotist who got tired of spending hours writing scripts.</p>
          <p className="mt-2">Designed for practitioners who do real insight work and want professional tools that match.</p>
        </footer>
      </div>
    </div>
  );
}
