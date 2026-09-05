"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { fetchApi } from "@/lib/api/client";
import { FileText, Download, Upload, ExternalLink } from "lucide-react";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDocuments() {
      try {
        const data = await fetchApi('/documents');
        setDocuments(data);
      } catch (err: any) {
        if (err.status === 404) {
          setError("The Document Management API is currently unavailable or not implemented.");
        } else {
          setError(err.message || "Failed to load clinical documents.");
        }
      } finally {
        setLoading(false);
      }
    }
    loadDocuments();
  }, []);

  if (loading) return <LoadingState message="Loading document repository..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Clinical Documents" 
        description="Access and manage patient records, lab results, and claim attachments."
      />

      <div className="mt-8 clinical-card">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h2 className="heading-3 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-slate-500" />
            Document Repository
          </h2>
          <button className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center">
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </button>
        </div>
        
        {documents.length === 0 ? (
          <div className="p-12 text-sm text-slate-500 text-center flex flex-col items-center">
            <FileText className="h-10 w-10 text-slate-300 mb-3" />
            No documents found in the repository.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead>
                <tr>
                  <th scope="col" className="table-header">Document Type</th>
                  <th scope="col" className="table-header">Patient ID</th>
                  <th scope="col" className="table-header">Encounter Ref</th>
                  <th scope="col" className="table-header">Uploaded At</th>
                  <th scope="col" className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-50">
                {documents.map((doc) => (
                  <tr key={doc.document_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100 mr-4">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900">{doc.document_type}</div>
                          <div className="text-xs text-slate-500 mt-0.5">ID: {doc.document_id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-slate-700">{doc.patient_id}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-500">{doc.encounter_id || 'N/A'}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-600">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-blue-600 mr-4 inline-flex items-center transition-colors">
                        <ExternalLink className="h-4 w-4 mr-1" /> View
                      </a>
                      <button className="text-blue-600 hover:text-blue-900 font-semibold inline-flex items-center">
                        <Download className="h-4 w-4 mr-1" /> Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
