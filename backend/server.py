import os
import shutil
import tempfile
import zipfile
import subprocess
from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from pdf2docx import Converter
import pikepdf
import fitz  # PyMuPDF

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return "Super PDF Backend API sedang berjalan dengan Fitur PRO! 🚀"

@app.route('/health')
def health():
    return jsonify({"status": "ok"})

# Helper function for zipping multiple files
def zip_multiple_files(processed_files, zip_filename, name_modifier=lambda x: x):
    temp_zip = tempfile.NamedTemporaryFile(delete=False, suffix=".zip")
    temp_zip.close()
    
    with zipfile.ZipFile(temp_zip.name, 'w') as zipf:
        for idx, (orig_name, comp_path) in enumerate(processed_files):
            new_name = name_modifier(orig_name)
            zip_names = zipf.namelist()
            if new_name in zip_names:
                base, ext = os.path.splitext(new_name)
                new_name = f"{base}_{idx}{ext}"
            zipf.write(comp_path, arcname=new_name)
            
    return temp_zip.name

# --- FITUR 1: PDF KE WORD ---
@app.route('/api/pdf2word', methods=['POST'])
def convert_pdf_to_word():
    if 'file' not in request.files:
        return jsonify({"error": "Tidak ada file"}), 400
    
    files = request.files.getlist('file')
    if not files:
        return jsonify({"error": "Tidak ada file"}), 400

    temp_files = []
    converted_files = []

    try:
        for file in files:
            if file.filename == '': continue
            temp_pdf = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
            file.save(temp_pdf.name)
            temp_files.append(temp_pdf.name)

            temp_docx = tempfile.NamedTemporaryFile(delete=False, suffix=".docx")
            temp_docx.close()
            
            cv = Converter(temp_pdf.name)
            cv.convert(temp_docx.name, start=0, end=None)
            cv.close()
            
            converted_files.append((file.filename, temp_docx.name))

        if len(converted_files) == 1:
            dl_name = converted_files[0][0].replace('.pdf', '.docx')
            return send_file(converted_files[0][1], as_attachment=True, download_name=dl_name)
        elif len(converted_files) > 1:
            zip_path = zip_multiple_files(converted_files, "pdf2word.zip", lambda n: n.replace('.pdf', '.docx'))
            temp_files.append(zip_path)
            return send_file(zip_path, as_attachment=True, download_name="pdf_ke_word.zip")
        else:
            return jsonify({"error": "Tidak ada file yang diproses"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        for p in temp_files:
            try:
                if os.path.exists(p): os.remove(p)
            except: pass
        for _, p in converted_files:
            try:
                if os.path.exists(p): os.remove(p)
            except: pass

# --- FITUR 2: OFFICE (WORD) KE PDF ---
@app.route('/api/office2pdf', methods=['POST'])
def office_to_pdf():
    if 'file' not in request.files:
        return jsonify({"error": "Tidak ada file"}), 400
    
    files = request.files.getlist('file')
    if not files:
        return jsonify({"error": "Tidak ada file"}), 400

    temp_files = []
    converted_files = []

    try:
        for file in files:
            if file.filename == '': continue
            ext = os.path.splitext(file.filename)[1]
            temp_docx = tempfile.NamedTemporaryFile(delete=False, suffix=ext)
            file.save(temp_docx.name)
            temp_files.append(temp_docx.name)
            
            temp_pdf = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
            temp_pdf.close()
            
            if os.name == 'nt':
                import pythoncom
                from docx2pdf import convert as docx_convert
                pythoncom.CoInitialize()
                docx_convert(temp_docx.name, temp_pdf.name)
            else:
                output_dir = os.path.dirname(temp_pdf.name)
                subprocess.run(
                    [
                        'libreoffice', '--headless', '--convert-to', 'pdf',
                        '--outdir', output_dir, temp_docx.name
                    ],
                    check=True,
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                )
                generated_pdf = os.path.join(
                    output_dir,
                    os.path.splitext(os.path.basename(temp_docx.name))[0] + '.pdf'
                )
                if os.path.exists(generated_pdf):
                    shutil.move(generated_pdf, temp_pdf.name)
                else:
                    raise FileNotFoundError('Konversi Office ke PDF gagal.')
            
            converted_files.append((file.filename, temp_pdf.name))

        if len(converted_files) == 1:
            base = os.path.splitext(converted_files[0][0])[0]
            dl_name = f"{base}.pdf"
            return send_file(converted_files[0][1], as_attachment=True, download_name=dl_name)
        elif len(converted_files) > 1:
            zip_path = zip_multiple_files(converted_files, "office2pdf.zip", lambda n: f"{os.path.splitext(n)[0]}.pdf")
            temp_files.append(zip_path)
            return send_file(zip_path, as_attachment=True, download_name="office_ke_pdf.zip")
        else:
            return jsonify({"error": "Tidak ada file yang diproses"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        for p in temp_files:
            try:
                if os.path.exists(p): os.remove(p)
            except: pass
        for _, p in converted_files:
            try:
                if os.path.exists(p): os.remove(p)
            except: pass

# --- FITUR 3: PDF KE JPG (ZIP) ---
@app.route('/api/pdf2img', methods=['POST'])
def pdf_to_img():
    if 'file' not in request.files:
        return jsonify({"error": "Tidak ada file"}), 400
    
    files = request.files.getlist('file')
    if not files:
        return jsonify({"error": "Tidak ada file"}), 400

    temp_files = []
    
    try:
        temp_zip = tempfile.NamedTemporaryFile(delete=False, suffix=".zip")
        temp_zip.close()
        temp_files.append(temp_zip.name)

        with zipfile.ZipFile(temp_zip.name, 'w') as zipf:
            for file in files:
                if file.filename == '': continue
                temp_pdf = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
                file.save(temp_pdf.name)
                temp_files.append(temp_pdf.name)

                doc = fitz.open(temp_pdf.name)
                base_name = os.path.splitext(file.filename)[0]
                
                for page_num in range(len(doc)):
                    page = doc.load_page(page_num)
                    pix = page.get_pixmap(dpi=150)
                    img_bytes = pix.tobytes("jpeg")
                    
                    if len(files) > 1:
                        img_path = f"{base_name}/halaman_{page_num + 1}.jpg"
                    else:
                        img_path = f"halaman_{page_num + 1}.jpg"
                        
                    zipf.writestr(img_path, img_bytes)

        return send_file(temp_zip.name, as_attachment=True, download_name="gambar_pdf.zip")
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        for p in temp_files:
            try:
                if os.path.exists(p): os.remove(p)
            except: pass

# --- FITUR 4: PROTEKSI PDF ---
@app.route('/api/protect', methods=['POST'])
def protect_pdf():
    if 'file' not in request.files or 'password' not in request.form:
        return jsonify({"error": "Data tidak lengkap"}), 400
    
    files = request.files.getlist('file')
    if not files:
        return jsonify({"error": "Tidak ada file"}), 400
        
    password = request.form['password']

    temp_files = []
    protected_files = []

    try:
        for file in files:
            if file.filename == '': continue
            temp_pdf = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
            file.save(temp_pdf.name)
            temp_files.append(temp_pdf.name)
            
            temp_protected = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
            temp_protected.close()

            with pikepdf.Pdf.open(temp_pdf.name) as pdf:
                pdf.save(
                    temp_protected.name,
                    encryption=pikepdf.Encryption(user=password, owner=password, allow=pikepdf.Permissions(extract=False, print=False))
                )
            
            protected_files.append((file.filename, temp_protected.name))

        if len(protected_files) == 1:
            dl_name = protected_files[0][0].replace('.pdf', '_terkunci.pdf')
            return send_file(protected_files[0][1], as_attachment=True, download_name=dl_name)
        elif len(protected_files) > 1:
            zip_path = zip_multiple_files(protected_files, "protect.zip", lambda n: n.replace('.pdf', '_terkunci.pdf'))
            temp_files.append(zip_path)
            return send_file(zip_path, as_attachment=True, download_name="pdf_terkunci.zip")
        else:
            return jsonify({"error": "Tidak ada file yang diproses"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        for p in temp_files:
            try:
                if os.path.exists(p): os.remove(p)
            except: pass
        for _, p in protected_files:
            try:
                if os.path.exists(p): os.remove(p)
            except: pass

# --- FITUR 5: KOMPRES PDF ---
def run_ghostscript(input_path, output_path, quality_level='high'):
    gs_cmd = 'gswin64c' if os.name == 'nt' else 'gs'
    
    cmd = [
        gs_cmd,
        "-sDEVICE=pdfwrite",
        "-dCompatibilityLevel=1.4",
        "-dDetectDuplicateImages=true",
        "-dCompressFonts=true",
        "-dSubsetFonts=true",
        "-dNOPAUSE",
        "-dQUIET",
        "-dBATCH"
    ]
    
    if quality_level == 'low':
        cmd.extend([
            "-dPDFSETTINGS=/prepress",
            "-dColorImageResolution=150",
            "-dGrayImageResolution=150",
            "-dMonoImageResolution=150"
        ])
    elif quality_level == 'medium':
        cmd.extend([
            "-dPDFSETTINGS=/printer",
            "-dColorImageResolution=100",
            "-dGrayImageResolution=100",
            "-dMonoImageResolution=100"
        ])
    elif quality_level == 'extreme':
        cmd.extend([
            "-dPDFSETTINGS=/screen",
            "-dColorImageResolution=50",
            "-dGrayImageResolution=50",
            "-dMonoImageResolution=50",
            "-dAutoFilterColorImages=false",
            "-dColorImageFilter=/DCTEncode",
            "-dJPEGQ=45"
        ])
    else:
        # Default 'high'
        cmd.extend([
            "-dPDFSETTINGS=/ebook",
            "-dColorImageResolution=72",
            "-dGrayImageResolution=72",
            "-dMonoImageResolution=72"
        ])
        
    cmd.append(f"-sOutputFile={output_path}")
    cmd.append(input_path)
    
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

@app.route('/api/compress', methods=['POST'])
def compress_pdf():
    if 'file' not in request.files:
        return jsonify({"error": "Tidak ada file"}), 400
    
    files = request.files.getlist('file')
    if not files:
        return jsonify({"error": "Tidak ada file"}), 400
        
    target_size = request.form.get('targetSize')
    unit = request.form.get('unit', 'KB')
    compression_level = request.form.get('compressionLevel', 'high')
    
    target_bytes = None
    if target_size and target_size.strip() != "":
        target_bytes = float(target_size) * (1024 * 1024 if unit == 'MB' else 1024)

    temp_files = []
    compressed_files = []

    try:
        for file in files:
            if file.filename == '':
                continue
                
            temp_pdf = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
            file.save(temp_pdf.name)
            temp_files.append(temp_pdf.name)
            
            temp_compressed = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
            temp_compressed.close()
            
            try:
                if target_bytes:
                    print(f"Mengompresi dengan target ukuran: {target_bytes/1024:.1f} KB")
                    levels_to_try = ['low', 'medium', 'high', 'extreme']
                    best_size = float('inf')
                    best_file = None
                    
                    for level in levels_to_try:
                        temp_gs = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
                        temp_gs.close()
                        
                        try:
                            print(f"Mencoba Ghostscript level: {level}...")
                            run_ghostscript(temp_pdf.name, temp_gs.name, level)
                            current_size = os.path.getsize(temp_gs.name)
                            
                            if current_size < best_size:
                                best_size = current_size
                                if best_file and os.path.exists(best_file):
                                    os.remove(best_file)
                                best_file = temp_gs.name
                            else:
                                os.remove(temp_gs.name)
                                
                            if best_size <= target_bytes:
                                print(f"✅ Target tercapai pada level {level}: {best_size/1024:.1f} KB")
                                break
                        except Exception as e:
                            print(f"Error pada Ghostscript level {level}: {e}")
                            if os.path.exists(temp_gs.name):
                                os.remove(temp_gs.name)
                                
                    if best_file:
                        shutil.copy(best_file, temp_compressed.name)
                        os.remove(best_file)
                    else:
                        shutil.copy(temp_pdf.name, temp_compressed.name)
                else:
                    print(f"Mengompresi dengan level: {compression_level}")
                    run_ghostscript(temp_pdf.name, temp_compressed.name, compression_level)
                    
            except FileNotFoundError:
                print("❌ Ghostscript tidak tersedia di sistem ini")
                shutil.copy(temp_pdf.name, temp_compressed.name)
            except Exception as e:
                print(f"⚠️ Error kompresi: {e}")
                shutil.copy(temp_pdf.name, temp_compressed.name)
                
            compressed_files.append((file.filename, temp_compressed.name))

        if len(compressed_files) == 1:
            return send_file(compressed_files[0][1], as_attachment=True, download_name=compressed_files[0][0].replace('.pdf', '_terkompresi.pdf'))
        elif len(compressed_files) > 1:
            zip_path = zip_multiple_files(compressed_files, "compress.zip", lambda n: n.replace('.pdf', '_terkompresi.pdf'))
            temp_files.append(zip_path)
            return send_file(zip_path, as_attachment=True, download_name="pdf_terkompresi.zip")
        else:
            return jsonify({"error": "Tidak ada file yang diproses"}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        for path in temp_files:
            try:
                if os.path.exists(path): os.remove(path)
            except: pass
        for _, path in compressed_files:
            try:
                if os.path.exists(path): os.remove(path)
            except: pass

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5000)