import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { LinkItem } from '@/utils/linkUtils';

export function useLinks() {
  const { user } = useAuth();
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLinks = useCallback(async () => {
    if (!user) { setLinks([]); setLoading(false); return; }
    try {
      const { data, error } = await (supabase as any)
        .from('links')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setLinks((data || []).map((l: any) => ({
        id: l.id, url: l.url, title: l.title,
        favicon: l.favicon, category: l.category, createdAt: l.created_at,
      })));
    } catch (error) {
      console.error('Error fetching links:', error);
      toast.error('Failed to load links');
    } finally { setLoading(false); }
  }, [user]);

  useEffect(() => { fetchLinks(); }, [fetchLinks]);

  const addLink = async (link: Omit<LinkItem, 'id' | 'createdAt'>) => {
    if (!user) return;
    try {
      const { data, error } = await (supabase as any)
        .from('links')
        .insert({ user_id: user.id, title: link.title, url: link.url, category: link.category, favicon: link.favicon })
        .select().single();
      if (error) throw error;
      setLinks(prev => [{ id: data.id, url: data.url, title: data.title, favicon: data.favicon, category: data.category, createdAt: data.created_at }, ...prev]);
      toast.success('Link saved');
    } catch (error) {
      console.error('Error adding link:', error);
      toast.error('Failed to save link');
    }
  };

  const deleteLink = async (id: string) => {
    try {
      const { error } = await (supabase as any).from('links').delete().eq('id', id);
      if (error) throw error;
      setLinks(prev => prev.filter(l => l.id !== id));
      toast.success('Link deleted');
    } catch (error) {
      console.error('Error deleting link:', error);
      toast.error('Failed to delete link');
    }
  };

  const editLink = async (id: string, updates: Partial<LinkItem>) => {
    try {
      const dbUpdates: any = {};
      if (updates.title) dbUpdates.title = updates.title;
      if (updates.url) dbUpdates.url = updates.url;
      if (updates.category) dbUpdates.category = updates.category;
      if (updates.favicon !== undefined) dbUpdates.favicon = updates.favicon;
      const { error } = await (supabase as any).from('links').update(dbUpdates).eq('id', id);
      if (error) throw error;
      setLinks(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
      toast.success('Link updated');
    } catch (error) {
      console.error('Error updating link:', error);
      toast.error('Failed to update link');
    }
  };

  const renameCategory = async (oldName: string, newName: string) => {
    try {
      const { error } = await (supabase as any).from('links').update({ category: newName }).eq('category', oldName);
      if (error) throw error;
      setLinks(prev => prev.map(l => l.category === oldName ? { ...l, category: newName } : l));
      toast.success(`Category renamed to "${newName}"`);
    } catch (error) {
      console.error('Error renaming category:', error);
      toast.error('Failed to rename category');
    }
  };

  return { links, loading, addLink, deleteLink, editLink, renameCategory };
}
