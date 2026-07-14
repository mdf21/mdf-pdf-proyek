from docx2pdf import convert as docx_convert
import pythoncom
import os
import tempfile
import zipfile
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

# --- FITUR 1: PDF KE WORD ---
@app.route('/api/pdf2word', methods=['POST'])
def convert_pdf_to_word():
    if 'file' not in request.files:
        return jsonify({"error": "Tidak ada file"}), 400
    
    file = request.files['file']
    if file:
        temp_pdf = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
        file.save(temp_pdf.name)
        temp_docx = tempfile.NamedTemporaryFile(delete=False, suffix=".docx")
        temp_docx.close()

        try:
            cv = Converter(temp_pdf.name)
            cv.convert(temp_docx.name, start=0, end=None)
            cv.close()
            return send_file(temp_docx.name, as_attachment=True, download_name="hasil_konversi.docx")
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        finally:
            if os.path.exists(temp_pdf.name): os.remove(temp_pdf.name)

# --- FITUR 2: PROTEKSI PDF (Beri Password) ---
@app.route('/api/protect', methods=['POST'])
def protect_pdf():
    if 'file' not in request.files or 'password' not in request.form:
        return jsonify({"error": "File atau password tidak ditemukan"}), 400
    
    file = request.files['file']
    password = request.form['password']
    
    if file:
        temp_pdf = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
        file.save(temp_pdf.name)
        temp_protected = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
        temp_protected.close()

        try:
            # Membuka PDF dan menyimpannya kembali dengan enkripsi/password
            pdf = pikepdf.Pdf.open(temp_pdf.name)
            pdf.save(temp_protected.name, encryption=pikepdf.Encryption(owner=password, user=password))
            
            return send_file(temp_protected.name, as_attachment=True, download_name="pdf_terkunci.pdf")
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        finally:
            if os.path.exists(temp_pdf.name): os.remove(temp_pdf.name)

# --- FITUR 3: PDF KE GAMBAR (JPG/PNG) ---
@app.route('/api/pdf2img', methods=['POST'])
def pdf_to_image():
    if 'file' not in request.files:
        return jsonify({"error": "Tidak ada file"}), 400
    
    file = request.files['file']
    if file:
        temp_pdf = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
        file.save(temp_pdf.name)
        
        # Buat file ZIP untuk menampung gambar dari setiap halaman
        temp_zip = tempfile.NamedTemporaryFile(delete=False, suffix=".zip")
        
        try:
            doc = fitz.open(temp_pdf.name)
            with zipfile.ZipFile(temp_zip.name, 'w') as zipf:
                for page_num in range(len(doc)):
                    page = doc.load_page(page_num)
                    pix = page.get_pixmap(dpi=150) # Resolusi gambar
                    
                    img_path = f"halaman_{page_num + 1}.png"
                    pix.save(img_path)
                    
                    zipf.write(img_path)
                    os.remove(img_path) # Hapus gambar setelah masuk ZIP
            
            return send_file(temp_zip.name, as_attachment=True, download_name="hasil_gambar.zip", mimetype='application/zip')
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        finally:
            try:
                if os.path.exists(temp_pdf.name): os.remove(temp_pdf.name)
            except Exception:
                pass

# --- FITUR 4: KOMPRES PDF ---
@app.route('/api/compress', methods=['POST'])
def compress_pdf():
    if 'file' not in request.files:
        return jsonify({"error": "Tidak ada file"}), 400
    
    file = request.files['file']
    if file:
        temp_pdf = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
        file.save(temp_pdf.name)
        temp_compressed = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
        temp_compressed.close()

        try:
            # Menggunakan pikepdf untuk mengoptimalkan/memperkecil struktur PDF
            with pikepdf.Pdf.open(temp_pdf.name) as pdf:
                pdf.save(temp_compressed.name, object_stream_mode=pikepdf.ObjectStreamMode.generate)
            
            return send_file(temp_compressed.name, as_attachment=True, download_name="pdf_terkompresi.pdf")
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        finally:
            try:
                if os.path.exists(temp_pdf.name): os.remove(temp_pdf.name)
            except Exception:
                pass
# --- FITUR 5: OFFICE (WORD) KE PDF ---
@app.route('/api/office2pdf', methods=['POST'])
def office_to_pdf():
    if 'file' not in request.files:
        return jsonify({"error": "Tidak ada file"}), 400
    
    file = request.files['file']
    if file:
        temp_docx = tempfile.NamedTemporaryFile(delete=False, suffix=".docx")
        file.save(temp_docx.name)
        temp_docx.close()
        
        temp_pdf = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
        temp_pdf.close()

        try:
            # Dibutuhkan oleh Windows agar Flask bisa menggunakan MS Word di background
            pythoncom.CoInitialize()
            
            # Proses Konversi
            docx_convert(temp_docx.name, temp_pdf.name)
            
            return send_file(temp_pdf.name, as_attachment=True, download_name="hasil_konversi.pdf")
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        finally:
            try:
                if os.path.exists(temp_docx.name): os.remove(temp_docx.name)
                if os.path.exists(temp_pdf.name): os.remove(temp_pdf.name)
            except Exception:
                pass
            
if __name__ == '__main__':
    app.run(debug=True, port=5000)