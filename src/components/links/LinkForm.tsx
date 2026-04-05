import { useState } from 'react';
import { Link, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { isValidUrl, normalizeUrl, detectCategory, getFaviconUrl } from '@/utils/linkUtils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

interface LinkFormProps {
  addLink: (link: { url: string; title: string; favicon: string; category: string }) => void;
  onClose?: () => void;
  categories?: string[];
}

const LinkForm = ({ addLink, onClose, categories = [] }: LinkFormProps) => {
  const [url, setUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [manualCategory, setManualCategory] = useState<string | null>(null);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  const fetchPageTitle = async (pageUrl: string): Promise<string> => {
    try {
      const { data, error } = await supabase.functions.invoke('fetch-page-title', { body: { url: pageUrl } });
      if (!error && data?.success) return data.title;
    } catch {}
    try {
      const domain = new URL(pageUrl).hostname.replace('www.', '');
      const parts = domain.split('.');
      if (parts.length >= 2) return parts[parts.length - 2].charAt(0).toUpperCase() + parts[parts.length - 2].slice(1);
      return domain || 'Untitled';
    } catch { return 'Untitled'; }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) { toast.error('Please enter a URL'); return; }
    const normalizedUrl = normalizeUrl(url.trim());
    if (!isValidUrl(normalizedUrl)) { toast.error('Please enter a valid URL'); return; }

    setIsSubmitting(true);
    try {
      const title = await fetchPageTitle(normalizedUrl);
      let selectedCategory = manualCategory;
      if (isCreatingCategory && newCategory.trim()) selectedCategory = newCategory.trim();

      addLink({
        url: normalizedUrl,
        title,
        favicon: getFaviconUrl(normalizedUrl),
        category: selectedCategory || detectCategory(normalizedUrl),
      });
      setUrl(''); setManualCategory(null); setIsCreatingCategory(false); setNewCategory('');
      if (onClose) onClose();
    } catch (error) {
      console.error('Error adding link:', error);
      toast.error('Failed to add link');
    } finally { setIsSubmitting(false); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground">
          <Link className="w-5 h-5" /> Add New Link
        </h2>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-lg">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input type="text" placeholder="Paste or type URL here" value={url} onChange={e => setUrl(e.target.value)}
          className="rounded-xl bg-background border-border" disabled={isSubmitting} />
        {isCreatingCategory ? (
          <div className="flex gap-2">
            <Input type="text" placeholder="New category name" value={newCategory}
              onChange={e => setNewCategory(e.target.value)} className="flex-1 rounded-xl" autoFocus />
            <Button type="button" variant="outline" size="icon" onClick={() => setIsCreatingCategory(false)} className="rounded-xl">
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Select onValueChange={v => setManualCategory(v)} value={manualCategory || ''}>
              <SelectTrigger className="w-full rounded-xl"><SelectValue placeholder="Select category (optional)" /></SelectTrigger>
              <SelectContent>
                {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button type="button" variant="outline" size="icon" onClick={() => setIsCreatingCategory(true)} className="shrink-0 rounded-xl">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
        <Button type="submit" disabled={isSubmitting}
          className="w-full rounded-xl bg-gradient-to-r from-primary to-purple-600 text-primary-foreground">
          {isSubmitting ? 'Adding...' : 'Add Link'}
        </Button>
        <p className="text-xs text-muted-foreground">
          {isCreatingCategory ? 'Creating a new category.' : manualCategory ? `Adding to "${manualCategory}".` : 'Auto-categorized by URL.'}
        </p>
      </form>
    </div>
  );
};

export default LinkForm;
