import { createClient } from '@supabase/supabase-js';

export const db = createClient(
  'https://kcxbnaaccjwqjkkvhrvm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjeGJuYWFjY2p3cWpra3ZocnZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwMDAyMTQsImV4cCI6MjA5MzU3NjIxNH0.3mmxurljtN4cqrs7q1SF6mxFgbNmJMaeq8IYroJcaNM'
);
