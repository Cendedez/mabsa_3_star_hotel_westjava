# MABSA 3-Star Hotel West Java

Repositori ini berisi dataset, script scraping, file labelling, dan notebook eksperimen untuk penelitian **Multimodal Aspect-Based Sentiment Analysis (MABSA)** pada ulasan hotel bintang 3 di Jawa Barat.

Fokus utama proyek adalah menganalisis sentimen customer hotel pada level aspek, bukan hanya sentimen umum. Setiap review dianalisis berdasarkan dua modality:

- **Teks review** dari customer.
- **Gambar review** yang diunggah customer.

Penelitian ini memakai 7 aspek hotel:

| Aspek | Cakupan Makna |
|---|---|
| Kamar | Kamar, kasur, AC, TV, air panas, kamar mandi pribadi, ukuran kamar, kenyamanan, kedap suara |
| Kebersihan | Bersih/kotor, noda, bau, debu, sampah, sprei, handuk, toilet, kamar mandi kotor |
| Pelayanan | Staff, resepsionis, check-in/out, respons, keramahan, bantuan hotel |
| Harga | Murah, mahal, worth it, value for money, deposit, biaya tambahan, kesesuaian harga |
| Lokasi | Strategis, dekat tempat tertentu, akses, lingkungan, jauh/dekat |
| Fasilitas | Kolam, gym, rooftop, playground, lift, parkir, lobby, wifi, restoran sebagai fasilitas |
| Makanan | Sarapan, menu, rasa, variasi, porsi, makanan/minuman |

Label sentimen yang digunakan:

| Label | Makna |
|---|---|
| Positif | Review secara jelas memuji aspek tersebut |
| Negatif | Review secara jelas mengeluhkan aspek tersebut |
| Netral | Aspek disebut, tetapi sentimen biasa saja/campuran/tidak jelas |
| None | Aspek tidak disebut atau tidak dapat disimpulkan langsung dari modality tersebut |

Catatan teknis: ketika CSV dibaca dengan Pandas, string `None` dapat terbaca sebagai nilai kosong/`NaN`. Secara konseptual, nilai tersebut tetap merepresentasikan label `None`.

## Status Proyek Terbaru

Status pada branch `main` saat README ini diperbarui:

- Scraping Traveloka dan Tiket.com sudah tersedia.
- Dataset hasil merge awal tersedia.
- Labelling teks sudah tersedia.
- Labelling gambar sudah tersedia.
- Notebook pipeline resmi di repo saat ini berjalan sampai **Notebook 08**.
- Notebook 09 dan 10 sudah dihapus dari branch `main`, sehingga eksperimen fusion multimodal belum menjadi bagian progres resmi terbaru di repo ini.
- Proses modeling yang sudah terdokumentasi:
  - Text-only baseline dengan IndoBERT.
  - Image-only baseline dengan CLIP/ViT visual features.

## Struktur Repositori

```text
mabsa_3_star_hotel_westjava/
+-- Data Labelling/
|   +-- text_labelling.csv
|   +-- image_labelling.csv
+-- Data Scraping/
|   +-- dataset_mabsa_with_image.csv
|   +-- MABSA_Merge_Dataset.ipynb
|   +-- scrap_tiket.js
|   +-- scrap_traveloka.js
|   +-- link_data_image.txt
|   +-- Daftar Hotel Scrap.txt
|   +-- Tiket/
|   +-- Traveloka/
+-- Main notebook/
|   +-- 01-dataset-integration-quality-audit.ipynb
|   +-- 02-multimodal-relation-taxonomy-and-final-policy.ipynb
|   +-- 03-final-dataset-builder-and-splits.ipynb
|   +-- 04-label-distribution-and-split-audit.ipynb
|   +-- 05-text-preprocessing-indobert-dataset.ipynb
|   +-- 06-image-preprocessing-feature-dataset.ipynb
|   +-- 07-text-only-baseline-indobert.ipynb
|   +-- 08-image-only-baseline-vit-or-clip.ipynb
+-- README.md
```

## Ringkasan Data

Dataset dikumpulkan dari dua Online Travel Agent (OTA):

