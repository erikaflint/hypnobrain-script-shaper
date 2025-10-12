import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, Sparkles, Sliders, Zap, Check, X } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary">Based on Erika Flint's 8D Hypnosis Framework</span>
          </div>
          
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            DAW-Style Hypnosis<br />Script Generation
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto">
            Mix eight dimensions like a Digital Audio Workstation to craft the perfect therapeutic script for your clients
          </p>
          
          {/* Primary CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link href="/free" data-testid="link-get-free-script">
              <Button 
                size="lg" 
                data-testid="button-get-free-script"
              >
                <Zap className="w-5 h-5 mr-2" />
                Get Your Free Script This Week
              </Button>
            </Link>
            <Link href="/app" data-testid="link-create-new">
              <Button 
                size="lg" 
                variant="outline" 
                data-testid="button-create-new"
              >
                <Sliders className="w-5 h-5 mr-2" />
                Create New Script ($3)
              </Button>
            </Link>
          </div>
          
          <Link href="/app?mode=remix" data-testid="link-remix-existing">
            <Button 
              variant="ghost" 
              className="text-muted-foreground"
              data-testid="button-remix-existing"
            >
              Or remix an existing script →
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-16">
            Mix Eight Dimensions of Hypnotic Language
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Somatic", desc: "Body awareness & physical sensations", enabled: true },
              { name: "Language", desc: "Hypnotic patterns & embedded suggestions", enabled: true },
              { name: "Symbolic", desc: "Metaphors & archetypal themes", enabled: true },
              { name: "Psychological", desc: "Inner architecture & beliefs", enabled: true },
              { name: "Temporal", desc: "Time-based work & regression", enabled: false },
              { name: "Perspective", desc: "Point of view shifts", enabled: false },
              { name: "Relational", desc: "Connection & dialogue", enabled: false },
              { name: "Spiritual", desc: "Transpersonal connection", enabled: false },
            ].map((dim) => (
              <Card 
                key={dim.name} 
                className={`p-6 ${!dim.enabled ? 'opacity-50' : ''}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg">{dim.name}</h3>
                  {!dim.enabled && (
                    <span className="text-xs text-muted-foreground px-2 py-1 rounded bg-muted">
                      Coming Soon
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{dim.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 px-6 bg-card/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-16">
            Choose Your Plan
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Free Tier */}
            <Card className="p-8">
              <h3 className="font-display text-2xl font-bold mb-2">Free Weekly</h3>
              <p className="text-3xl font-bold mb-6">$0</p>
              <p className="text-muted-foreground mb-6">Try it risk-free, one per week</p>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">Full 800-1000 word script</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">Email delivery</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">No dimension control</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">No marketing assets</span>
                </li>
              </ul>
              
              <Link href="/free" data-testid="link-free-tier-card">
                <Button className="w-full" variant="outline" data-testid="button-free-tier">
                  Get Free Script
                </Button>
              </Link>
            </Card>

            {/* Create New */}
            <Card className="p-8 border-primary relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                Most Popular
              </div>
              <h3 className="font-display text-2xl font-bold mb-2">Create New</h3>
              <p className="text-3xl font-bold mb-6">$3</p>
              <p className="text-muted-foreground mb-6">Full control from scratch</p>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">8 dimension sliders</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">6 archetype options</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">3 style approaches</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">6 marketing assets</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">PDF/Word download</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">Unlimited previews</span>
                </li>
              </ul>
              
              <Link href="/app" data-testid="link-create-new-card">
                <Button className="w-full" data-testid="button-create-new-paid">
                  Create New Script
                </Button>
              </Link>
            </Card>

            {/* Remix Mode */}
            <Card className="p-8">
              <h3 className="font-display text-2xl font-bold mb-2">Remix Mode</h3>
              <p className="text-3xl font-bold mb-6" data-testid="text-remix-price">$3</p>
              <p className="text-muted-foreground mb-6">Transform existing scripts</p>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">AI dimension analysis</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">Adjust emphasis</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">Before/after comparison</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">6 marketing assets</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">PDF/Word download</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">Keep remixing freely</span>
                </li>
              </ul>
              
              <Link href="/app?mode=remix" data-testid="link-remix-card">
                <Button className="w-full" variant="outline" data-testid="button-remix-paid">
                  Remix Script
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t">
        <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground space-y-2">
          <p>Based on the 8-Dimensional Hypnosis Framework by Erika Flint</p>
          <Link href="/admin" data-testid="link-admin">
            <Button variant="link" size="sm" className="text-xs text-muted-foreground" data-testid="button-admin">
              Admin Dashboard
            </Button>
          </Link>
        </div>
      </footer>
    </div>
  );
}
