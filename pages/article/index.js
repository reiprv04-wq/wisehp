import { db } from '../../lib/supabase';
import { buildProps } from '../../lib/articlePage';
import ArticlePage from '../../components/ArticlePage';

export async function getServerSideProps({ query }) {
  const id = query.id;
  if (!id) return { notFound: true };

  const [{ data: row }, { data: allRows }] = await Promise.all([
    db.from('articles').select('id, data').eq('id', id).maybeSingle(),
    db.from('articles').select('id, data').order('id', { ascending: false }),
  ]);

  if (!row) return { notFound: true };

  // If the article now has a slug, redirect to the canonical URL
  if (row.data?.slug) {
    return { redirect: { destination: `/article/${row.data.slug}`, permanent: false } };
  }

  return buildProps(row, allRows);
}

export default ArticlePage;
