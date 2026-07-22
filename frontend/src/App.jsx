import React, { useState, useRef } from 'react';
import { 
  FileText, Layers, Scissors, Image as ImageIcon, UploadCloud, 
  Trash2, AlertCircle, CheckCircle2, Menu, X, RefreshCw, Droplet,
  Minimize, Lock, PenTool, Scan, FilePlus, ShieldAlert, Settings, Key,
  ChevronUp, ChevronDown
} from 'lucide-react';
import JSZip from 'jszip';

// Dynamic import untuk pustaka pemroses PDF
const PDF_LIB_URL = 'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/+esm';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

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
        { id: 'compress', label: 'Kompres PDF', icon: Minimize, desc: 'Kurangi ukuran file PDF.', isReady: true },
        { id: 'pdf2office', label: 'PDF ke Word', icon: FileText, desc: 'Konversi PDF ke format Word (Terhubung ke Server).', isReady: true },
        { id: 'office2pdf', label: 'Office ke PDF', icon: FilePlus, desc: 'Konversi Word, Excel, PPT, HTML ke PDF.', isReady: true },
        { id: 'pdf2jpg', label: 'PDF ke JPG', icon: ImageIcon, desc: 'Ubah halaman PDF menjadi file gambar ZIP.', isReady: true }, 
      ]
    },
    {
      title: "Keamanan & Lanjutan",
      items: [
        { id: 'protect', label: 'Proteksi PDF', icon: Lock, desc: 'Beri password pada PDF agar aman.', isReady: true }, 
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
            {activeTab === 'compress' && <CompressPDF />}
            {activeTab === 'pdf2office' && <PDFToWord />}
            {activeTab === 'office2pdf' && <OfficeToPDF />}
            {activeTab === 'pdf2jpg' && <PDFToJPG />} 
            {activeTab === 'protect' && <ProtectPDF />}
            
            {/* Tampilan untuk fitur yang belum kita buat kodenya */}
            {!currentTab.isReady && <BackendRequiredFeature featureName={currentTab.label} />}
          </div>
        </div>
      </main>
    </div>
  );
}

// --- KOMPONEN FITUR LOKAL (BROWSER) ---

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

  const handleFileDrop = (droppedFiles) => {
    const selectedFiles = Array.from(droppedFiles).filter(f => f.type === 'application/pdf');
    setFiles(prev => [...prev, ...selectedFiles]);
    setMessage({ text: '', type: '' });
  };

  const removeFile = (index) => setFiles(files.filter((_, i) => i !== index));

  const moveFileUp = (index) => {
    if (index === 0) return;
    setFiles(prev => {
      const newFiles = [...prev];
      [newFiles[index - 1], newFiles[index]] = [newFiles[index], newFiles[index - 1]];
      return newFiles;
    });
  };

  const moveFileDown = (index) => {
    if (index === files.length - 1) return;
    setFiles(prev => {
      const newFiles = [...prev];
      [newFiles[index + 1], newFiles[index]] = [newFiles[index], newFiles[index + 1]];
      return newFiles;
    });
  };

  const processMerge = async () => {
    if (files.length < 2) return;
    setIsProcessing(true);
    setMessage({ text: 'Sedang menggabungkan...', type: 'info' });

    try {
      const { PDFDocument } = await import(/* @vite-ignore */ PDF_LIB_URL);
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
      <UploadZone onUpload={() => fileInputRef.current.click()} onFileDrop={handleFileDrop} text="Pilih atau Tarik (Drag) beberapa file PDF ke sini" />
      <input type="file" multiple accept="application/pdf" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
      {files.length > 0 && <FileList files={files} onRemove={removeFile} onMoveUp={moveFileUp} onMoveDown={moveFileDown} />}
      <StatusMessage message={message} />
      <ProcessButton onClick={processMerge} isProcessing={isProcessing} disabled={files.length < 2} icon={Layers} text="Gabungkan PDF" />
    </div>
  );
}