| Platform | Jumlah Review Final Text-Labelled |
|---|---:|
| Traveloka | 5.927 |
| Tiket | 2.113 |

Distribusi wilayah pada data final text-labelled:

| Wilayah | Jumlah Review |
|---|---:|
| Bandung | 2.405 |
| Bogor | 1.442 |
| Pangandaran | 1.099 |
| Garut | 1.005 |
| Depok | 613 |
| Cirebon | 574 |
| Bekasi | 566 |
| Sukabumi | 249 |
| Subang | 87 |

File utama data:

| File | Jumlah Baris | Keterangan |
|---|---:|---|
| `Data Scraping/dataset_mabsa_with_image.csv` | 8.059 review | Hasil merge awal review yang memiliki teks dan minimal satu link gambar. File ini sudah memiliki kolom `Review_Date`. |
| `Data Labelling/text_labelling.csv` | 8.040 review | Dataset final untuk label teks. Ini adalah source of truth untuk label teks 7 aspek. |
| `Data Labelling/image_labelling.csv` | 17.385 gambar | Dataset label gambar pada level image. Berisi 8.038 unique `ID_Review`. |

Catatan penting tentang perbedaan jumlah:

- File merge awal berisi 8.059 review karena merupakan hasil gabungan scraping.
- File labelling teks berisi 8.040 review karena sudah melalui proses kurasi/labelling.
- File labelling gambar memiliki 8.038 unique review karena terdapat review yang tidak memiliki gambar valid setelah verifikasi metadata.
- Pipeline notebook 01-08 memakai dataset multimodal yang sudah diaudit dan difilter agar tidak terjadi kebocoran split dan agar pasangan text-image valid.

## Daftar Hotel

Dataset scraping mencakup 26 hotel dari 9 wilayah di Jawa Barat. Setiap hotel tersedia dari Traveloka dan Tiket.com.

| No | Hotel | Wilayah |
|---:|---|---|
| 1 | Atlantic City Hotel | Bandung |
| 2 | Hay Bandung | Bandung |
| 3 | Meize City Center Bandung | Bandung |
| 4 | YELLO Hotel Paskal Bandung | Bandung |
| 5 | favehotel Premier Cihampelas | Bandung |
| 6 | ibis Bandung Trans Studio | Bandung |
| 7 | BATIQA Hotel Jababeka Cikarang | Bekasi |
| 8 | Hotel Santika Mega City Bekasi | Bekasi |
| 9 | Yusra Inn Hotel Bekasi | Bekasi |
| 10 | Zuri Express Lippo Cikarang | Bekasi |
| 11 | D'Anaya Hotel Bogor | Bogor |
| 12 | Hotel Santika Bogor | Bogor |
| 13 | Whiz Prime Hotel Pajajaran Bogor | Bogor |
| 14 | Hotel Neo Cirebon by ASTON | Cirebon |
| 15 | Verse Hotel Cirebon | Cirebon |
| 16 | Hotel Santika Depok | Depok |
| 17 | Savero Hotel Depok | Depok |
| 18 | favehotel Margonda | Depok |
| 19 | Hotel Tirta Kencana Cipanas Garut | Garut |
| 20 | favehotel Cimanuk Garut | Garut |
| 21 | Laut Biru Resort Hotel | Pangandaran |
| 22 | Sun In Pangandaran Hotel | Pangandaran |
| 23 | Surya Kencana Seaside Hotel | Pangandaran |
| 24 | favehotel Pamanukan | Subang |
| 25 | Fresh Hotel Sukabumi | Sukabumi |
| 26 | Sparks Odeon Sukabumi | Sukabumi |

## Distribusi Label Teks

Distribusi label pada `Data Labelling/text_labelling.csv`:

| Aspek | None | Positif | Negatif | Netral |
|---|---:|---:|---:|---:|
| Kamar | 3.898 | 2.654 | 1.059 | 429 |
| Kebersihan | 5.027 | 1.887 | 965 | 161 |
| Pelayanan | 4.206 | 3.259 | 394 | 181 |
| Harga | 6.855 | 816 | 201 | 168 |
| Lokasi | 4.952 | 2.838 | 106 | 144 |
| Fasilitas | 5.248 | 1.539 | 820 | 433 |
| Makanan | 5.071 | 1.965 | 445 | 559 |

