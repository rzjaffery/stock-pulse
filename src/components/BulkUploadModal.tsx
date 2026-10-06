'use client'

import Papa from "papaparse";
import {useState} from "react";

interface BulkUploadModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    templateCsv: string
    templateFileName: string
    onUpload:(data: unknown[])=> Promise<{success: boolean, errors ?: string[], count ?:number}>
}
export default function BulkUploadModal({
    isOpen,
    onClose,
    title,
    templateCsv,
    templateFileName,
    onUpload,}: BulkUploadModalProps) {

    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [errorLogs, setErrorLogs] = useState<string[]>([]);

    if(!isOpen) return null;

    const handleDownloadTemplate =() => {
        const blob = new Blob([templateCsv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', templateFileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setErrorLogs([])
        }
    }

    const handleSubmit = () => {
        if (!file) return;

        setIsUploading(true);
        setErrorLogs([])

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const res = await onUpload(results.data);
                setIsUploading(false);

                if (res.success) {
                    alert(`Successfully imported ${res.count} records!`);
                    setFile(null);
                    onClose();
                } else if (res.errors) {
                    setErrorLogs(res.errors);
                }
            },
            error: (error) => {
                setIsUploading(false);
                setErrorLogs([`CSV Read Error: ${error.message}`]);
            },
        });
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-6 shadow-2xl">
                <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                    <h2 className="text-lg font-bold text-white">{title}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white text-sm">✕</button>
                </div>

                <div className="space-y-4 text-xs text-slate-300">
                    <p>Upload a <strong>CSV file</strong> matching the template headers. Click below to download a reference sample.</p>
                    <button
                        type="button"
                        onClick={handleDownloadTemplate}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 font-semibold rounded border border-indigo-500/20"
                    >
                        📥 Download Sample CSV Template
                    </button>
                </div>

                <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-400">Select File (.csv)</label>
                    <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="w-full text-xs text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500"
                    />
                </div>

                {errorLogs.length > 0 && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg max-h-36 overflow-y-auto space-y-1">
                        <p className="text-xs font-bold text-red-400">Import Failed ({errorLogs.length} errors):</p>
                        {errorLogs.map((err, idx) => (
                            <p key={idx} className="text-[11px] text-red-300 font-mono">• {err}</p>
                        ))}
                    </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-semibold bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!file || isUploading}
                        className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg disabled:opacity-50"
                    >
                        {isUploading ? 'Processing...' : 'Upload & Execute Import'}
                    </button>
                </div>
            </div>
        </div>
    );
}