// 2. Pisah PDF
function SplitPDF() {
  const [files, setFiles] = useState([]);
  const [pages, setPages] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const fileInputRef = useRef(null);

  const handleFileDrop = (droppedFiles) => {
    const droppedFilesArray = Array.from(droppedFiles).filter(f => f.type === 'application/pdf');
    if (droppedFilesArray.length > 0) {
      setFiles(prev => [...prev, ...droppedFilesArray]);
    }
  };

  const removeFile = (indexToRemove) => {
    setFiles(files.filter((_, idx) => idx !== indexToRemove));
  };

  const processSplit = async () => {
    if (files.length === 0 || !pages) return;
    setIsProcessing(true);
    setMessage({ text: `Mengekstrak halaman dari ${files.length} dokumen...`, type: 'info' });

    try {
      const { PDFDocument } = await import(/* @vite-ignore */ PDF_LIB_URL);
      const zip = new JSZip();

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const originalPdf = await PDFDocument.load(arrayBuffer);
        const newPdf = await PDFDocument.create();
        const totalPages = originalPdf.getPageCount();
        
        const pagesToExtract = pages.split(',').map(p => parseInt(p.trim()) - 1).filter(p => !isNaN(p) && p >= 0 && p < totalPages);
        if (pagesToExtract.length === 0) continue;

        const copiedPages = await newPdf.copyPages(originalPdf, pagesToExtract);
        copiedPages.forEach((page) => newPdf.addPage(page));

        const pdfBytes = await newPdf.save();
        if (files.length === 1) {
          downloadFile(pdfBytes, file.name.replace('.pdf', '_terpisah.pdf'), 'application/pdf');
          setMessage({ text: 'Halaman berhasil diekstrak!', type: 'success' });
          setFiles([]);
          setIsProcessing(false);
          return;
        } else {
          zip.file(file.name.replace('.pdf', '_terpisah.pdf'), pdfBytes);
        }
      }

      if (files.length > 1) {
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'pdf_terpisah.zip';
        a.click();
        URL.revokeObjectURL(url);
        setMessage({ text: 'Berhasil diekstrak dalam bentuk ZIP!', type: 'success' });
        setFiles([]);
      }
    } catch (error) {
      setMessage({ text: 'Gagal memisahkan file.', type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {files.length === 0 ? (
        <UploadZone onUpload={() => fileInputRef.current.click()} onFileDrop={handleFileDrop} text="Pilih atau Tarik (Drag) file PDF ke sini" />
      ) : (
        <div className="space-y-4">
          <FileList files={files} onRemove={removeFile} />
          <button onClick={() => fileInputRef.current.click()} className="w-full py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-xl hover:border-blue-500 hover:text-blue-600 font-medium">
            + Tambah File PDF Lainnya
          </button>
        </div>
      )}
      <input type="file" multiple accept="application/pdf" className="hidden" ref={fileInputRef} onChange={(e) => {
        const newFiles = Array.from(e.target.files);
        setFiles(prev => [...prev, ...newFiles]);
        e.target.value = null;
      }} />
      
      {files.length > 0 && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Ekstrak Halaman (pisahkan dengan koma):</label>
          <input type="text" value={pages} onChange={(e) => setPages(e.target.value)} placeholder="Contoh: 1, 3, 5-7 (Gunakan koma)" className="w-full px-4 py-3 border border-gray-300 rounded-xl" />
        </div>
      )}
      <StatusMessage message={message} />
      <ProcessButton onClick={processSplit} isProcessing={isProcessing} disabled={files.length === 0 || !pages} icon={Scissors} text="Pisahkan PDF" />
    </div>
  );
}

// 3. Putar PDF
function RotatePDF() {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const fileInputRef = useRef(null);

  const handleFileDrop = (droppedFiles) => {
    const droppedFilesArray = Array.from(droppedFiles).filter(f => f.type === 'application/pdf');
    if (droppedFilesArray.length > 0) {
      setFiles(prev => [...prev, ...droppedFilesArray]);
    }
  };

  const removeFile = (indexToRemove) => {
    setFiles(files.filter((_, idx) => idx !== indexToRemove));
  };

  const processRotate = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setMessage({ text: `Memutar halaman dari ${files.length} dokumen...`, type: 'info' });

    try {
      const { PDFDocument, degrees } = await import(/* @vite-ignore */ PDF_LIB_URL);
      const zip = new JSZip();

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        
        const pages = pdfDoc.getPages();
        pages.forEach((page) => {
          const currentRotation = page.getRotation().angle;
          page.setRotation(degrees(currentRotation + 90)); 
        });

        const pdfBytes = await pdfDoc.save();
        if (files.length === 1) {
          downloadFile(pdfBytes, file.name.replace('.pdf', '_diputar.pdf'), 'application/pdf');
          setMessage({ text: 'PDF berhasil diputar 90 derajat!', type: 'success' });
          setFiles([]);
          setIsProcessing(false);
          return;
        } else {
          zip.file(file.name.replace('.pdf', '_diputar.pdf'), pdfBytes);
        }
      }

      if (files.length > 1) {
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'pdf_diputar.zip';
        a.click();
        URL.revokeObjectURL(url);
        setMessage({ text: 'PDF berhasil diputar dalam ZIP!', type: 'success' });
        setFiles([]);
      }
    } catch (error) {
      setMessage({ text: 'Gagal memutar PDF.', type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {files.length === 0 ? (
        <UploadZone onUpload={() => fileInputRef.current.click()} onFileDrop={handleFileDrop} text="Pilih atau Tarik (Drag) file PDF untuk diputar" />
      ) : (
        <div className="space-y-4">
          <FileList files={files} onRemove={removeFile} />
          <button onClick={() => fileInputRef.current.click()} className="w-full py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-xl hover:border-blue-500 hover:text-blue-600 font-medium">
            + Tambah File PDF Lainnya
          </button>
        </div>
      )}
      <input type="file" multiple accept="application/pdf" className="hidden" ref={fileInputRef} onChange={(e) => {
        const newFiles = Array.from(e.target.files);
        setFiles(prev => [...prev, ...newFiles]);
        e.target.value = null;
      }} />
      <StatusMessage message={message} />
      <ProcessButton onClick={processRotate} isProcessing={isProcessing} disabled={files.length === 0} icon={RefreshCw} text="Putar Semua Halaman (90°)" />
    </div>
  );
}

// 4. Tambah Watermark
function WatermarkPDF() {
  const [files, setFiles] = useState([]);
  const [watermarkText, setWatermarkText] = useState('DOKUMEN RAHASIA');
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const fileInputRef = useRef(null);

  const handleFileDrop = (droppedFiles) => {
    const droppedFilesArray = Array.from(droppedFiles).filter(f => f.type === 'application/pdf');
    if (droppedFilesArray.length > 0) {
      setFiles(prev => [...prev, ...droppedFilesArray]);
    }
  };

  const removeFile = (indexToRemove) => {
    setFiles(files.filter((_, idx) => idx !== indexToRemove));
  };

  const processWatermark = async () => {
    if (files.length === 0 || !watermarkText) return;
    setIsProcessing(true);
    setMessage({ text: `Menambahkan watermark ke ${files.length} dokumen...`, type: 'info' });

    try {
      const { PDFDocument, rgb, degrees } = await import(/* @vite-ignore */ PDF_LIB_URL);
      const zip = new JSZip();

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        
        const pages = pdfDoc.getPages();
        pages.forEach((page) => {
          const { width, height } = page.getSize();
          page.drawText(watermarkText, {
            x: width / 4,
            y: height / 2,
            size: 50,
            color: rgb(0.8, 0.2, 0.2), 
            opacity: 0.3,
            rotate: degrees(45),
          });
        });

        const pdfBytes = await pdfDoc.save();
        if (files.length === 1) {
          downloadFile(pdfBytes, file.name.replace('.pdf', '_watermark.pdf'), 'application/pdf');
          setMessage({ text: 'Watermark berhasil ditambahkan!', type: 'success' });
          setFiles([]);
          setIsProcessing(false);
          return;
        } else {
          zip.file(file.name.replace('.pdf', '_watermark.pdf'), pdfBytes);
        }
      }

      if (files.length > 1) {
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'pdf_watermark.zip';
        a.click();
        URL.revokeObjectURL(url);
        setMessage({ text: 'Watermark berhasil ditambahkan dalam ZIP!', type: 'success' });
        setFiles([]);
      }
    } catch (error) {
      setMessage({ text: 'Gagal menambahkan watermark.', type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {files.length === 0 ? (
        <UploadZone onUpload={() => fileInputRef.current.click()} onFileDrop={handleFileDrop} text="Pilih atau Tarik (Drag) file PDF" />
      ) : (
        <div className="space-y-4">
          <FileList files={files} onRemove={removeFile} />
          <button onClick={() => fileInputRef.current.click()} className="w-full py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-xl hover:border-blue-500 hover:text-blue-600 font-medium">
            + Tambah File PDF Lainnya
          </button>
        </div>
      )}
      <input type="file" multiple accept="application/pdf" className="hidden" ref={fileInputRef} onChange={(e) => {
        const newFiles = Array.from(e.target.files);
        setFiles(prev => [...prev, ...newFiles]);
        e.target.value = null;
      }} />
      
      {files.length > 0 && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Teks Watermark:</label>
          <input type="text" value={watermarkText} onChange={(e) => setWatermarkText(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl" />
        </div>
      )}
      <StatusMessage message={message} />
      <ProcessButton onClick={processWatermark} isProcessing={isProcessing} disabled={files.length === 0 || !watermarkText} icon={Droplet} text="Pasang Watermark" />
    </div>
  );
}

// 5. JPG ke PDF
function ImageToPDF() {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const fileInputRef = useRef(null);

  const handleFileDrop = (droppedFiles) => {
    const selectedFiles = Array.from(droppedFiles).filter(f => f.type === 'image/jpeg' || f.type === 'image/png' || f.type === 'image/jpg');
    setFiles(prev => [...prev, ...selectedFiles]);
    setMessage({ text: '', type: '' });
  };

  const moveFileUp = (index) => {
    if (index === 0) return;
    setFiles(prev => {
      const newFiles = [...prev];
      [newFiles[index - 1], newFiles[index]] = [newFiles[index], newFiles[index - 1]];
      return newFiles;
    });
  };

  const moveFileDown = (index) => {
    if (index === files.length - 1) return;
    setFiles(prev => {
      const newFiles = [...prev];
      [newFiles[index + 1], newFiles[index]] = [newFiles[index], newFiles[index + 1]];
      return newFiles;
    });
  };

  const processImages = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setMessage({ text: 'Mengonversi gambar...', type: 'info' });

    try {
      const { PDFDocument } = await import(/* @vite-ignore */ PDF_LIB_URL);
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
      <UploadZone onUpload={() => fileInputRef.current.click()} onFileDrop={handleFileDrop} text="Pilih atau Tarik (Drag) gambar (JPG/PNG)" />
      <input type="file" multiple accept="image/png, image/jpeg" className="hidden" ref={fileInputRef} onChange={(e) => setFiles(Array.from(e.target.files))} />
      {files.length > 0 && <FileList files={files} onRemove={(idx) => setFiles(files.filter((_, i) => i !== idx))} onMoveUp={moveFileUp} onMoveDown={moveFileDown} isImage={true} />}
      <StatusMessage message={message} />
      <ProcessButton onClick={processImages} isProcessing={isProcessing} disabled={files.length === 0} icon={ImageIcon} text="Ubah ke PDF" />
    </div>
  );
}

// --- KOMPONEN FITUR SERVER (MEMBUTUHKAN BACKEND) ---

// 6. PDF ke Word
function PDFToWord() {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const fileInputRef = useRef(null);

  const handleFileDrop = (droppedFiles) => {
    const droppedFilesArray = Array.from(droppedFiles).filter(f => f.type === 'application/pdf');
    if (droppedFilesArray.length > 0) {
      setFiles(prev => [...prev, ...droppedFilesArray]);
    }
  };

  const removeFile = (indexToRemove) => {
    setFiles(files.filter((_, idx) => idx !== indexToRemove));
  };

  const processBackend = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setMessage({ text: `Memproses ${files.length} dokumen di server...`, type: 'info' });

    const formData = new FormData();
    files.forEach(file => formData.append('file', file));

    try {
      const response = await fetch(`${API_BASE_URL}/api/pdf2word`, { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Gagal terhubung ke Server.');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = files.length > 1 ? 'pdf_ke_word.zip' : files[0].name.replace('.pdf', '.docx');
      a.click();
      URL.revokeObjectURL(url);
      
      setMessage({ text: 'Berhasil dikonversi ke Word!', type: 'success' });
      setFiles([]);
    } catch (error) {
      setMessage({ text: error.message, type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {files.length === 0 ? (
        <UploadZone onUpload={() => fileInputRef.current.click()} onFileDrop={handleFileDrop} text="Pilih atau Tarik (Drag) file PDF" />
      ) : (
        <div className="space-y-4">
          <FileList files={files} onRemove={removeFile} />
          <button onClick={() => fileInputRef.current.click()} className="w-full py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-xl hover:border-blue-500 hover:text-blue-600 font-medium">
            + Tambah File PDF Lainnya
          </button>
        </div>
      )}
      <input type="file" multiple accept="application/pdf" className="hidden" ref={fileInputRef} onChange={(e) => {
        const newFiles = Array.from(e.target.files);
        setFiles(prev => [...prev, ...newFiles]);
        e.target.value = null;
      }} />
      <StatusMessage message={message} />
      <ProcessButton onClick={processBackend} isProcessing={isProcessing} disabled={files.length === 0} icon={FileText} text="Konversi ke Word" />
    </div>
  );
}

// 7. Office (Word) ke PDF
function OfficeToPDF() {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const fileInputRef = useRef(null);

  const handleFileDrop = (droppedFiles) => {
    const droppedFilesArray = Array.from(droppedFiles).filter(f => f.name.endsWith('.doc') || f.name.endsWith('.docx') || f.name.endsWith('.rtf'));
    if (droppedFilesArray.length > 0) {
      setFiles(prev => [...prev, ...droppedFilesArray]);
    }
  };

  const removeFile = (indexToRemove) => {
    setFiles(files.filter((_, idx) => idx !== indexToRemove));
  };

  const processBackend = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setMessage({ text: `Server sedang mengonversi ${files.length} dokumen Anda ke PDF...`, type: 'info' });

    const formData = new FormData();
    files.forEach(file => formData.append('file', file));

    try {
      const response = await fetch(`${API_BASE_URL}/api/office2pdf`, { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Gagal terhubung ke Server atau format tidak didukung.');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = files.length > 1 ? 'office_ke_pdf.zip' : files[0].name.substring(0, files[0].name.lastIndexOf('.')) + '.pdf';
      a.click();
      URL.revokeObjectURL(url);
      
      setMessage({ text: 'Berhasil dikonversi ke PDF!', type: 'success' });
      setFiles([]);
    } catch (error) {
      setMessage({ text: error.message, type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {files.length === 0 ? (
        <UploadZone onUpload={() => fileInputRef.current.click()} onFileDrop={handleFileDrop} text="Pilih atau Tarik (Drag) file Word/Office (.docx)" />
      ) : (
        <div className="space-y-4">
          <FileList files={files} onRemove={removeFile} />
          <button onClick={() => fileInputRef.current.click()} className="w-full py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-xl hover:border-blue-500 hover:text-blue-600 font-medium">
            + Tambah File Office Lainnya
          </button>
        </div>
      )}
      <input type="file" multiple accept=".doc,.docx,.rtf" className="hidden" ref={fileInputRef} onChange={(e) => {
        const newFiles = Array.from(e.target.files);
        setFiles(prev => [...prev, ...newFiles]);
        e.target.value = null;
      }} />
      <StatusMessage message={message} />
      <ProcessButton onClick={processBackend} isProcessing={isProcessing} disabled={files.length === 0} icon={FilePlus} text="Konversi ke PDF" />
    </div>
  );
}

// 8. PDF ke Gambar (ZIP) 
function PDFToJPG() {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const fileInputRef = useRef(null);

  const handleFileDrop = (droppedFiles) => {
    const droppedFilesArray = Array.from(droppedFiles).filter(f => f.type === 'application/pdf');
    if (droppedFilesArray.length > 0) {
      setFiles(prev => [...prev, ...droppedFilesArray]);
    }
  };

  const removeFile = (indexToRemove) => {
    setFiles(files.filter((_, idx) => idx !== indexToRemove));
  };

  const processBackend = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setMessage({ text: 'Server sedang memotong PDF menjadi gambar...', type: 'info' });

    const formData = new FormData();
    files.forEach(file => formData.append('file', file));

    try {
      const response = await fetch(`${API_BASE_URL}/api/pdf2img`, { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Gagal terhubung ke Server.');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = files.length > 1 ? 'gambar_pdf.zip' : files[0].name.replace('.pdf', '_gambar.zip');
      a.click();
      URL.revokeObjectURL(url);
      
      setMessage({ text: 'Berhasil! Gambar telah diunduh dalam bentuk file ZIP.', type: 'success' });
      setFiles([]);
    } catch (error) {
      setMessage({ text: error.message, type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {files.length === 0 ? (
        <UploadZone onUpload={() => fileInputRef.current.click()} onFileDrop={handleFileDrop} text="Pilih atau Tarik (Drag) file PDF" />
      ) : (
        <div className="space-y-4">
          <FileList files={files} onRemove={removeFile} />
          <button onClick={() => fileInputRef.current.click()} className="w-full py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-xl hover:border-blue-500 hover:text-blue-600 font-medium">
            + Tambah File PDF Lainnya
          </button>
        </div>
      )}
      <input type="file" multiple accept="application/pdf" className="hidden" ref={fileInputRef} onChange={(e) => {
        const newFiles = Array.from(e.target.files);
        setFiles(prev => [...prev, ...newFiles]);
        e.target.value = null;
      }} />
      <StatusMessage message={message} />
      <ProcessButton onClick={processBackend} isProcessing={isProcessing} disabled={files.length === 0} icon={ImageIcon} text="Ubah ke JPG (ZIP)" />
    </div>
  );
}

// 9. Proteksi PDF (Beri Password)
function ProtectPDF() {
  const [files, setFiles] = useState([]);
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const fileInputRef = useRef(null);

  const handleFileDrop = (droppedFiles) => {
    const droppedFilesArray = Array.from(droppedFiles).filter(f => f.type === 'application/pdf');
    if (droppedFilesArray.length > 0) {
      setFiles(prev => [...prev, ...droppedFilesArray]);
    }
  };

  const removeFile = (indexToRemove) => {
    setFiles(files.filter((_, idx) => idx !== indexToRemove));
  };

  const processBackend = async () => {
    if (files.length === 0 || !password) return;
    setIsProcessing(true);
    setMessage({ text: `Server sedang mengunci ${files.length} PDF Anda...`, type: 'info' });

    const formData = new FormData();
    files.forEach(file => formData.append('file', file));
    formData.append('password', password);

    try {
      const response = await fetch(`${API_BASE_URL}/api/protect`, { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Gagal terhubung ke Server.');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = files.length > 1 ? 'pdf_terkunci.zip' : files[0].name.replace('.pdf', '_terkunci.pdf');
      a.click();
      URL.revokeObjectURL(url);
      
      setMessage({ text: 'Berhasil! File Anda telah diproteksi.', type: 'success' });
      setFiles([]);
      setPassword('');
    } catch (error) {
      setMessage({ text: error.message, type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {files.length === 0 ? (
        <UploadZone onUpload={() => fileInputRef.current.click()} onFileDrop={handleFileDrop} text="Pilih atau Tarik (Drag) file PDF" />
      ) : (
        <div className="space-y-4">
          <FileList files={files} onRemove={removeFile} />
          <button onClick={() => fileInputRef.current.click()} className="w-full py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-xl hover:border-blue-500 hover:text-blue-600 font-medium">
            + Tambah File PDF Lainnya
          </button>
        </div>
      )}
      <input type="file" multiple accept="application/pdf" className="hidden" ref={fileInputRef} onChange={(e) => {
        const newFiles = Array.from(e.target.files);
        setFiles(prev => [...prev, ...newFiles]);
        e.target.value = null;
      }} />
      
      {files.length > 0 && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
            <Key size={16}/> Masukkan Password untuk PDF ini:
          </label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contoh: Rahasia123" className="w-full px-4 py-3 border border-gray-300 rounded-xl" />
        </div>
      )}
      
      <StatusMessage message={message} />
      <ProcessButton onClick={processBackend} isProcessing={isProcessing} disabled={files.length === 0 || !password} icon={Lock} text="Kunci PDF" />
    </div>
  );
}

// 10. Kompres PDF
function CompressPDF() {
  const [files, setFiles] = useState([]);
  const [targetSize, setTargetSize] = useState('');
  const [unit, setUnit] = useState('KB');
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const fileInputRef = useRef(null);

  const handleFileDrop = (droppedFiles) => {
    const droppedFilesArray = Array.from(droppedFiles).filter(f => f.type === 'application/pdf');
    if (droppedFilesArray.length > 0) {
      setFiles(prev => [...prev, ...droppedFilesArray]);
    }
  };

  const removeFile = (indexToRemove) => {
    setFiles(files.filter((_, idx) => idx !== indexToRemove));
  };

  const processBackend = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    
    let infoMessage = `Server sedang mengompres ${files.length} PDF Anda`;
    if (targetSize) {
      infoMessage += ` (Target: ${targetSize} ${unit})...`;
    } else {
      infoMessage += ' secara otomatis...';
    }
    
    setMessage({ text: infoMessage, type: 'info' });

    const formData = new FormData();
    files.forEach(file => {
      formData.append('file', file);
    });
    
    if (targetSize) {
      formData.append('targetSize', targetSize);
      formData.append('unit', unit);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/compress`, { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Gagal terhubung ke Server.');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = files.length > 1 ? 'pdf_terkompresi.zip' : files[0].name.replace('.pdf', '_terkompresi.pdf');
      a.click();
      URL.revokeObjectURL(url);
      
      setMessage({ text: 'Berhasil! Ukuran file PDF Anda telah diperkecil.', type: 'success' });
      setFiles([]);
      setTargetSize('');
    } catch (error) {
      setMessage({ text: error.message, type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {files.length === 0 ? (
        <UploadZone onUpload={() => fileInputRef.current.click()} onFileDrop={handleFileDrop} text="Pilih atau Tarik (Drag) file PDF yang akan dikompres" />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {files.map((f, idx) => (
              <SingleFile key={idx} file={f} onRemove={() => removeFile(idx)} />
            ))}
          </div>
          <button 
            onClick={() => fileInputRef.current.click()} 
            className="w-full py-3 border-2 border-dashed border-gray-300 text-gray-600 rounded-xl hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-colors font-medium flex justify-center items-center gap-2"
          >
            + Tambah File PDF Lainnya
          </button>
        </div>
      )}
      <input type="file" multiple accept="application/pdf" className="hidden" ref={fileInputRef} onChange={(e) => {
        const newFiles = Array.from(e.target.files);
        setFiles(prev => [...prev, ...newFiles]);
        e.target.value = null;
      }} />
      
      {/* UI Tambahan untuk Input Target Ukuran File */}
      {files.length > 0 && (
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
          <label className="block text-sm font-semibold text-gray-700">
            Target Ukuran File <span className="text-gray-400 font-normal">(Opsional)</span>
          </label>
          <div className="flex space-x-3">
            <input 
              type="number" 
              min="1"
              value={targetSize} 
              onChange={(e) => setTargetSize(e.target.value)} 
              placeholder="Contoh: 500" 
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
            />
            <select 
              value={unit} 
              onChange={(e) => setUnit(e.target.value)} 
              className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none font-medium"
            >
              <option value="KB">KB</option>
              <option value="MB">MB</option>
            </select>
          </div>
          <p className="text-xs text-gray-500">
            Biarkan kosong jika Anda ingin menggunakan kompresi otomatis (rekomendasi).
          </p>
        </div>
      )}

      <StatusMessage message={message} />
      <ProcessButton onClick={processBackend} isProcessing={isProcessing} disabled={files.length === 0} icon={Minimize} text="Kompres Sekarang" />
    </div>
  );
}

// 11. Komponen Info 
function BackendRequiredFeature({ featureName }) {
  return (
    <div className="text-center py-12 space-y-6">
      <div className="bg-gradient-to-br from-orange-100 to-red-100 text-orange-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-orange-200">
        <Settings size={36} className="animate-spin-slow" />
      </div>
      <h3 className="text-2xl font-bold text-gray-800">Fitur "{featureName}" Sedang Dalam Pengembangan</h3>
      <p className="text-gray-600 max-w-lg mx-auto leading-relaxed">
        Fitur ini rencananya akan dibuat di masa depan.
      </p>
    </div>
  );
}

// --- KOMPONEN BANTUAN UI ---

function UploadZone({ onUpload, onFileDrop, text }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (onFileDrop) onFileDrop(e.dataTransfer.files);
    }
  };

  return (
    <div 
      onClick={onUpload} 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all group ${
        isDragging ? 'border-blue-500 bg-blue-100 scale-[1.02]' : 'border-blue-300 bg-blue-50/50 hover:bg-blue-50'
      }`}
    >
      <div className={`bg-white p-4 rounded-full shadow-sm mb-4 transition-transform ${isDragging ? 'scale-125' : 'group-hover:scale-110'}`}>
        <UploadCloud size={32} className={`text-blue-500 ${isDragging ? 'animate-bounce' : ''}`} />
      </div>
      <p className="text-gray-600 font-medium text-center">
        {isDragging ? 'Lepaskan file Anda di sini...' : text}
      </p>
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

function FileList({ files, onRemove, onMoveUp, onMoveDown, isImage }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-2 max-h-60 overflow-y-auto space-y-2">
      {files.map((file, index) => (
        <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-gray-100 group">
          <div className="flex items-center space-x-3 overflow-hidden flex-1">
            <span className="text-xs font-bold text-gray-400 w-4 text-right shrink-0">{index + 1}.</span>
            {isImage ? <ImageIcon className="text-green-500 shrink-0" size={20} /> : <FileText className="text-blue-500 shrink-0" size={20} />}
            <span className="text-sm font-medium text-gray-700 truncate">{file.name}</span>
          </div>
          <div className="flex items-center space-x-1 shrink-0">
            {onMoveUp && (
              <button onClick={() => onMoveUp(index)} disabled={index === 0} className={`p-1.5 rounded-md transition-colors ${index === 0 ? 'text-gray-200' : 'text-gray-500 hover:bg-gray-100'}`}>
                <ChevronUp size={18} />
              </button>
            )}
            {onMoveDown && (
              <button onClick={() => onMoveDown(index)} disabled={index === files.length - 1} className={`p-1.5 rounded-md transition-colors ${index === files.length - 1 ? 'text-gray-200' : 'text-gray-500 hover:bg-gray-100'}`}>
                <ChevronDown size={18} />
              </button>
            )}
            {(onMoveUp || onMoveDown) && <div className="w-px h-5 bg-gray-200 mx-1"></div>}
            <button onClick={() => onRemove(index)} className="text-red-400 hover:bg-red-50 p-1.5 rounded-md"><Trash2 size={16} /></button>
          </div>
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