import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, Sparkles, Sliders, Zap, Check, Play, FileText, Wand2 } from "lucide-react";
import { AppHeader } from "@/components/app-header";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader showAuth={true} showDreamLink={true} showAdminLink={true} />

      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <Sparkles className="w-4 h-4 text-primary" data-testid="icon-framework-badge" />
            <span className="text-sm text-primary">Powered by Erika Flint's 8D Hypnosis Framework</span>
          </div>
          
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Professional Hypnosis Scripts
            </span>
            <br />
            <span className="text-primary">In Minutes, Not Hours</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto">
            Choose from expert-crafted templates or build your own custom mix. Generate therapeutic scripts tailored to your client's needs.
          </p>

          {/* Three Option Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Option 1: Free Weekly */}
            <Card className="p-8 hover-elevate transition-all duration-200" data-testid="card-free-option">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Zap className="w-8 h-8 text-primary" data-testid="icon-free" />
                </div>
              </div>
              <h3 className="font-display text-2xl font-semibold mb-2">Try It Free</h3>
              <p className="text-muted-foreground mb-6">
                Get one complete script this week. No credit card needed.
              </p>
              <Link href="/free" data-testid="link-free">
                <Button className="w-full" size="lg" data-testid="button-start-free">
                  Start Free
                </Button>
              </Link>
            </Card>

            {/* Option 2: Create Custom */}
            <Card className="p-8 border-2 border-primary relative hover-elevate transition-all duration-200" data-testid="card-create-option">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                Most Popular
              </div>
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Sliders className="w-8 h-8 text-primary" data-testid="icon-create" />
                </div>
              </div>
              <h3 className="font-display text-2xl font-semibold mb-2">Create Custom</h3>
              <p className="text-muted-foreground mb-6">
                Full customization with templates, dimension mixing, and marketing assets.
              </p>
              <Link href="/app-v2" data-testid="link-create">
                <Button className="w-full" size="lg" data-testid="button-create-custom">
                  Create Script - $3
                </Button>
              </Link>
            </Card>

            {/* Option 3: Remix Existing */}
            <Card className="p-8 hover-elevate transition-all duration-200" data-testid="card-remix-option">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Wand2 className="w-8 h-8 text-primary" data-testid="icon-remix" />
                </div>
              </div>
              <h3 className="font-display text-2xl font-semibold mb-2">Remix Script</h3>
              <p className="text-muted-foreground mb-6">
                Transform existing scripts with templates. Adjust emphasis, add depth.
              </p>
              <Link href="/app-v2?mode=remix" data-testid="link-remix">
                <Button className="w-full" variant="outline" size="lg" data-testid="button-remix-existing">
                  Remix Script - $3
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works - Template Focus */}
      <section className="py-20 px-6 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-4">
            Template-Powered Workflow
          </h2>
          <p className="text-center text-muted-foreground mb-16 max-w-2xl mx-auto">
            Our intelligent system recommends the perfect template based on your client's needs, then lets you customize every dimension.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center" data-testid="step-describe">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-xl mb-2">1. Describe Your Client</h3>
              <p className="text-muted-foreground">
                Share the presenting issue, desired outcome, and any notes. Our AI analyzes the context.
              </p>
            </div>

            <div className="text-center" data-testid="step-choose">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-xl mb-2">2. Choose a Template</h3>
              <p className="text-muted-foreground">
                Browse recommended templates or start from scratch. Preview dimension emphasis for each.
              </p>
            </div>

            <div className="text-center" data-testid="step-customize">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Sliders className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-xl mb-2">3. Customize & Generate</h3>
              <p className="text-muted-foreground">
                Adjust dimension sliders, select style and archetype, then generate your complete script.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Eight Dimensions */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-4">
            Eight Dimensions of Hypnotic Language
          </h2>
          <p className="text-center text-muted-foreground mb-16 max-w-2xl mx-auto">
            Every script is crafted using Erika Flint's 8D Framework - each dimension can be emphasized independently.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Somatic", desc: "Body awareness, breath, physical sensations", color: "bg-blue-500/10" },
              { name: "Temporal", desc: "Time-based work, regression/progression", color: "bg-purple-500/10" },
              { name: "Symbolic", desc: "Metaphors, imagery, archetypal stories", color: "bg-pink-500/10" },
              { name: "Psychological", desc: "Inner architecture, beliefs, patterns", color: "bg-orange-500/10" },
              { name: "Perspective", desc: "Point of view shifts for insight", color: "bg-teal-500/10" },
              { name: "Spiritual", desc: "Transpersonal meaning and purpose", color: "bg-indigo-500/10" },
              { name: "Relational", desc: "Connection, belonging, dialogue", color: "bg-green-500/10" },
              { name: "Language", desc: "Hypnotic phrasing and embedded suggestions", color: "bg-amber-500/10" },
            ].map((dim) => (
              <Card 
                key={dim.name} 
                className="p-6"
                data-testid={`dimension-${dim.name.toLowerCase()}`}
              >
                <div className={`w-12 h-12 rounded-lg ${dim.color} flex items-center justify-center mb-3`}>
                  <Brain className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{dim.name}</h3>
                <p className="text-sm text-muted-foreground">{dim.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 px-6 bg-card/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-16">
            Choose Your Plan
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Free Tier */}
            <Card className="p-8" data-testid="pricing-free">
              <div className="mb-6">
                <h3 className="font-display text-2xl font-bold mb-2">Free Weekly</h3>
                <p className="text-4xl font-bold mb-2">$0</p>
                <p className="text-muted-foreground text-sm">One script per week</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2" data-testid="feature-free-length">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">1500-2000 word script</span>
                </li>
                <li className="flex items-start gap-2" data-testid="feature-free-template">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">Default template (Somatic Beginner)</span>
                </li>
                <li className="flex items-start gap-2" data-testid="feature-free-rate-limit">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">7-day rate limit</span>
                </li>
              </ul>
              
              <Link href="/free" data-testid="link-pricing-free">
                <Button variant="outline" className="w-full" data-testid="button-pricing-free">
                  Start Free
                </Button>
              </Link>
            </Card>

            {/* Create Tier */}
            <Card className="p-8 border-2 border-primary relative" data-testid="pricing-create">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                Recommended
              </div>
              <div className="mb-6">
                <h3 className="font-display text-2xl font-bold mb-2">Create Custom</h3>
                <p className="text-4xl font-bold mb-2">$3</p>
                <p className="text-muted-foreground text-sm">Per script generation</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2" data-testid="feature-create-templates">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">Browse expert templates</span>
                </li>
                <li className="flex items-start gap-2" data-testid="feature-create-dimensions">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">8-dimension mixer control</span>
                </li>
                <li className="flex items-start gap-2" data-testid="feature-create-assets">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">6 marketing assets included</span>
                </li>
                <li className="flex items-start gap-2" data-testid="feature-create-save">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">Save your own templates</span>
                </li>
                <li className="flex items-start gap-2" data-testid="feature-create-download">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">PDF/Word download</span>
                </li>
              </ul>
              
              <Link href="/app-v2" data-testid="link-pricing-create">
                <Button className="w-full" data-testid="button-pricing-create">
                  Create Custom Script
                </Button>
              </Link>
            </Card>

            {/* Remix Tier */}
            <Card className="p-8" data-testid="pricing-remix">
              <div className="mb-6">
                <h3 className="font-display text-2xl font-bold mb-2">Remix Script</h3>
                <p className="text-4xl font-bold mb-2">$3</p>
                <p className="text-muted-foreground text-sm">Per remix generation</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2" data-testid="feature-remix-analyze">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">AI dimension analysis</span>
                </li>
                <li className="flex items-start gap-2" data-testid="feature-remix-template">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">Apply any template</span>
                </li>
                <li className="flex items-start gap-2" data-testid="feature-remix-compare">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">Before/after comparison</span>
                </li>
                <li className="flex items-start gap-2" data-testid="feature-remix-assets">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">6 marketing assets</span>
                </li>
                <li className="flex items-start gap-2" data-testid="feature-remix-download">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">PDF/Word download</span>
                </li>
              </ul>
              
              <Link href="/app-v2?mode=remix" data-testid="link-pricing-remix">
                <Button variant="outline" className="w-full" data-testid="button-pricing-remix">
                  Remix Existing Script
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Practice?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join hypnotherapists who are saving hours with intelligent, template-powered script generation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/free" data-testid="link-cta-free">
              <Button size="lg" data-testid="button-cta-free">
                <Zap className="w-5 h-5 mr-2" />
                Try Free This Week
              </Button>
            </Link>
            <Link href="/app-v2" data-testid="link-cta-create">
              <Button size="lg" variant="outline" data-testid="button-cta-create">
                <Sliders className="w-5 h-5 mr-2" />
                Create Custom Script
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
