import React, { useState, useRef } from 'react';
import { 
  FileText, Layers, Scissors, Image as ImageIcon, UploadCloud, 
  Trash2, AlertCircle, CheckCircle2, Menu, X, RefreshCw, Droplet,
  Minimize, Lock, PenTool, Scan, FilePlus, Table, ShieldAlert, Settings
} from 'lucide-react';

// Dynamic import untuk pustaka pemroses PDF
const PDF_LIB_URL = 'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/+esm';

export default function App() {
  const [activeTab, setActiveTab] = useState('merge');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Daftar kategori dan fitur
  const menuCategories = [
    {
      title: "Organisasi & Modifikasi",
      items: [
        { id: 'merge', label: 'Gabungkan PDF', icon: Layers, desc: 'Gabungkan beberapa file PDF menjadi satu.', isReady: true },
        { id: 'split', label: 'Pisahkan PDF', icon: Scissors, desc: 'Ambil atau ekstrak halaman tertentu dari PDF.', isReady: true },
        { id: 'rotate', label: 'Putar PDF', icon: RefreshCw, desc: 'Putar halaman PDF (mengatur orientasi).', isReady: true },
        { id: 'watermark', label: 'Tambah Watermark', icon: Droplet, desc: 'Tambahkan teks watermark ke dokumen.', isReady: true },
        { id: 'organize', label: 'Organisasi Lanjut', icon: Settings, desc: 'Hapus, susun ulang halaman dengan drag-and-drop.', isReady: false },
      ]
    },
    {
      title: "Optimasi & Konversi",
      items: [
        { id: 'img2pdf', label: 'JPG ke PDF', icon: ImageIcon, desc: 'Ubah gambar (JPG/PNG) menjadi PDF.', isReady: true },
        { id: 'compress', label: 'Kompres PDF', icon: Minimize, desc: 'Kurangi ukuran file PDF.', isReady: false },
        { id: 'pdf2office', label: 'PDF ke Word', icon: FileText, desc: 'Konversi PDF ke format Word (Terhubung ke Server).', isReady: true },
        { id: 'office2pdf', label: 'Office ke PDF', icon: FilePlus, desc: 'Konversi Word, Excel, PPT, HTML ke PDF.', isReady: false },
        { id: 'pdf2jpg', label: 'PDF ke JPG', icon: ImageIcon, desc: 'Ubah halaman PDF menjadi gambar.', isReady: false },
      ]
    },
    {
      title: "Keamanan & Lanjutan",
      items: [
        { id: 'protect', label: 'Proteksi PDF', icon: Lock, desc: 'Beri atau hapus password pada PDF.', isReady: false },
        { id: 'sign', label: 'Tanda Tangan (eSign)', icon: PenTool, desc: 'Tambahkan tanda tangan digital.', isReady: false },
        { id: 'ocr', label: 'OCR (Teks ke Gambar)', icon: Scan, desc: 'Ekstrak teks dari hasil scan dokumen.', isReady: false },
        { id: 'redact', label: 'Redaksi Dokumen', icon: ShieldAlert, desc: 'Hapus informasi sensitif secara permanen.', isReady: false },
      ]
    }
  ];

  // Mencari data tab aktif
  const getActiveTabData = () => {
    for (const cat of menuCategories) {
      const found = cat.items.find(item => item.id === activeTab);
      if (found) return found;
    }
    return menuCategories[0].items[0];
  };
  const currentTab = getActiveTabData();

  const SidebarContent = () => (
    <>
      <div className="p-6 flex items-center space-x-3 text-blue-600 sticky top-0 bg-white z-10 border-b border-gray-100">
        <FileText size={28} className="font-bold" />
        <h1 className="text-xl font-bold tracking-tight">Super PDF</h1>
      </div>
      <div className="flex-1 overflow-y-auto pb-6">
        {menuCategories.map((category, idx) => (
          <div key={idx} className="mt-6 px-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">
              {category.title}
            </h3>
            <div className="space-y-1">
              {category.items.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 ${
                      isActive 
                        ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon size={18} className={isActive ? 'text-blue-600' : 'text-gray-400'} />
                      <span className="text-sm">{tab.label}</span>
                    </div>
                    {!tab.isReady && (
                  <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full font-bold">PRO</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    ))}
  </div>
</>
);

return (
<div className="flex h-screen bg-gray-50 font-sans text-gray-800 overflow-hidden">
  {/* Sidebar Desktop */}
  <aside className="hidden md:flex flex-col w-72 bg-white border-r border-gray-200 shadow-sm overflow-hidden">
    <SidebarContent />
  </aside>

  {/* Mobile Header & Menu */}
  <div className="md:hidden fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
    <div className="flex justify-between items-center p-4">
          <div className="flex items-center space-x-2 text-blue-600">
            <FileText size={24} />
            <h1 className="text-lg font-bold tracking-tight">Super PDF</h1>
          </div>
      <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-600">
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
    </div>
    {isMobileMenuOpen && (
      <nav className="bg-white border-b border-gray-200 h-[80vh] overflow-y-auto">
        <SidebarContent />
      </nav>
    )}
  </div>

  {/* Main Content */}
  <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-20 md:pt-8 bg-gray-50">
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center space-x-3">
          <currentTab.icon className="text-blue-600" size={32} />
          <span>{currentTab.label}</span>
        </h2>
        <p className="text-gray-500 mt-2 text-lg">
          {currentTab.desc}
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        {/* Fitur yang tersedia */}
            {activeTab === 'merge' && <MergePDF />}
            {activeTab === 'split' && <SplitPDF />}
            {activeTab === 'rotate' && <RotatePDF />}
            {activeTab === 'watermark' && <WatermarkPDF />}
            {activeTab === 'img2pdf' && <ImageToPDF />}
            {activeTab === 'pdf2office' && <PDFToWord />}
            
            {/* Tampilan untuk fitur yang membutuhkan backend */}
            {!currentTab.isReady && <BackendRequiredFeature featureName={currentTab.label} />}
          </div>
        </div>
      </main>
    </div>
  );
}

// --- KOMPONEN FITUR ---

// 1. Gabung PDF
function MergePDF() {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).filter(f => f.type === 'application/pdf');
      setFiles(prev => [...prev, ...selectedFiles]);
      setMessage({ text: '', type: '' });
    }
  };

  const removeFile = (index) => setFiles(files.filter((_, i) => i !== index));

  const processMerge = async () => {
    if (files.length < 2) return;
    setIsProcessing(true);
    setMessage({ text: 'Sedang menggabungkan...', type: 'info' });

    try {
      const { PDFDocument } = await import(PDF_LIB_URL);
      const mergedPdf = await PDFDocument.create();

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const pdfBytes = await mergedPdf.save();
      downloadFile(pdfBytes, 'PDF_Gabungan.pdf', 'application/pdf');
      setMessage({ text: 'PDF berhasil digabungkan!', type: 'success' });
      setFiles([]);
    } catch (error) {
      setMessage({ text: 'Gagal menggabungkan file.', type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <UploadZone onUpload={() => fileInputRef.current.click()} text="Pilih beberapa file PDF" />
      <input type="file" multiple accept="application/pdf" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
      {files.length > 0 && <FileList files={files} onRemove={removeFile} />}
      <StatusMessage message={message} />
      <ProcessButton onClick={processMerge} isProcessing={isProcessing} disabled={files.length < 2} icon={Layers} text="Gabungkan PDF" />
    </div>
  );
}

// 2. Pisah PDF
function SplitPDF() {
  const [file, setFile] = useState(null);
  const [pages, setPages] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const fileInputRef = useRef(null);

  const processSplit = async () => {
    if (!file || !pages) return;
    setIsProcessing(true);
    setMessage({ text: 'Mengekstrak halaman...', type: 'info' });

    try {
      const { PDFDocument } = await import(PDF_LIB_URL);
      const arrayBuffer = await file.arrayBuffer();
      const originalPdf = await PDFDocument.load(arrayBuffer);
      const newPdf = await PDFDocument.create();
      const totalPages = originalPdf.getPageCount();
      
      const pagesToExtract = pages.split(',').map(p => parseInt(p.trim()) - 1).filter(p => !isNaN(p) && p >= 0 && p < totalPages);
      if (pagesToExtract.length === 0) throw new Error("Format tidak valid.");

      const copiedPages = await newPdf.copyPages(originalPdf, pagesToExtract);
      copiedPages.forEach((page) => newPdf.addPage(page));

      const pdfBytes = await newPdf.save();
      downloadFile(pdfBytes, 'PDF_Terpisah.pdf', 'application/pdf');
      setMessage({ text: 'Halaman berhasil diekstrak!', type: 'success' });
    } catch (error) {
      setMessage({ text: 'Gagal memisahkan file.', type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {!file ? <UploadZone onUpload={() => fileInputRef.current.click()} text="Pilih satu file PDF" /> : <SingleFile file={file} onRemove={() => setFile(null)} />}
      <input type="file" accept="application/pdf" className="hidden" ref={fileInputRef} onChange={(e) => setFile(e.target.files[0])} />
      
      {file && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Ekstrak Halaman (pisahkan dengan koma):</label>
          <input type="text" value={pages} onChange={(e) => setPages(e.target.value)} placeholder="Contoh: 1, 3, 5-7 (Gunakan koma)" className="w-full px-4 py-3 border border-gray-300 rounded-xl" />
        </div>
      )}
      <StatusMessage message={message} />
      <ProcessButton onClick={processSplit} isProcessing={isProcessing} disabled={!file || !pages} icon={Scissors} text="Pisahkan PDF" />
    </div>
  );
}

// 3. Putar PDF (Baru)
function RotatePDF() {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const fileInputRef = useRef(null);

  const processRotate = async () => {
    if (!file) return;
    setIsProcessing(true);
    setMessage({ text: 'Memutar halaman...', type: 'info' });

    try {
      const { PDFDocument, degrees } = await import(PDF_LIB_URL);
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      const pages = pdfDoc.getPages();
      pages.forEach((page) => {
        const currentRotation = page.getRotation().angle;
        page.setRotation(degrees(currentRotation + 90)); // Putar 90 derajat searah jarum jam
      });

      const pdfBytes = await pdfDoc.save();
      downloadFile(pdfBytes, 'PDF_Diputar.pdf', 'application/pdf');
      setMessage({ text: 'PDF berhasil diputar 90 derajat!', type: 'success' });
    } catch (error) {
      setMessage({ text: 'Gagal memutar PDF.', type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {!file ? <UploadZone onUpload={() => fileInputRef.current.click()} text="Pilih file PDF untuk diputar" /> : <SingleFile file={file} onRemove={() => setFile(null)} />}
      <input type="file" accept="application/pdf" className="hidden" ref={fileInputRef} onChange={(e) => setFile(e.target.files[0])} />
      <StatusMessage message={message} />
      <ProcessButton onClick={processRotate} isProcessing={isProcessing} disabled={!file} icon={RefreshCw} text="Putar Semua Halaman (90°)" />
    </div>
  );
}

// 4. Tambah Watermark (Baru)
function WatermarkPDF() {
  const [file, setFile] = useState(null);
  const [watermarkText, setWatermarkText] = useState('DOKUMEN RAHASIA');
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const fileInputRef = useRef(null);

  const processWatermark = async () => {
    if (!file || !watermarkText) return;
    setIsProcessing(true);
    setMessage({ text: 'Menambahkan watermark...', type: 'info' });

    try {
      const { PDFDocument, rgb, degrees } = await import(PDF_LIB_URL);
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      const pages = pdfDoc.getPages();
      pages.forEach((page) => {
        const { width, height } = page.getSize();
        page.drawText(watermarkText, {
          x: width / 4,
          y: height / 2,
          size: 50,
          color: rgb(0.8, 0.2, 0.2), // Warna merah pudar
          opacity: 0.3,
          rotate: degrees(45),
        });
      });

      const pdfBytes = await pdfDoc.save();
      downloadFile(pdfBytes, 'PDF_Watermark.pdf', 'application/pdf');
      setMessage({ text: 'Watermark berhasil ditambahkan!', type: 'success' });
    } catch (error) {
      setMessage({ text: 'Gagal menambahkan watermark.', type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {!file ? <UploadZone onUpload={() => fileInputRef.current.click()} text="Pilih file PDF" /> : <SingleFile file={file} onRemove={() => setFile(null)} />}
      <input type="file" accept="application/pdf" className="hidden" ref={fileInputRef} onChange={(e) => setFile(e.target.files[0])} />
      
      {file && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Teks Watermark:</label>
          <input type="text" value={watermarkText} onChange={(e) => setWatermarkText(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl" />
        </div>
      )}
      <StatusMessage message={message} />
      <ProcessButton onClick={processWatermark} isProcessing={isProcessing} disabled={!file || !watermarkText} icon={Droplet} text="Pasang Watermark" />
    </div>
  );
}

// 5. JPG ke PDF
function ImageToPDF() {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const fileInputRef = useRef(null);

  const processImages = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setMessage({ text: 'Mengonversi gambar...', type: 'info' });

    try {
      const { PDFDocument } = await import(PDF_LIB_URL);
      const pdfDoc = await PDFDocument.create();

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        let img;
        if (file.type === 'image/jpeg' || file.type === 'image/jpg') img = await pdfDoc.embedJpg(arrayBuffer);
        else if (file.type === 'image/png') img = await pdfDoc.embedPng(arrayBuffer);
        else continue;

        const page = pdfDoc.addPage([img.width, img.height]);
        page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
      }

      const pdfBytes = await pdfDoc.save();
      downloadFile(pdfBytes, 'Gambar_ke_PDF.pdf', 'application/pdf');
      setMessage({ text: 'Berhasil dikonversi!', type: 'success' });
      setFiles([]);
    } catch (error) {
      setMessage({ text: 'Gagal memproses gambar.', type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <UploadZone onUpload={() => fileInputRef.current.click()} text="Pilih gambar (JPG/PNG)" />
      <input type="file" multiple accept="image/png, image/jpeg" className="hidden" ref={fileInputRef} onChange={(e) => setFiles(Array.from(e.target.files))} />
      {files.length > 0 && <FileList files={files} onRemove={(idx) => setFiles(files.filter((_, i) => i !== idx))} isImage={true} />}
      <StatusMessage message={message} />
      <ProcessButton onClick={processImages} isProcessing={isProcessing} disabled={files.length === 0} icon={ImageIcon} text="Ubah ke PDF" />
    </div>
  );
}

// 6. PDF ke Word (Terhubung dengan Backend Server)
function PDFToWord() {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const fileInputRef = useRef(null);

  const processBackend = async () => {
    if (!file) return;
    setIsProcessing(true);
    setMessage({ text: 'Mengunggah ke server dan mengonversi...', type: 'info' });

    // Gunakan FormData untuk mengirim file via API
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Endpoint ini mengarah ke server Python Flask yang berjalan secara lokal
      const response = await fetch('http://127.0.0.1:5000/api/pdf2word', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Gagal terhubung ke Server. Pastikan server.py berjalan di port 5000.');
      }

      // Menerima file .docx dari server sebagai Blob
      const blob = await response.blob();
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace('.pdf', '.docx'); // Ganti ekstensi file hasil unduhan
      a.click();
      URL.revokeObjectURL(url);
      
      setMessage({ text: 'Berhasil dikonversi oleh server!', type: 'success' });
      setFile(null);
    } catch (error) {
      console.error(error);
      setMessage({ text: error.message, type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {!file ? <UploadZone onUpload={() => fileInputRef.current.click()} text="Pilih file PDF (Maks. 50MB)" /> : <SingleFile file={file} onRemove={() => setFile(null)} />}
      <input type="file" accept="application/pdf" className="hidden" ref={fileInputRef} onChange={(e) => setFile(e.target.files[0])} />
      
      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl text-sm text-yellow-800">
        <strong>PENTING:</strong> Fitur ini melakukan <code>fetch()</code> ke <code>http://127.0.0.1:5000</code>. Anda wajib menjalankan <strong>server.py</strong> di terminal komputer Anda agar tombol ini bisa berfungsi.
      </div>

      <StatusMessage message={message} />
      <ProcessButton onClick={processBackend} isProcessing={isProcessing} disabled={!file} icon={FileText} text="Konversi ke Word" />
    </div>
  );
}

// 7. Komponen Info untuk Fitur Server/Backend (Dummy)
function BackendRequiredFeature({ featureName }) {
  return (
    <div className="text-center py-12 space-y-6">
      <div className="bg-gradient-to-br from-orange-100 to-red-100 text-orange-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-orange-200">
        <Settings size={36} className="animate-spin-slow" />
      </div>
      <h3 className="text-2xl font-bold text-gray-800">Fitur "{featureName}" Membutuhkan Server</h3>
      <p className="text-gray-600 max-w-lg mx-auto leading-relaxed">
        Fitur ini sangat kompleks. Tugas seperti <b>OCR</b>, <b>Kompresi Data</b>, <b>Enkripsi Kriptografi</b>, atau <b>Konversi Format (Word/Excel)</b> tidak dapat berjalan efektif hanya menggunakan Javascript di dalam browser.
      </p>
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 max-w-lg mx-auto text-sm text-gray-600 text-left space-y-3">
        <p>💡 <b>Kenapa fitur ini dikunci?</b></p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Browser memiliki batasan memori (RAM) untuk memproses kompresi tinggi.</li>
          <li>Konversi format eksklusif Microsoft Office memerlukan pustaka backend (seperti Python <code>pdf2docx</code> atau sistem operasi Windows).</li>
          <li>OCR memerlukan mesin pemroses AI (seperti Tesseract) yang terlalu besar untuk diunduh ke browser.</li>
        </ul>
        <p className="font-semibold text-blue-600 pt-2">Aplikasi ini dirancang untuk pemrosesan lokal 100% aman (offline).</p>
      </div>
    </div>
  );
}


// --- KOMPONEN BANTUAN UI ---

function UploadZone({ onUpload, text }) {
  return (
    <div onClick={onUpload} className="border-2 border-dashed border-blue-300 bg-blue-50/50 hover:bg-blue-50 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all group">
      <div className="bg-white p-4 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
        <UploadCloud size={32} className="text-blue-500" />
      </div>
      <p className="text-gray-600 font-medium text-center">{text}</p>
    </div>
  );
}

function SingleFile({ file, onRemove }) {
  return (
    <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-xl">
      <div className="flex items-center space-x-3 overflow-hidden">
        <FileText className="text-blue-500 shrink-0" size={24} />
        <span className="truncate font-medium text-gray-700">{file.name}</span>
      </div>
      <button onClick={onRemove} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><Trash2 size={18} /></button>
    </div>
  );
}

function FileList({ files, onRemove, isImage }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-2 max-h-60 overflow-y-auto space-y-2">
      {files.map((file, index) => (
        <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 overflow-hidden">
            {isImage ? <ImageIcon className="text-green-500 shrink-0" size={20} /> : <FileText className="text-blue-500 shrink-0" size={20} />}
            <span className="text-sm font-medium text-gray-700 truncate">{file.name}</span>
          </div>
          <button onClick={() => onRemove(index)} className="text-red-400 hover:bg-red-50 p-1.5 rounded-md"><Trash2 size={16} /></button>
        </div>
      ))}
    </div>
  );
}

function StatusMessage({ message }) {
  if (!message.text) return null;
  const isError = message.type === 'error';
  const isSuccess = message.type === 'success';
  return (
    <div className={`flex items-center space-x-2 p-4 rounded-xl text-sm ${isError ? 'bg-red-50 text-red-700 border-red-100' : isSuccess ? 'bg-green-50 text-green-700 border-green-100' : 'bg-blue-50 text-blue-700 border-blue-100'} border`}>
      {isError && <AlertCircle size={18} />}{isSuccess && <CheckCircle2 size={18} />}
      <span className="font-medium">{message.text}</span>
    </div>
  );
}

function ProcessButton({ onClick, isProcessing, disabled, icon: Icon, text }) {
  return (
    <button onClick={onClick} disabled={isProcessing || disabled} className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 shadow-sm hover:shadow-md">
      {isProcessing ? <span className="animate-pulse">Sedang memproses...</span> : <><Icon size={20} /><span>{text}</span></>}
    </button>
  );
}

function downloadFile(bytes, filename, mimeType) {
  const blob = new Blob([bytes], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}