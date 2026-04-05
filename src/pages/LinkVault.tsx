import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLinks } from '@/hooks/useLinks';
import { groupLinksByCategory } from '@/utils/linkUtils';
import LinkForm from '@/components/links/LinkForm';
import CategorySection from '@/components/links/CategorySection';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { BookmarkPlus, Search, X, Link, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

const LinkVault = () => {
  const { user, loading: authLoading } = useAuth();
  const { links, loading: linksLoading, addLink, deleteLink, editLink, renameCategory } = useLinks();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();

  if (!authLoading && !user) { navigate('/auth'); return null; }

  if (authLoading || linksLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const filteredLinks = links.filter(link => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return link.title.toLowerCase().includes(q) || link.url.toLowerCase().includes(q) || link.category.toLowerCase().includes(q);
  });

  const linksByCategory = groupLinksByCategory(filteredLinks);
  const categories = [...new Set(links.map(l => l.category))].sort();

  const handleAddLink = (link: { url: string; title: string; favicon: string; category: string }) => {
    addLink({ url: link.url, title: link.title, favicon: link.favicon, category: link.category });
    setDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Header />

      <main className="container mx-auto px-4 sm:px-6 pt-20 pb-16">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">LinkVault</h1>
            <p className="text-muted-foreground text-sm">Your personal link management system</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {isSearching ? (
              <div className="relative w-full sm:w-auto animate-fade-in">
                <Input type="text" placeholder="Search links..." value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)} className="pr-8 w-full sm:w-64 rounded-xl" autoFocus />
                <Button variant="ghost" size="icon" className="absolute right-0 top-0 h-full rounded-xl"
                  onClick={() => { setSearchQuery(''); setIsSearching(false); }}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="icon" onClick={() => setIsSearching(true)} className="rounded-xl">
                <Search className="h-4 w-4" />
              </Button>
            )}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-1 rounded-xl bg-gradient-to-r from-primary to-purple-600 text-primary-foreground">
                  <BookmarkPlus className="h-4 w-4" />
                  <span className="hidden sm:inline">Add Link</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-2xl">
                <LinkForm addLink={handleAddLink} categories={categories} onClose={() => setDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {links.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            <div className="bg-card border border-border p-12 rounded-2xl flex flex-col items-center max-w-md text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Link className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">No links saved yet</h2>
              <p className="text-muted-foreground mb-4 text-sm">Add your first link to start organizing.</p>
              <Button onClick={() => setDialogOpen(true)} className="rounded-xl bg-gradient-to-r from-primary to-purple-600 text-primary-foreground">
                <BookmarkPlus className="w-4 h-4 mr-2" /> Add your first link
              </Button>
            </div>
          </div>
        ) : Object.keys(linksByCategory).length > 0 ? (
          Object.entries(linksByCategory).sort(([a], [b]) => a.localeCompare(b)).map(([category, categoryLinks]) => (
            <CategorySection key={category} category={category} links={categoryLinks}
              onDeleteLink={deleteLink} onEditLink={editLink} onRenameCategory={renameCategory} categories={categories} />
          ))
        ) : (
          <div className="bg-card border border-border p-8 rounded-2xl text-center">
            <p className="text-foreground">No links match "{searchQuery}"</p>
            <Button variant="outline" onClick={() => setSearchQuery('')} className="mt-4 rounded-xl">Clear search</Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default LinkVault;