Distribusi ini menunjukkan bahwa label `None` dominan pada banyak aspek. Karena itu, evaluasi model tidak cukup memakai accuracy saja. Macro-F1 digunakan sebagai metrik penting agar performa pada kelas minoritas tetap terlihat.

## Distribusi Label Gambar

Distribusi label pada `Data Labelling/image_labelling.csv`:

| Aspek | None | Positif | Negatif | Netral |
|---|---:|---:|---:|---:|
| Kamar | 10.912 | 2.874 | 424 | 3.175 |
| Kebersihan | 2.303 | 10.809 | 463 | 3.810 |
| Pelayanan | 16.841 | 544 | 0 | 0 |
| Harga | 17.264 | 121 | 0 | 0 |
| Lokasi | 9.486 | 7.749 | 0 | 150 |
| Fasilitas | 11.117 | 6.234 | 14 | 20 |
| Makanan | 15.345 | 1.798 | 4 | 238 |

Distribusi gambar menunjukkan bahwa tidak semua aspek mudah terlihat dari gambar. Contohnya, `Pelayanan` dan `Harga` hampir selalu `None` pada modality gambar karena aspek tersebut biasanya muncul dari teks, bukan visual.

## Pipeline Pengerjaan

### 0. Scraping dan Merge Dataset

Folder terkait:

- `Data Scraping/scrap_traveloka.js`
- `Data Scraping/scrap_tiket.js`
- `Data Scraping/MABSA_Merge_Dataset.ipynb`
- `Data Scraping/dataset_mabsa_with_image.csv`

Tugas yang dilakukan:

- Mengambil review hotel dari Traveloka dan Tiket.com.
- Mengambil teks review dan link gambar.
- Mengelompokkan data berdasarkan platform, wilayah, dan nama hotel.
- Menggabungkan data scraping menjadi format seragam.
- Menyimpan review yang memiliki teks dan minimal satu gambar.
- Pada scraper Tiket.com, logic sudah memperhatikan review panjang yang tertutup tombol `Selengkapnya` agar teks tidak terpotong.

Kolom utama hasil merge:

```text
ID_Review
Platform
Wilayah
Nama_Hotel
Review_Date
Text_Review
Link_Gambar_1 ... Link_Gambar_10
```

### 1. Notebook 01 - Dataset Integration & Quality Audit

File:

- `Main notebook/01-dataset-integration-quality-audit.ipynb`

Fungsi:

- Menggabungkan text labelling dan image labelling berdasarkan `ID_Review`.
- Memeriksa missing text, missing image, duplikat, label invalid, tanggal review, dan jumlah gambar per review.
- Menghasilkan audit awal apakah dataset aman untuk diproses ke tahap MABSA.

Hasil audit penting dari run notebook:

| Item Audit | Hasil |
|---|---:|
| Text rows pada run audit | 8.038 |
| Image rows pada run audit | 17.385 |
| Unique review dengan gambar | 8.038 |
| Invalid label cells | 0 |
| Text tanpa image pada set audit | 0 |
| Image tanpa text pada set audit | 0 |
| Review date mismatch | 0 |
| Missing image filename | 0 |

### 2. Notebook 02 - Multimodal Relation Taxonomy & Final Dataset Policy

File:

- `Main notebook/02-multimodal-relation-taxonomy-and-final-policy.ipynb`

Fungsi:

- Mengklasifikasikan hubungan antara aspek pada teks dan gambar.
- Membedakan review yang correlated, uncorrelated, contradictory, text-only aspect, image-only aspect, dan both-no-aspect.
- Menentukan policy bucket untuk training, ablation, atau manual review.

Distribusi relation category:

| Relation Category | Count | Persentase |
|---|---:|---:|
| correlated_non_contradictive | 4.630 | 57,60% |
| uncorrelated_different_aspects | 1.572 | 19,56% |
| correlated_but_contradictive | 1.176 | 14,63% |
| image_aspect_only | 557 | 6,93% |
| text_aspect_only | 85 | 1,06% |
| both_no_aspect | 18 | 0,22% |

