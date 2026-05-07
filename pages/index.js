import fs from 'fs';
import path from 'path';

export async function getServerSideProps({ res }) {
  const html = fs.readFileSync(path.join(process.cwd(), 'public', 'wise.html'), 'utf-8');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(html);
  return { props: {} };
}

export default function Home() {
  return null;
}
