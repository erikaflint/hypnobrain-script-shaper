import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Brain, Home, LayoutDashboard, LogIn, LogOut, ArrowLeft, Wand2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export interface AppHeaderProps {
  variant?: 'landing' | 'app' | 'simple';
  showBack?: boolean;
  backUrl?: string;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  showAuth?: boolean;
  showDashboard?: boolean;
  showCreateScript?: boolean;
  rightContent?: React.ReactNode;
}

export function AppHeader({
  variant = 'simple',
  showBack = false,
  backUrl = '/',
  title,
  subtitle,
  icon,
  showAuth = false,
  showDashboard = false,
  showCreateScript = false,
  rightContent,
}: AppHeaderProps) {
  const { user, isLoading: authLoading } = useAuth();

  return (
    <header className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {showBack ? (
            <Link href={backUrl} data-testid="link-back">
              <Button variant="ghost" size="sm" data-testid="button-back">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
          ) : (
            <Link href="/" data-testid="link-home">
              <div className="flex items-center gap-2 hover-elevate active-elevate-2 px-3 py-1 rounded-md transition-colors">
                <Brain className="w-6 h-6 text-primary" data-testid="icon-logo" />
                <span className="font-display font-bold text-lg">HypnoBrain</span>
              </div>
            </Link>
          )}

          {title && (
            <div className="flex items-center gap-2">
              {icon}
              <div>
                <h1 className="font-semibold text-lg">{title}</h1>
                {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
              </div>
            </div>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {rightContent}

          {showDashboard && (
            <Link href="/dashboard" data-testid="link-dashboard">
              <Button variant="ghost" size="sm" data-testid="button-dashboard">
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
          )}

          {showCreateScript && (
            <Link href="/app-v2" data-testid="link-create-script">
              <Button variant="default" size="sm" data-testid="button-create-script">
                <Wand2 className="w-4 h-4 mr-2" />
                Create Script
              </Button>
            </Link>
          )}

          {showAuth && !authLoading && (
            <>
              {user ? (
                <>
                  {!showDashboard && (
                    <Link href="/dashboard" data-testid="link-dashboard">
                      <Button variant="ghost" size="sm" data-testid="button-dashboard">
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Dashboard
                      </Button>
                    </Link>
                  )}
                  <a href="/api/auth/logout" data-testid="link-logout">
                    <Button variant="outline" size="sm" data-testid="button-logout">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </a>
                </>
              ) : (
                <a href="/api/auth/login" data-testid="link-login">
                  <Button variant="default" size="sm" data-testid="button-login">
                    <LogIn className="w-4 h-4 mr-2" />
                    Login
                  </Button>
                </a>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