Makna metodologis:

- Tidak semua gambar relevan dengan teks review.
- Ada review yang teks dan gambarnya membahas aspek berbeda.
- Ada review yang saling berkorelasi tetapi sentimennya kontradiktif.
- Taxonomy ini penting agar model multimodal tidak dipaksa menganggap semua pasangan text-image selalu saling mendukung.

### 3. Notebook 03 - Final Dataset Builder & Split Strategy

File:

- `Main notebook/03-final-dataset-builder-and-splits.ipynb`

Fungsi:

- Membentuk dataset final untuk training.
- Membuat split train/validation/test yang konsisten.
- Membuat review-level dataset dan image-level manifest.
- Mencegah leakage antar split, terutama pada review yang memiliki banyak gambar.

Ringkasan dataset dari run notebook:

| Dataset Variant | Rows | Train | Validation | Test |
|---|---:|---:|---:|---:|
| all_valid | 8.030 | 5.620 | 1.205 | 1.205 |
| primary_training | 6.854 | 4.796 | 1.029 | 1.029 |
| core_clean | 4.628 | 3.240 | 694 | 694 |
| relation_aware | 6.837 | 4.785 | 1.026 | 1.026 |
| contradiction_ablation | 1.176 | 824 | 176 | 176 |

Dataset role:

| Dataset Role | Count | Persentase |
|---|---:|---:|
| core_clean_training | 4.628 | 57,58% |
| relation_aware_training | 2.209 | 27,48% |
| contradiction_ablation | 1.176 | 14,63% |
| all_none_control | 17 | 0,21% |
| excluded | 8 | 0,10% |

### 4. Notebook 04 - Label Distribution & Split Audit

File:

- `Main notebook/04-label-distribution-and-split-audit.ipynb`

Fungsi:

- Mengecek distribusi label per aspek.
- Mengecek distribusi label pada train/validation/test.
- Memastikan split tetap konsisten dan tidak menyebabkan leakage.
- Menyiapkan dasar evaluasi karena label MABSA sangat imbalanced.

Alasan tahap ini penting:

- Pada ABSA/MABSA, label `None` sering dominan.
- Jika split tidak dikontrol, model dapat terlihat baik karena menebak kelas mayoritas.
- Split final harus konsisten agar semua eksperimen dapat dibandingkan secara adil.

### 5. Notebook 05 - Text Preprocessing IndoBERT Dataset

File:

- `Main notebook/05-text-preprocessing-indobert-dataset.ipynb`

Fungsi:

- Menyiapkan input teks untuk IndoBERT.
- Melakukan tokenisasi dengan `indobenchmark/indobert-base-p1`.
- Membuat `input_ids`, `attention_mask`, `token_type_ids`, dan label matrix 7 aspek.
- Membuat class weights untuk mengatasi imbalance label.

Konfigurasi utama:

| Komponen | Nilai |
|---|---|
| Tokenizer | `indobenchmark/indobert-base-p1` |
| Max length | 256 token |
| Label mapping | `None=0`, `Negatif=1`, `Netral=2`, `Positif=3` |
| All valid rows | 8.030 |
| Primary training rows | 6.854 |
| Primary training split | 4.796 train, 1.029 validation, 1.029 test |
| Mean token length primary training | 38,36 token |
| P95 token length primary training | 106 token |
| Truncated primary training | 31 review atau 0,4523% |

### 6. Notebook 06 - Image Preprocessing Feature Dataset

File:

- `Main notebook/06-image-preprocessing-feature-dataset.ipynb`

Fungsi:

- Menyiapkan manifest gambar untuk model visual.
- Memvalidasi semua path gambar dari `image_cache`.
- Mengecek format, mode, ukuran, kualitas, dan potensi file rusak.
- Menyiapkan batch preprocessing memakai image processor CLIP/ViT.

Catatan penting:

