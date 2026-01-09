import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

function ExportPage() {
  const [searchParams] = useSearchParams();
  const [exportFormat, setExportFormat] = useState('pdf');
  const [includeTranscript, setIncludeTranscript] = useState(true);
  const [includeSources, setIncludeSources] = useState(true);
  const [includeStats, setIncludeStats] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(false);

  const sessionId = searchParams.get('session');

  const handleExport = () => {
    setExporting(true);
    
    // Simulate export
    setTimeout(() => {
      // Create export data
      const exportData = {
        exportDate: new Date().toISOString(),
        format: exportFormat,
        includeTranscript,
        includeSources,
        includeStats,
        sessions: JSON.parse(localStorage.getItem('livetruth_sessions') || '[]'),
        user: JSON.parse(localStorage.getItem('livetruth_user') || '{}')
      };

      // Create and download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `livetruth-export-${new Date().toISOString().split('T')[0]}.${exportFormat === 'json' ? 'json' : 'txt'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExporting(false);
      setExported(true);
      setTimeout(() => setExported(false), 3000);
    }, 1500);
  };

  const handleImport = () => {
    if (!importFile) return;

    setImporting(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        // Import sessions
        if (data.sessions) {
          // Get current logged-in user
          const currentUser = localStorage.getItem('livetruth_user');
          const userEmail = currentUser ? JSON.parse(currentUser).email : null;
          
          // Add userEmail to imported sessions if not present
          const sessionsWithUser = data.sessions.map(session => ({
            ...session,
            userEmail: session.userEmail || userEmail || 'unknown'
          }));
          
          const existingSessions = JSON.parse(localStorage.getItem('livetruth_sessions') || '[]');
          const merged = [...existingSessions, ...sessionsWithUser];
          localStorage.setItem('livetruth_sessions', JSON.stringify(merged));
        }

        setImporting(false);
        setImported(true);
        setImportFile(null);
        setTimeout(() => setImported(false), 3000);
      } catch (error) {
        alert('Invalid file format. Please select a valid LiveTruth export file.');
        setImporting(false);
      }
    };
    reader.readAsText(importFile);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="container mx-auto max-w-4xl flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl blur-lg opacity-50"></div>
              <div className="relative w-10 h-10 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3v18M8 8v8M16 6v12M4 11v2M20 9v6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              LiveTruth
            </span>
          </Link>
          <Link to="/" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto max-w-4xl px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Export & Import</h1>
          <p className="text-gray-400">Export your data or import from a backup</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Export Section */}
          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              Export Data
            </h2>

            {/* Format Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">Export Format</label>
              <div className="flex gap-3">
                {['json', 'csv', 'pdf'].map((format) => (
                  <button
                    key={format}
                    onClick={() => setExportFormat(format)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      exportFormat === format
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {format.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Options */}
            <div className="space-y-3 mb-6">
              <label className="flex items-center gap-3 cursor-pointer" onClick={() => setIncludeTranscript(!includeTranscript)}>
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  includeTranscript ? 'bg-blue-600 border-blue-600' : 'border-gray-500'
                }`}>
                  {includeTranscript && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-gray-300">Include Transcripts</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer" onClick={() => setIncludeSources(!includeSources)}>
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  includeSources ? 'bg-blue-600 border-blue-600' : 'border-gray-500'
                }`}>
                  {includeSources && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-gray-300">Include Sources</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer" onClick={() => setIncludeStats(!includeStats)}>
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  includeStats ? 'bg-blue-600 border-blue-600' : 'border-gray-500'
                }`}>
                  {includeStats && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-gray-300">Include Statistics</span>
              </label>
            </div>

            <button
              onClick={handleExport}
              disabled={exporting}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              {exporting ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Exporting...
                </>
              ) : exported ? (
                <>
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Exported!
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export Data
                </>
              )}
            </button>
          </div>

          {/* Import Section */}
          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              Import Data
            </h2>

            {/* File Upload */}
            <div className="mb-6">
              <label className="block border-2 border-dashed border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-gray-500 transition-colors">
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => setImportFile(e.target.files[0])}
                  className="hidden"
                />
                <svg className="w-12 h-12 text-gray-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                {importFile ? (
                  <p className="text-white font-medium">{importFile.name}</p>
                ) : (
                  <>
                    <p className="text-gray-400 mb-1">Drop a file here or click to browse</p>
                    <p className="text-gray-500 text-sm">Supports JSON export files</p>
                  </>
                )}
              </label>
            </div>

            <button
              onClick={handleImport}
              disabled={!importFile || importing}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              {importing ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Importing...
                </>
              ) : imported ? (
                <>
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Imported!
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Import Data
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ExportPage;
