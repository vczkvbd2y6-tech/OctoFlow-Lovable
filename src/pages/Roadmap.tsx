import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Clock, CheckCircle, Send, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface FeatureRequest {
  id: string;
  original_request: string;
  rewritten_request: string;
  status: 'requested' | 'in_progress' | 'available_soon' | 'approved' | 'denied';
  created_at: string;
  user_id: string;
}

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_AI_API_KEY);

export default function Roadmap() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<FeatureRequest[]>([]);
  const [newRequest, setNewRequest] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from('feature_requests')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching requests:', error);
    } else {
      setRequests(data || []);
    }
    setLoading(false);
  };

  const rewriteRequest = async (text: string): Promise<string> => {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const prompt = `Rewrite the following feature request to sound professional and clear: "${text}"`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Error rewriting request:', error);
      return text; // Fallback to original
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRequest.trim() || !user) return;

    setIsSubmitting(true);
    try {
      const rewritten = await rewriteRequest(newRequest);
      const { error } = await supabase
        .from('feature_requests')
        .insert({
          user_id: user.id,
          original_request: newRequest,
          rewritten_request: rewritten,
          status: 'requested'
        });

      if (error) throw error;

      setNewRequest('');
      alert('Feature request submitted successfully!');
    } catch (error) {
      console.error('Error submitting request:', error);
      alert('Failed to submit request. Please try again.');
    }
    setIsSubmitting(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'requested':
        return <Sparkles className="size-4 text-[var(--color-emphasis)]" />;
      case 'in_progress':
        return <Clock className="size-4 text-[var(--color-primary)]" />;
      case 'available_soon':
        return <CheckCircle className="size-4 text-[var(--color-accent-green)]" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'requested':
        return 'bg-[var(--color-emphasis)]/10 text-[var(--color-emphasis)]';
      case 'in_progress':
        return 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]';
      case 'available_soon':
        return 'bg-[var(--color-accent-green)]/10 text-[var(--color-accent-green)]';
      default:
        return 'bg-[var(--bg-surface)] text-[var(--text-muted)]';
    }
  };

  const requestedFeatures = requests.filter(r => r.status === 'requested');
  const inProgressFeatures = requests.filter(r => r.status === 'in_progress');
  const availableSoonFeatures = requests.filter(r => r.status === 'available_soon');

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="border-b border-[var(--border-default)] bg-gradient-to-b from-[var(--bg-overlay)] to-[var(--bg-base)]">
        <div className="mx-auto max-w-4xl px-4 py-16 lg:px-8 lg:py-20">
          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 mb-4">
              <Sparkles className="size-4 text-[var(--color-emphasis)]" />
              <span className="text-xs font-semibold uppercase text-[var(--color-emphasis)]">Roadmap</span>
            </div>
            <h1 className="font-display text-4xl font-bold text-[var(--text-default)] mb-4 text-balance">
              What's Coming Next
            </h1>
            <p className="text-base text-[var(--text-subtle)] max-w-2xl mx-auto text-pretty leading-relaxed">
              See our development roadmap and help shape the future of OctoFlow by submitting your feature requests.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Tiles */}
      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="size-5 text-[var(--color-emphasis)]" />
                Requested Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="size-6 animate-spin" />
                </div>
              ) : requestedFeatures.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)]">No features requested yet.</p>
              ) : (
                <div className="space-y-3">
                  {requestedFeatures.slice(0, 5).map((request) => (
                    <div key={request.id} className="rounded-lg border border-[var(--border-default)] p-3">
                      <p className="text-sm text-[var(--text-default)]">{request.rewritten_request}</p>
                      <Badge className={`mt-2 text-xs ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1">Requested</span>
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="size-5 text-[var(--color-primary)]" />
                In Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="size-6 animate-spin" />
                </div>
              ) : inProgressFeatures.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)]">No features in progress.</p>
              ) : (
                <div className="space-y-3">
                  {inProgressFeatures.slice(0, 5).map((request) => (
                    <div key={request.id} className="rounded-lg border border-[var(--border-default)] p-3">
                      <p className="text-sm text-[var(--text-default)]">{request.rewritten_request}</p>
                      <Badge className={`mt-2 text-xs ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1">In Progress</span>
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="size-5 text-[var(--color-accent-green)]" />
                Available Soon
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="size-6 animate-spin" />
                </div>
              ) : availableSoonFeatures.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)]">No features available soon.</p>
              ) : (
                <div className="space-y-3">
                  {availableSoonFeatures.slice(0, 5).map((request) => (
                    <div key={request.id} className="rounded-lg border border-[var(--border-default)] p-3">
                      <p className="text-sm text-[var(--text-default)]">{request.rewritten_request}</p>
                      <Badge className={`mt-2 text-xs ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1">Available Soon</span>
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Submit Request Section */}
      <section className="border-t border-[var(--border-default)] bg-[var(--bg-elevated)]">
        <div className="mx-auto max-w-4xl px-4 py-16 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl font-bold text-[var(--text-default)] mb-2">Submit a Feature Request</h2>
            <p className="text-sm text-[var(--text-muted)]">Help us improve OctoFlow by suggesting new features or improvements.</p>
          </div>

          {user ? (
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
              <Textarea
                value={newRequest}
                onChange={(e) => setNewRequest(e.target.value)}
                placeholder="Describe the feature you'd like to see..."
                className="min-h-[120px] mb-4"
                required
              />
              <Button type="submit" disabled={isSubmitting} className="w-full gap-2">
                {isSubmitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
                Submit Request
              </Button>
            </form>
          ) : (
            <div className="text-center">
              <p className="text-sm text-[var(--text-muted)] mb-4">Please sign in to submit feature requests.</p>
              <Link to="/auth">
                <Button>Sign In</Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}