- Folder `image_cache` tidak disimpan langsung di repo karena ukuran besar.
- Pada Kaggle, `image_cache` harus ditambahkan sebagai input dataset.

Ringkasan hasil image preprocessing:

| Item | Hasil |
|---|---:|
| Total image rows all_valid | 17.371 |
| Path ditemukan | 17.371 |
| Valid images | 17.371 |
| Usable images | 17.371 |
| Invalid/unusable images | 0 |
| Unique reviews | 8.030 |
| Format | 100% JPEG |
| Mode | 100% RGB |
| Median width | 720 |
| Median height | 960 |
| Total file size | Sekitar 1,56 GB atau 1.556,17 MB |
| Image processor | `openai/clip-vit-base-patch32` |
| Sample pixel values shape | `[16, 3, 224, 224]` |

### 7. Notebook 07 - Text-Only Baseline IndoBERT

File:

- `Main notebook/07-text-only-baseline-indobert.ipynb`

Fungsi:

- Melatih baseline model berbasis teks saja.
- Menggunakan IndoBERT sebagai text encoder.
- Memakai 7 classification head, satu head untuk setiap aspek.
- Memilih checkpoint terbaik berdasarkan validation macro-F1.

Konfigurasi utama:

| Komponen | Nilai |
|---|---|
| Model | `indobenchmark/indobert-base-p1` |
| Epoch | 5 |
| Best epoch | 5 |
| Batch size | 16 |
| Learning rate | 2e-5 |
| Weight decay | 0,01 |
| Dropout | 0,2 |
| Mixed precision | Aktif |
| Class weights | Aktif |

Hasil test set:

| Metrik | Nilai |
|---|---:|
| Accuracy | 0,851728 |
| Macro-F1 | 0,602567 |
| Weighted-F1 | 0,850413 |
| Non-None Macro-F1 | 0,499095 |

Interpretasi singkat:

- Text-only IndoBERT menjadi baseline kuat untuk aspek yang eksplisit muncul di teks seperti `Pelayanan`, `Makanan`, `Kebersihan`, dan `Kamar`.
- Accuracy cukup tinggi, tetapi macro-F1 lebih penting karena label `None` sangat dominan.

### 8. Notebook 08 - Image-Only Baseline ViT/CLIP

File:

- `Main notebook/08-image-only-baseline-vit-or-clip.ipynb`

Fungsi:

- Melatih baseline model berbasis gambar saja.
- Menggunakan visual encoder CLIP/ViT.
- Encoder visual dibuat frozen, lalu classifier head dilatih untuk label image 7 aspek.
- Mengukur seberapa kuat sinyal visual tanpa bantuan teks.

Konfigurasi utama:

| Komponen | Nilai |
|---|---|
| Model visual | `openai/clip-vit-base-patch32` |
| Feature shape | `[13976, 768]` |
| Best epoch | 30 |
| Head learning rate | 0,001 |
| Head dropout | 0,25 |
| Class weights | Aktif |
| Train rows | 9.770 |
| Validation rows | 2.141 |
| Test rows | 2.065 |

Hasil test set:

| Metrik | Nilai |
|---|---:|
| Accuracy | 0,913801 |
| Macro-F1 | 0,522666 |
| Weighted-F1 | 0,911843 |
| Non-None Macro-F1 | 0,384029 |

Interpretasi singkat:

- Image-only baseline terlihat tinggi pada accuracy karena label `None` dominan.
- Macro-F1 image-only masih di bawah text-only, sehingga teks masih menjadi modality yang lebih kuat untuk banyak aspek hotel.
- Gambar tetap berguna untuk aspek visual seperti `Kamar`, `Kebersihan`, `Lokasi`, dan `Fasilitas`.

## Catatan Metodologis

Pipeline ini dirancang dengan beberapa prinsip:

