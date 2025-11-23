import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://mfzmvppfjdmhrinxbats.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mem12cHBmamRtaHJpbnhiYXRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4MDI1NTMsImV4cCI6MjA3OTM3ODU1M30.53lMVT8bghETnWAW4ZPe9rQJTF3JMoOQtddR7hFa74Y"
);
