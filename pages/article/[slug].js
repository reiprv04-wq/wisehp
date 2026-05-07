import { db } from '../../lib/supabase';
import { buildProps } from '../../lib/articlePage';
import ArticlePage from '../../components/ArticlePage';

export async function getServerSideProps({ params }) {
  const slug = params.slug;

  const [{ data: row }, { data: allRows }] = await Promise.all([
    db.from('articles').select('id, data').filter('data->>slug', 'eq', slug).maybeSingle(),
    db.from('articles').select('id, data').order('id', { ascending: false }),
  ]);

  if (!row) return { notFound: true };
  return buildProps(row, allRows);
}

export default ArticlePage;