- **Aspect-based evaluation.** Evaluasi dilakukan per aspek, bukan hanya sentimen umum.
- **Multimodal relation awareness.** Tidak semua gambar yang diunggah customer relevan dengan teks review. Karena itu, relasi text-image dipetakan sebelum modeling.
- **No hallucination labelling.** Label hanya diberikan jika aspek dapat disimpulkan dari teks atau gambar, sesuai modality yang dinilai.
- **Class imbalance handling.** Label `None` dominan sehingga macro-F1 dan class weighting digunakan.
- **Fixed split.** Split train/validation/test dibuat tetap agar perbandingan eksperimen adil.
- **Review-level split for multi-image data.** Semua gambar dari satu review harus berada di split yang sama agar tidak terjadi data leakage.

Dasar metodologis yang relevan:

- ABSA/MABSA memerlukan evaluasi aspek dan polaritas secara terstruktur.
- IndoBERT cocok untuk teks Bahasa Indonesia karena dilatih pada korpus Indonesia dan umum dipakai untuk tugas NLU Indonesia.
- CLIP/ViT cocok sebagai baseline visual karena menghasilkan representasi gambar yang transferable.
- Macro-F1 lebih representatif daripada accuracy pada dataset imbalanced.

## Cara Menjalankan Notebook

Notebook disiapkan untuk dijalankan di Kaggle Notebook.

Urutan eksekusi:

1. Jalankan notebook 01 untuk audit integrasi data.
2. Jalankan notebook 02 untuk membuat taxonomy relasi text-image.
3. Jalankan notebook 03 untuk membangun dataset final dan split.
4. Jalankan notebook 04 untuk audit distribusi label dan split.
5. Jalankan notebook 05 untuk preprocessing IndoBERT.
6. Jalankan notebook 06 untuk preprocessing gambar.
7. Jalankan notebook 07 untuk baseline text-only IndoBERT.
8. Jalankan notebook 08 untuk baseline image-only CLIP/ViT.

Input penting di Kaggle:

- File dari `Data Labelling/`.
- Output dari notebook sebelumnya jika notebook dijalankan terpisah.
- Dataset `image_cache` sebagai Kaggle input untuk notebook gambar.

Output besar seperti checkpoint model, file `.npz`, dan cache gambar tidak disimpan di repo karena ukuran file besar. Output tersebut sebaiknya disimpan sebagai Kaggle output/dataset terpisah.

## Catatan Etika dan Privasi Data

Dataset berasal dari review publik OTA. Namun, untuk kepentingan akademik:

- Fokus analisis ada pada teks review, gambar review, aspek hotel, dan sentimen.
- Identitas reviewer tidak digunakan sebagai fitur modeling.
- Jika data akan dibagikan di luar pembimbing/penguji, disarankan melakukan anonymization pada data scraping mentah yang masih memuat nama reviewer.
- Gambar digunakan sebagai bukti visual review hotel, bukan untuk mengidentifikasi individu.

## Progres yang Belum Masuk Repo Resmi

Saat ini repo resmi berhenti pada:

- Notebook 07: text-only IndoBERT baseline.
- Notebook 08: image-only CLIP/ViT baseline.

Notebook fusion multimodal belum berprogres karena masih mengkaji metode fusion yang optimal untuk kedua model.


## Ringkasan Singkat Untuk Pembimbing

Penelitian ini membangun dataset MABSA hotel bintang 3 di Jawa Barat dari Traveloka dan Tiket.com. Dataset mencakup 26 hotel di 9 wilayah, dengan 8.040 review final berlabel teks dan 17.385 gambar berlabel image-level. Setiap review dianalisis pada 7 aspek hotel: kamar, kebersihan, pelayanan, harga, lokasi, fasilitas, dan makanan.

Pipeline sudah mencakup scraping, merge dataset, labelling teks dan gambar, audit kualitas data, taxonomy relasi text-image, pembuatan split train/validation/test, preprocessing IndoBERT, preprocessing gambar, baseline text-only IndoBERT, dan baseline image-only CLIP/ViT. Hasil sementara menunjukkan text-only IndoBERT mencapai test macro-F1 0,602567, sedangkan image-only CLIP/ViT mencapai test macro-F1 0,522666. Hal ini menunjukkan teks masih menjadi modality yang lebih kuat, tetapi gambar tetap memberi sinyal penting terutama untuk aspek visual seperti kamar, kebersihan, lokasi, dan fasilitas.
