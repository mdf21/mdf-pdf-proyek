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

# --- FITUR 5: KOMPRES PDF (DENGAN TARGET UKURAN) ---
def compress_with_image_reduction(pdf_path, output_path, max_width=800, max_height=600):
    """Kompresi PDF dengan mengurangi kualitas dan ukuran gambar"""
    try:
        doc = fitz.open(pdf_path)
        
        # Iterasi setiap halaman untuk kompresi gambar
        for page_num in range(len(doc)):
            page = doc[page_num]
            
            # Dapatkan semua gambar di halaman
            images = page.get_images()
            
            for img_index in images:
                xref = img_index[0]
                
                try:
                    # Ekstrak gambar
                    pix = fitz.Pixmap(doc, xref)
                    
                    # Turunkan kualitas: dari RGB ke L (grayscale) jika perlu
                    if pix.n - pix.alpha > 1:  # Jika bukan grayscale
                        pix = fitz.Pixmap(fitz.csGRAY, pix)
                    
                    # Buat pixmap baru dengan dimensi yang lebih kecil (sample 75%)
                    new_width = max(int(pix.width * 0.75), 100)
                    new_height = max(int(pix.height * 0.75), 100)
                    
                    if pix.width > max_width or pix.height > max_height:
                        # Resize gambar
                        ratio = min(max_width / pix.width, max_height / pix.height)
                        new_width = int(pix.width * ratio)
                        new_height = int(pix.height * ratio)
                    
                    # Kompresi gambar
                    new_pix = fitz.Pixmap(pix, new_width, new_height)
                    
                    # Ganti gambar di PDF
                    image_bytes = new_pix.tobytes("jpeg")
                    doc.replace_image(xref, stream=image_bytes)
                    
                except Exception as e:
                    print(f"Tidak dapat mengompresi gambar {xref}: {e}")
        
        # Simpan dengan kompresi maksimal
        doc.save(
            output_path,
            garbage=4,
            deflate=True,
            clean=True,
            pretty=False
        )
        doc.close()
        return True
    except Exception as e:
        print(f"Error dalam image reduction: {e}")
        return False

@app.route('/api/compress', methods=['POST'])
def compress_pdf():
    if 'file' not in request.files:
        return jsonify({"error": "Tidak ada file"}), 400
    
    files = request.files.getlist('file')
    if not files:
        return jsonify({"error": "Tidak ada file"}), 400
        
    target_size = request.form.get('targetSize')
    unit = request.form.get('unit', 'KB')
    
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
            compressed_files.append((file.filename, temp_compressed.name))

            # 1. Kompresi dasar dengan PyMuPDF
            doc = fitz.open(temp_pdf.name)
            doc.save(temp_compressed.name, garbage=4, deflate=True, clean=True)
            doc.close()
            
            current_size = os.path.getsize(temp_compressed.name)
            
            # 2. Jika belum mencapai target, coba kurangi kualitas gambar
            if target_bytes and current_size > target_bytes:
                print(f"Kompresi gambar... (Ukuran saat ini: {current_size/1024:.1f}KB, Target: {target_bytes/1024:.1f}KB)")
                
                # Tingkat pengurangan kualitas gambar
                quality_steps = [
                    {'max_width': 800, 'max_height': 600},   # 75% ukuran gambar
                    {'max_width': 600, 'max_height': 450},   # 50% ukuran gambar
                    {'max_width': 400, 'max_height': 300},   # 30% ukuran gambar
                    {'max_width': 200, 'max_height': 150},   # 20% ukuran gambar
                ]
                
                for step in quality_steps:
                    if current_size <= target_bytes:
                        break
                    
                    temp_quality = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
                    temp_quality.close()
                    
                    compress_with_image_reduction(
                        temp_compressed.name, 
                        temp_quality.name,
                        max_width=step['max_width'],
                        max_height=step['max_height']
                    )
                    
                    new_size = os.path.getsize(temp_quality.name)
                    if new_size < current_size:  # Hanya gunakan jika lebih kecil
                        shutil.copy(temp_quality.name, temp_compressed.name)
                        current_size = new_size
                        print(f"Ukuran setelah kompresi: {new_size/1024:.1f}KB")
                    
                    os.remove(temp_quality.name)
            
            # 3. Terakhir, coba Ghostscript untuk ukuran sangat kecil atau jika target belum tercapai
            if not target_bytes or (target_bytes and os.path.getsize(temp_compressed.name) > target_bytes):
                quality_levels = ['/ebook', '/screen'] if target_bytes else ['/screen']
                gs_cmd = 'gswin64c' if os.name == 'nt' else 'gs'
                
                print(f"🚀 Menggunakan Ghostscript untuk kompresi ekstrem...")
                for quality in quality_levels:
                    try:
                        temp_gs = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
                        temp_gs.close()
                        
                        print(f"📊 Mencoba Ghostscript dengan setting {quality}...")
                        subprocess.run([
                            gs_cmd, '-sDEVICE=pdfwrite', '-dCompatibilityLevel=1.4',
                            f'-dPDFSETTINGS={quality}',
                            '-dNOPAUSE', '-dQUIET', '-dBATCH',
                            f'-sOutputFile={temp_gs.name}', temp_compressed.name
                        ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                        
                        gs_size = os.path.getsize(temp_gs.name)
                        
                        if target_bytes:
                            print(f"✅ Ghostscript berhasil! Ukuran: {gs_size/1024:.1f}KB (Target: {target_bytes/1024:.1f}KB)")
                            if gs_size <= target_bytes:
                                shutil.copy(temp_gs.name, temp_compressed.name)
                                os.remove(temp_gs.name)
                                print(f"✨ TARGET TERCAPAI! File dikompres ke {gs_size/1024:.1f}KB")
                                break
                        else:
                            print(f"✅ Ghostscript berhasil! Ukuran: {gs_size/1024:.1f}KB (Kompresi Ekstrem)")
                            if gs_size < os.path.getsize(temp_compressed.name):
                                shutil.copy(temp_gs.name, temp_compressed.name)
                            os.remove(temp_gs.name)
                            break
                        
                        if os.path.exists(temp_gs.name):
                            os.remove(temp_gs.name)
                    except FileNotFoundError:
                        print("❌ Ghostscript tidak tersedia di sistem ini")
                        break
                    except Exception as e:
                        print(f"⚠️  Ghostscript error: {e}")

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