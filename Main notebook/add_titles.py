import json
import os

notebook_path = "08-image-only-baseline-vit-or-clip.ipynb"

with open(notebook_path, "r", encoding="utf-8") as f:
    nb = json.load(f)

# Define titles for each code cell based on previous inspection
titles = {
    0: "# Tahap: Import Library dan Modul\n",
    1: "# Tahap: Inisialisasi Seed untuk Reproduksibilitas\n",
    2: "# Tahap: Import PyTorch dan Pengecekan Lingkungan\n",
    3: "# Tahap: Fungsi Bantuan Pencarian File Input\n",
    4: "# Tahap: Memuat Dataset Manifest dan Policy\n",
    5: "# Tahap: Fungsi Normalisasi Label Dataset\n",
    6: "# Tahap: Pencarian Model Pre-trained (ViT/CLIP)\n",
    7: "# Tahap: Definisi Dataset PyTorch untuk Gambar\n",
    8: "# Tahap: Ekstraksi Fitur Gambar (Feature Extraction)\n",
    9: "# Tahap: Definisi Dataset PyTorch untuk Fitur Gambar\n",
    10: "# Tahap: Perhitungan Class Weights (Penanganan Imbalance)\n",
    11: "# Tahap: Definisi Arsitektur Model (Multi-Aspect Head)\n",
    12: "# Tahap: Definisi Fungsi Perhitungan Loss\n",
    13: "# Tahap: Loop Pelatihan Model (Training Loop)\n",
    14: "# Tahap: Memuat Checkpoint Model Terbaik (Load Checkpoint)\n",
    15: "# Tahap: Format Dataframe Hasil Prediksi\n",
    16: "# Tahap: Evaluasi Metrik Model (F1-Score, dll)\n",
    17: "# Tahap: Visualisasi Metrik Evaluasi\n",
    18: "# Tahap: Penyimpanan Konfigurasi Pelatihan\n",
    19: "# Tahap: Sanity Checks (Pengecekan Integritas Data)\n",
    20: "# Tahap: Pengarsipan Output (ZIP)\n"
}

code_cell_idx = 0
for cell in nb["cells"]:
    if cell["cell_type"] == "code":
        # Check if title already exists to avoid duplicates
        title = titles.get(code_cell_idx)
        if title:
            if not cell["source"] or not cell["source"][0].startswith("# Tahap:"):
                # Insert at the beginning of the source list
                cell["source"].insert(0, title)
                if len(cell["source"]) > 1 and not cell["source"][1].startswith('\n'):
                    cell["source"].insert(1, "\n")
        code_cell_idx += 1

# Save back to notebook
with open(notebook_path, "w", encoding="utf-8") as f:
    json.dump(nb, f, indent=1, ensure_ascii=False)

print("Berhasil menambahkan judul ke setiap sel kode.")
