import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import SkillCard from '@/components/SkillCard';
import { api } from '@/utils/api';
import { invitationApi } from '@/utils/invitationApi';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ArrowRight, Loader2, Sparkles, Plus } from 'lucide-react';

/**
 * Youdemy-inspired dashboard:
 *  - "Today's lesson" hero card resuming the last-viewed skill.
 *  - "New course from a URL" quick-import row that creates a skill from a link.
 *  - "My library" grid of skills, plus optional "Shared with you" section.
 * When signed out, shows the marketing hero from the reference site.
 */
const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const { data: skills = [], isLoading, refetch } = useQuery({
    queryKey: ['skills', user?.id],
    queryFn: api.getSkills,
    enabled: !!user,
  });

  const { data: sharedSkills = [] } = useQuery({
    queryKey: ['shared-skills', user?.id],
    queryFn: invitationApi.getSharedSkills,
    enabled: !!user,
  });

  const hasSkills = skills.length > 0;

  // Most recent skill = "today's lesson" candidate
  const todaysLesson = hasSkills
    ? [...skills].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )[0]
    : null;
  const nextPlaylist =
    todaysLesson && todaysLesson.playlists.length > 0
      ? [...todaysLesson.playlists]
          .sort((a, b) => a.position - b.position)
          .find((p) => !p.isCompleted) ?? todaysLesson.playlists[0]
      : null;
  const completedCount = todaysLesson?.playlists.filter((p) => p.isCompleted).length ?? 0;
  const totalCount = todaysLesson?.playlists.length ?? 0;
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setIsCreating(true);
    try {
      const skill = await api.createSkill(name, newDesc.trim());
      toast.success('Course created');
      setNewName('');
      setNewDesc('');
      setCreateOpen(false);
      refetch();
      navigate(`/skill/${skill.id}`);
    } catch (err) {
      console.error(err);
      toast.error('Could not create course. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      {/* Warm amber glow behind the top of the page */}
      <div aria-hidden className="absolute inset-x-0 top-0 h-[420px] amber-glow pointer-events-none" />

      <Header />

      <main className="relative flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-24 pb-20">
        {/* ============ Signed-out marketing hero ============ */}
        {!authLoading && !user && (
          <section className="pt-6 sm:pt-16 pb-16 text-center max-w-3xl mx-auto">
            <div className="eyebrow inline-flex items-center gap-2 justify-center mb-6">
              <Sparkles className="w-3 h-3" /> Free forever · No credit card
            </div>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl leading-[1.05] text-foreground mb-6">
              Turn any playlist into a course<br />
              <span className="text-primary">you'll actually finish.</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground mb-10 leading-relaxed max-w-xl mx-auto">
              Paste a link. Get a tracked mini-course. Earn XP for every minute you watch,
              capture notes timestamped to the second, and climb a global leaderboard of
              weekly hours.
            </p>
            <Link to="/auth">
              <Button className="h-12 px-7 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 font-medium text-base">
                Convert <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
            <p className="mt-4 text-xs text-muted-foreground">
              · No credit card · Works with any public playlist
            </p>
          </section>
        )}

        {/* ============ Signed-in dashboard ============ */}
        {user && (
          <>
            {/* Today's Lesson hero — only when there is something to resume */}
            {todaysLesson && nextPlaylist && (
              <section className="mb-10">
                <Link
                  to={`/skill/${todaysLesson.id}`}
                  className="group block rounded-lg border border-border hover:border-primary/40 bg-card overflow-hidden transition-colors"
                >
                  <div className="p-6 sm:p-8">
                    <p className="eyebrow mb-4">Today's Lesson</p>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
                      {todaysLesson.name}
                    </p>
                    <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-foreground mb-6 group-hover:text-primary transition-colors leading-tight">
                      {nextPlaylist.title}
                    </h2>

                    {/* Progress bar row */}
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-muted-foreground shrink-0">
                        {completedCount}/{totalCount} videos
                      </span>
                      <div className="flex-1 h-1 bg-border/60 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-8 text-right">{percent}%</span>
                      <span className="inline-flex items-center gap-1 rounded-md bg-primary/15 text-primary text-xs font-medium px-2.5 py-1 shrink-0">
                        Resume <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              </section>
            )}

            {/* Create new course */}
            <section className="mb-14">
              <div className="rounded-lg border border-border bg-card p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="eyebrow mb-2">Start a new course</p>
                  <p className="text-sm text-muted-foreground">
                    Create a course, then fill it with YouTube playlists to track.
                  </p>
                </div>
                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                  <DialogTrigger asChild>
                    <Button className="h-11 px-6 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 font-medium inline-flex items-center gap-1.5 shrink-0">
                      <Plus className="w-4 h-4" /> Create course
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="font-display text-2xl">New course</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateCourse} className="space-y-4 pt-2">
                      <div className="space-y-1.5">
                        <label className="text-xs uppercase tracking-wider text-muted-foreground">Course name</label>
                        <Input
                          autoFocus
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          placeholder="e.g. Master React in 30 days"
                          disabled={isCreating}
                          required
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs uppercase tracking-wider text-muted-foreground">Description (optional)</label>
                        <Textarea
                          value={newDesc}
                          onChange={(e) => setNewDesc(e.target.value)}
                          placeholder="What is this course about?"
                          disabled={isCreating}
                          rows={3}
                        />
                      </div>
                      <DialogFooter>
                        <Button
                          type="submit"
                          disabled={isCreating || !newName.trim()}
                          className="h-11 px-6 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
                        >
                          {isCreating ? (
                            <span className="inline-flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" /> Creating…
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5">
                              Create <ArrowRight className="w-4 h-4" />
                            </span>
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </section>


            {/* My library */}
            <section>
              <div className="flex items-end justify-between mb-6 pb-3 border-b border-border/60">
                <h2 className="font-display text-2xl sm:text-3xl text-foreground">My library</h2>
                <span className="text-xs text-muted-foreground">
                  {skills.length} {skills.length === 1 ? 'course' : 'courses'}
                </span>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-[260px] rounded-lg bg-card border border-border animate-pulse" />
                  ))}
                </div>
              ) : !hasSkills ? (
                <div className="rounded-lg border border-dashed border-border bg-card/50 py-16 px-6 text-center">
                  <h3 className="font-display text-2xl text-foreground mb-2">Your library is empty</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Paste any YouTube playlist link above to create your first tracked course.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {skills.map((skill) => (
                    <SkillCard key={skill.id} skill={skill} onUpdate={() => refetch()} />
                  ))}
                </div>
              )}
            </section>

            {sharedSkills.length > 0 && (
              <section className="mt-16">
                <div className="flex items-end justify-between mb-6 pb-3 border-b border-border/60">
                  <h2 className="font-display text-2xl sm:text-3xl text-foreground">Shared with you</h2>
                  <span className="text-xs text-muted-foreground">{sharedSkills.length}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {sharedSkills.map((skill: any) => (
                    <div key={skill.id} className="relative">
                      <span className="absolute top-3 left-3 z-20 eyebrow bg-background/80 backdrop-blur-sm rounded px-2 py-0.5">
                        Shared
                      </span>
                      <SkillCard skill={skill} onUpdate={() => {}} />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <footer className="border-t border-border/60 py-6 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} SkillUp · Created by Chetan Chauhan</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a
              href="https://www.linkedin.com/in/chetan71/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
