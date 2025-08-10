import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Papa from "papaparse";
import { toast } from "sonner";

interface CSVRow {
  [key: string]: string | number | null;
}

export default function BulkListing() {
  const [rows, setRows] = useState<CSVRow[]>([]);

  useEffect(() => {
    document.title = "Bulk Listings | STOLEN – CSV Upload";
    const metaDesc = document.querySelector('meta[name="description"]') || (() => { const m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m); return m; })();
    metaDesc.setAttribute('content', 'Upload a CSV to create multiple device listings. Preview and confirm before publishing.');
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = window.location.href;
  }, []);

  const handleFile = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setRows(results.data as CSVRow[]);
      },
      error: () => toast.error("Failed to parse CSV"),
    });
  };

  const publishAll = () => {
    toast.success(`Published ${rows.length} listings (mock)`);
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold">Bulk Listing (CSV)</h1>
          <p className="text-muted-foreground">Upload, preview, and publish multiple listings</p>
        </div>

        <Card className="p-4 space-y-3">
          <Input type="file" accept=".csv" onChange={(e) => e.target.files && handleFile(e.target.files[0])} />
          {rows.length > 0 && (
            <>
              <div className="text-sm text-muted-foreground">Parsed {rows.length} rows</div>
              <div className="overflow-auto border rounded-md">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      {Object.keys(rows[0]).map((key) => (
                        <th key={key} className="text-left p-2 border-b bg-muted/50">{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 20).map((row, i) => (
                      <tr key={i} className="border-b">
                        {Object.keys(rows[0]).map((key) => (
                          <td key={key} className="p-2">{String(row[key] ?? "")}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Button onClick={publishAll}>Publish All</Button>
            </>
          )}
        </Card>
      </main>
    </div>
  );
}
