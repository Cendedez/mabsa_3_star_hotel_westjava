// ============================================================
// Tiket.com Hotel Review Scraper - JavaScript Console Script
// ============================================================
// Cara pakai:
//   1. Buka halaman review hotel di tiket.com
//      Contoh: https://www.tiket.com/id-id/review?product_type=TIXHOTEL&searchType=INVENTORY&inventory_id=HOTEL_ID&reviewSubmitColumn=RATING_SUMMARY
//   2. Tekan F12 -> tab Console
//   3. Paste seluruh kode ini -> Enter
//   4. Tunggu sampai selesai -> CSV otomatis terdownload
// ============================================================

(async function() {
    'use strict';

    // ====== KONFIGURASI ======
    const CONFIG = {
        MAX_PAGES: 999,           // Maksimal halaman yang di-scrape (999 = semua)
        MAX_PHOTOS_PER_REVIEW: 10, // Maksimal kolom foto di CSV
        CLICK_DELAY: 1500,         // Delay setelah klik (ms)
        PAGE_LOAD_DELAY: 3000,     // Delay setelah pindah halaman (ms)
        SCROLL_DELAY: 300,         // Delay saat scroll (ms)
        EXPAND_READ_MORE: true,    // Expand teks panjang sebelum diambil
        READ_MORE_TIMEOUT: 4000,   // Batas tunggu setelah klik "Selengkapnya" (ms)
        READ_MORE_POLL: 200,       // Interval cek perubahan teks setelah klik (ms)

        // Supaya scrape ulang tidak mengambil review baru yang belum dilabeli.
        // Kosongkan CURRENT_HOTEL_NAME untuk auto-detect dari halaman.
        // Jika auto-detect gagal, isi manual, contoh: "Atlantic City Hotel".
        ONLY_LABELED_REVIEW_WINDOW: true,
        CURRENT_HOTEL_NAME: '',
        LABELED_TIKET_SCOPE_BY_HOTEL: {
            'Atlantic City Hotel': { maxDate: '2026-04-21', count: 43 },
            'BATIQA Hotel Jababeka Cikarang': { maxDate: '2026-02-02', count: 39 },
            'D Anaya Hotel Bogor': { maxDate: '2026-03-30', count: 150 },
            'favehotel Cimanuk Garut': { maxDate: '2025-12-14', count: 36 },
            'favehotel Margonda': { maxDate: '2026-05-01', count: 50 },
            'favehotel Pamanukan': { maxDate: '2025-12-17', count: 42 },
            'favehotel Premier Cihampelas': { maxDate: '2026-03-27', count: 80 },
            'Fresh Hotel Sukabumi': { maxDate: '2026-03-29', count: 54 },
            'Hay Bandung': { maxDate: '2025-09-26', count: 36 },
            'Hotel Neo Cirebon by ASTON': { maxDate: '2026-05-04', count: 61 },
            'Hotel Santika Bogor': { maxDate: '2026-04-26', count: 80 },
            'Hotel Santika Depok': { maxDate: '2026-04-17', count: 61 },
            'Hotel Santika Mega City Bekasi': { maxDate: '2026-04-08', count: 55 },
            'Hotel Tirta Kencana Cipanas Garut': { maxDate: '2026-04-27', count: 206 },
            'ibis Bandung Trans Studio': { maxDate: '2026-02-22', count: 151 },
            'Laut Biru Resort Hotel': { maxDate: '2026-03-29', count: 141 },
            'Meize City Center Bandung': { maxDate: '2026-05-04', count: 59 },
            'Savero Hotel Depok': { maxDate: '2026-04-20', count: 100 },
            'Sparks Odeon Sukabumi': { maxDate: '2025-12-31', count: 23 },
            'Sun In Pangandaran Hotel': { maxDate: '2026-01-13', count: 50 },
            'Surya Kencana Seaside Hotel': { maxDate: '2025-10-05', count: 43 },
            'Verse Hotel Cirebon': { maxDate: '2026-04-23', count: 54 },
            'Whiz Prime Hotel Pajajaran Bogor': { maxDate: '2026-03-25', count: 247 },
            'YELLO Hotel Paskal Bandung': { maxDate: '2026-04-07', count: 173 },
            'Yusra Inn Hotel Bekasi': { maxDate: '2026-04-06', count: 35 },
            'Zuri Express Lippo Cikarang': { maxDate: '2025-10-29', count: 44 },
        },
    };

    const allReviews = [];
    let currentPage = 1;
    let activeLabeledScope = null;

    // ====== UTILITY FUNCTIONS ======

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function log(msg) {
        console.log(`%c[Tiket Scraper] ${msg}`, 'color: #0064D2; font-weight: bold;');
    }

    function warn(msg) {
        console.warn(`[Tiket Scraper] ${msg}`);
    }

    function normalizeKey(value) {
        return String(value || '')
            .toLowerCase()
            .normalize('NFKD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function parseISODate(value) {
        const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (!match) return null;
        return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
    }

    function parseReviewDate(value) {
        const text = String(value || '').trim();
        const slashDate = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (slashDate) {
            return new Date(Date.UTC(Number(slashDate[3]), Number(slashDate[1]) - 1, Number(slashDate[2])));
        }

        const monthMap = {
            jan: 0, januari: 0, january: 0,
            feb: 1, februari: 1, february: 1,
            mar: 2, maret: 2, march: 2,
            apr: 3, april: 3,
            mei: 4, may: 4,
            jun: 5, juni: 5, june: 5,
            jul: 6, juli: 6, july: 6,
            agu: 7, ags: 7, agustus: 7, aug: 7, august: 7,
            sep: 8, sept: 8, september: 8,
            okt: 9, oktober: 9, oct: 9, october: 9,
            nov: 10, november: 10,
            des: 11, desember: 11, dec: 11, december: 11,
        };
        const longDate = text.match(/^(\d{1,2})\s+([A-Za-zÀ-ÿ.]+)\s+(\d{4})$/);
        if (longDate) {
            const monthKey = normalizeKey(longDate[2].replace('.', ''));
            if (monthKey in monthMap) {
                return new Date(Date.UTC(Number(longDate[3]), monthMap[monthKey], Number(longDate[1])));
            }
        }

        return null;
    }

    function formatISODate(date) {
        return date.toISOString().slice(0, 10);
    }

    function getPageTextForHotelDetection() {
        const candidates = [
            CONFIG.CURRENT_HOTEL_NAME,
            document.title,
            qs('meta[property="og:title"]')?.getAttribute('content'),
            qs('h1')?.textContent,
            qs('[data-testid*="hotel"]')?.textContent,
            document.body?.innerText?.slice(0, 20000),
        ];
        return normalizeKey(candidates.filter(Boolean).join(' '));
    }

    function getActiveLabeledScope() {
        if (!CONFIG.ONLY_LABELED_REVIEW_WINDOW) return null;

        const pageText = getPageTextForHotelDetection();
        const entries = Object.entries(CONFIG.LABELED_TIKET_SCOPE_BY_HOTEL);
        let matched = null;

        if (CONFIG.CURRENT_HOTEL_NAME) {
            const manualKey = normalizeKey(CONFIG.CURRENT_HOTEL_NAME);
            matched = entries.find(([hotel]) => normalizeKey(hotel) === manualKey);
        }

        if (!matched) {
            matched = entries.find(([hotel]) => pageText.includes(normalizeKey(hotel)));
        }

        if (!matched) {
            warn('Hotel tidak cocok dengan scope dataset labelling. Batas tanggal/jumlah review tidak diterapkan.');
            return null;
        }

        const [hotelName, scope] = matched;
        const maxDate = parseISODate(scope.maxDate);
        if (!maxDate) {
            warn(`Tanggal cutoff tidak valid untuk ${hotelName}: ${scope.maxDate}`);
            return null;
        }

        return { hotelName, maxDate, maxDateText: scope.maxDate, targetCount: scope.count };
    }

    function isNewerThanLabeledScope(reviewData) {
        if (!activeLabeledScope) return false;

        const reviewDate = parseReviewDate(reviewData.tanggal);
        if (!reviewDate) {
            warn(`Tanggal review tidak bisa diparse: "${reviewData.tanggal}". Review tetap diambil.`);
            return false;
        }

        return reviewDate > activeLabeledScope.maxDate;
    }

    function reachedTargetReviewCount() {
        return Boolean(
            activeLabeledScope
            && activeLabeledScope.targetCount
            && allReviews.length >= activeLabeledScope.targetCount
        );
    }

    // ====== SELECTOR HELPERS ======
    // Tiket.com uses CSS Modules with hashed class names.
    // We use partial class matching to be resilient to hash changes.

    function qsa(selector, parent = document) {
        return Array.from(parent.querySelectorAll(selector));
    }

    function qs(selector, parent = document) {
        return parent.querySelector(selector);
    }

    // Match elements by partial class name
    function byClass(partial, parent = document) {
        return qsa(`[class*="${partial}"]`, parent);
    }

    function byClassOne(partial, parent = document) {
        return qs(`[class*="${partial}"]`, parent);
    }

    function isVisible(el) {
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        return rect.width > 0
            && rect.height > 0
            && style.visibility !== 'hidden'
            && style.display !== 'none'
            && style.pointerEvents !== 'none';
    }

    function getReviewCommentElement(reviewCard) {
        return byClassOne('ReadMoreComments_review_card_comment__', reviewCard)
            || byClassOne('ReviewCard_review_card_comment__', reviewCard)
            || qs('[data-testid*="review-comment"]', reviewCard)
            || qs('[data-testid*="comment"]', reviewCard);
    }

    function cleanReviewText(text) {
        return String(text || '')
            .replace(/\s*(?:Baca\s+)?Selengkapnya\.{0,2}\s*$/i, '')
            .replace(/\s*(?:Read\s+more)\.{0,2}\s*$/i, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function findReadMoreButtons(reviewCard) {
        const candidates = [
            ...byClass('ReadMoreComments_read_more__', reviewCard),
            ...qsa('button, a, span, div', reviewCard).filter(el => {
                const text = String(el.textContent || '').replace(/\s+/g, ' ').trim();
                return /^(?:Baca\s+)?Selengkapnya\.{0,2}$/i.test(text)
                    || /^Read\s+more\.{0,2}$/i.test(text);
            }),
        ];

        return candidates.filter((el, index) => {
            return candidates.indexOf(el) === index && isVisible(el);
        });
    }

    async function waitForExpandedText(reviewCard, oldText) {
        const start = Date.now();
        while (Date.now() - start < CONFIG.READ_MORE_TIMEOUT) {
            await sleep(CONFIG.READ_MORE_POLL);
            const commentEl = getReviewCommentElement(reviewCard);
            const newText = cleanReviewText(commentEl?.textContent || '');
            const stillHasReadMore = findReadMoreButtons(reviewCard).length > 0
                || /Selengkapnya/i.test(commentEl?.textContent || '');

            if (newText && newText !== oldText && !stillHasReadMore) {
                return true;
            }
            if (newText && newText.length > oldText.length + 20 && !stillHasReadMore) {
                return true;
            }
        }
        return false;
    }

    async function expandReviewText(reviewCard) {
        if (!CONFIG.EXPAND_READ_MORE) return false;

        const commentEl = getReviewCommentElement(reviewCard);
        const oldText = cleanReviewText(commentEl?.textContent || '');
        let buttons = findReadMoreButtons(reviewCard);
        if (buttons.length === 0) return false;

        for (const btn of buttons) {
            try {
                btn.scrollIntoView({ block: 'center', inline: 'nearest' });
                await sleep(150);
                btn.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, cancelable: true, view: window }));
                btn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
                btn.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window }));
                btn.click();
                const expanded = await waitForExpandedText(reviewCard, oldText);
                if (expanded) return true;
            } catch (e) {
                warn(`Gagal klik Selengkapnya: ${e.message}`);
            }

            buttons = findReadMoreButtons(reviewCard);
            if (buttons.length === 0) break;
        }

        return false;
    }

    // ====== PHOTO EXTRACTION ======

    function getPhotoUrlFromImg(img) {
        // On tiket.com, the real photo URL is in the `alt` attribute
        // The `src` contains a base64 placeholder
        const alt = img.getAttribute('alt') || '';
        if (alt.startsWith('https://') && alt.includes('tiket.photos')) {
            return alt;
        }
        // Fallback: check src
        const src = img.getAttribute('src') || '';
        if (src.startsWith('https://') && src.includes('tiket.photos')) {
            return src;
        }
        return null;
    }

    function getVisiblePhotos(reviewCard) {
        // Photos are in UserSubmittedImages section within the review card
        const photoImgs = qsa('img[data-testid="user-submitted-image"]', reviewCard);
        const urls = [];
        for (const img of photoImgs) {
            const url = getPhotoUrlFromImg(img);
            if (url && !urls.includes(url)) {
                urls.push(url);
            }
        }
        return urls;
    }

    // ====== LIGHTBOX / MODAL PHOTO EXTRACTION ======

    async function getPhotosFromLightbox(reviewCard) {
        // Click the first photo to open the lightbox/modal
        const firstPhoto = qs('img[data-testid="user-submitted-image"]', reviewCard);
        if (!firstPhoto) return [];

        firstPhoto.scrollIntoView({ block: 'center' });
        await sleep(300);
        firstPhoto.click();
        await sleep(CONFIG.CLICK_DELAY);

        // Find the modal
        const modal = byClassOne('BaseModal_modal__') || qs('[class*="ImagePreview_image_preview"]');
        if (!modal) {
            warn('Modal tidak ditemukan setelah klik foto');
            return [];
        }

        const urls = [];

        // Strategy 1: Get all thumbnail images in the modal thumbnail strip
        const thumbnailImgs = qsa('[class*="ImageThumbnailDesktop_image_thumbnail__"] img', modal);
        for (const img of thumbnailImgs) {
            const url = getPhotoUrlFromImg(img);
            if (url && !urls.includes(url)) {
                urls.push(url);
            }
        }

        // Strategy 2: If no thumbnails found, try the main preview image
        if (urls.length === 0) {
            const previewImgs = qsa('img', modal);
            for (const img of previewImgs) {
                const url = getPhotoUrlFromImg(img);
                if (url && !urls.includes(url)) {
                    urls.push(url);
                }
            }
        }

        // Strategy 3: Navigate carousel if thumbnails are fewer than expected
        const counterEl = byClassOne('ImageDescription_counter__', modal);
        if (counterEl) {
            const counterText = counterEl.textContent.trim(); // e.g., "1/10"
            const match = counterText.match(/(\d+)\s*\/\s*(\d+)/);
            if (match) {
                const total = parseInt(match[2]);
                if (urls.length < total) {
                    // Navigate through carousel to find all photos
                    let noNewCount = 0;
                    for (let i = 0; i < total + 5 && noNewCount < 3; i++) {
                        const nextBtn = byClassOne('ImageNavigation_right__', modal)
                            || qs('button[aria-label="next"]', modal);
                        if (!nextBtn) break;
                        nextBtn.click();
                        await sleep(500);

                        // Check for new images
                        let foundNew = false;
                        const allImgs = qsa('img', modal);
                        for (const img of allImgs) {
                            const url = getPhotoUrlFromImg(img);
                            if (url && !urls.includes(url)) {
                                urls.push(url);
                                foundNew = true;
                            }
                        }
                        noNewCount = foundNew ? 0 : noNewCount + 1;
                    }
                }
            }
        }

        // Close the modal
        await closeModal();

        return urls;
    }

    async function closeModal() {
        // Try close button first
        const closeBtn = byClassOne('ImagePreview_floating_close__')
            || qs('button[aria-label="close"]')
            || qs('button[aria-label="Close"]');
        if (closeBtn) {
            closeBtn.click();
            await sleep(500);
            // Verify closed
            const modal = byClassOne('BaseModal_modal__');
            if (!modal || modal.offsetParent === null) return true;
        }

        // Try clicking overlay
        const overlay = byClassOne('BaseModal_modal_overlay__');
        if (overlay) {
            overlay.click();
            await sleep(500);
            const modal = byClassOne('BaseModal_modal__');
            if (!modal || modal.offsetParent === null) return true;
        }

        // Try Escape key
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27 }));
        await sleep(500);

        return true;
    }

    // ====== REVIEW DATA EXTRACTION ======

    async function extractReviewData(reviewCard, index) {
        const data = {
            review_index: index + 1,
            nama: '',
            tanggal: '',
            tipe_traveler: '',
            rating: '',
            teks_ulasan: '',
            sumber: '',
            foto_urls: [],
        };

        // Customer name
        const nameEl = byClassOne('ReviewCard_customer_name__', reviewCard);
        if (nameEl) data.nama = nameEl.textContent.trim();

        // Date
        const dateEl = byClassOne('ReviewCard_date__', reviewCard);
        if (dateEl) data.tanggal = dateEl.textContent.trim();

        // Traveler type
        const travelerEl = byClassOne('ReviewCard_traveler_type__', reviewCard);
        if (travelerEl) data.tipe_traveler = travelerEl.textContent.trim();

        // Rating
        const ratingEl = byClassOne('ReviewCard_user_review__', reviewCard);
        if (ratingEl) data.rating = ratingEl.textContent.trim();

        // Review text
        await expandReviewText(reviewCard);

        const commentEl = getReviewCommentElement(reviewCard);
        if (commentEl) {
            data.teks_ulasan = cleanReviewText(commentEl.textContent);
            if (/Selengkapnya/i.test(commentEl.textContent)) {
                warn(`  Review ${index + 1}: teks masih memuat "Selengkapnya", kemungkinan belum berhasil expand.`);
            }
        }

        // Source label
        const sourceEl = byClassOne('ReviewCard_review_card_source_label__', reviewCard);
        if (sourceEl) data.sumber = sourceEl.textContent.trim();

        // Photos - get from visible UserSubmittedImages
        data.foto_urls = getVisiblePhotos(reviewCard);

        return data;
    }

    // ====== PAGINATION ======

    function getActivePageNumber() {
        const activeEl = byClassOne('ReviewPagination_active__');
        if (activeEl) {
            const num = parseInt(activeEl.textContent.trim());
            if (!isNaN(num)) return num;
        }
        return currentPage;
    }

    function getNextPageButton() {
        // Use data-testid for reliable selection
        return qs('[data-testid="chevron-right-pagination"]');
    }

    function getLastPageNumber() {
        const lastPageEl = qs('[data-testid="last-page-pagination"]');
        if (lastPageEl) {
            const num = parseInt(lastPageEl.textContent.trim());
            if (!isNaN(num)) return num;
        }
        // Fallback: find highest page number
        const pageEls = qsa('[data-testid="page-number-pagination"]');
        let max = 1;
        for (const el of pageEls) {
            const num = parseInt(el.textContent.trim());
            if (!isNaN(num) && num > max) max = num;
        }
        return max;
    }

    async function goToNextPage() {
        const nextBtn = getNextPageButton();
        if (!nextBtn) return false;

        // Check if disabled (no more pages)
        if (nextBtn.getAttribute('aria-disabled') === 'true') return false;
        // Check opacity/pointer-events as disabled indicator
        const style = window.getComputedStyle(nextBtn);
        if (style.pointerEvents === 'none' || style.opacity === '0.5') return false;

        const oldPage = getActivePageNumber();

        nextBtn.scrollIntoView({ block: 'center' });
        await sleep(300);
        nextBtn.click();
        await sleep(CONFIG.PAGE_LOAD_DELAY);

        // Wait for page content to change
        const startTime = Date.now();
        while (Date.now() - startTime < CONFIG.PAGE_LOAD_DELAY * 2) {
            const newPage = getActivePageNumber();
            if (newPage > oldPage) {
                currentPage = newPage;
                return true;
            }
            await sleep(500);
        }

        // Check if page actually changed by looking at review cards
        const newCards = qsa('[data-testid="review-card"]');
        if (newCards.length > 0) {
            currentPage++;
            return true;
        }

        return false;
    }

    // ====== SCROLL TO LOAD ALL CONTENT ======

    async function scrollToLoadContent() {
        const scrollHeight = document.body.scrollHeight;
        for (let y = 0; y < scrollHeight; y += 400) {
            window.scrollTo(0, y);
            await sleep(100);
        }
        window.scrollTo(0, 0);
        await sleep(500);
    }

    // ====== MAIN SCRAPING LOOP ======

    async function scrapePage() {
        await scrollToLoadContent();

        const reviewCards = qsa('[data-testid="review-card"]');
        if (reviewCards.length === 0) {
            // Fallback selector
            const fallbackCards = byClass('ReviewCard_review_card__');
            if (fallbackCards.length === 0) {
                warn('Tidak ada review card ditemukan di halaman ini.');
                return 0;
            }
            return await scrapeCards(fallbackCards);
        }
        return await scrapeCards(reviewCards);
    }

    async function scrapeCards(cards) {
        log(`Ditemukan ${cards.length} review di halaman ${currentPage}`);
        let count = 0;

        for (let i = 0; i < cards.length; i++) {
            const card = cards[i];
            try {
                card.scrollIntoView({ block: 'center' });
                await sleep(CONFIG.SCROLL_DELAY);

                const reviewData = await extractReviewData(card, i);
                reviewData.page = currentPage;

                if (isNewerThanLabeledScope(reviewData)) {
                    log(`  [${i+1}/${cards.length}] Lewati review baru (${reviewData.tanggal}) > cutoff ${activeLabeledScope.maxDateText}`);
                    continue;
                }

                // If review has photos, try to get more from lightbox
                if (reviewData.foto_urls.length > 0) {
                    try {
                        const lightboxPhotos = await getPhotosFromLightbox(card);
                        if (lightboxPhotos.length > reviewData.foto_urls.length) {
                            log(`  Review ${i+1}: Lightbox ditemukan ${lightboxPhotos.length} foto (sebelumnya ${reviewData.foto_urls.length})`);
                            reviewData.foto_urls = lightboxPhotos;
                        }
                    } catch (e) {
                        warn(`  Error saat buka lightbox review ${i+1}: ${e.message}`);
                        // Keep the visible photos
                    }
                }

                allReviews.push(reviewData);
                count++;

                const textPreview = reviewData.teks_ulasan.substring(0, 50);
                const ellipsis = reviewData.teks_ulasan.length > 50 ? '...' : '';
                log(`  [${i+1}/${cards.length}] "${textPreview}${ellipsis}" - ${reviewData.foto_urls.length} foto`);

                if (reachedTargetReviewCount()) {
                    log(`Target dataset labelling tercapai (${activeLabeledScope.targetCount} review).`);
                    break;
                }

            } catch (e) {
                warn(`  Error review ${i+1}: ${e.message}`);
            }
        }

        return count;
    }

    // ====== CSV GENERATION ======

    function escapeCSV(value) {
        if (value === null || value === undefined) return '';
        const str = String(value);
        if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
            return '"' + str.replace(/"/g, '""') + '"';
        }
        return str;
    }

    function generateCSV() {
        const headers = [
            'page',
            'review_index',
            'nama',
            'tanggal',
            'tipe_traveler',
            'rating',
            'teks_ulasan',
            'sumber',
        ];

        for (let i = 1; i <= CONFIG.MAX_PHOTOS_PER_REVIEW; i++) {
            headers.push(`gambar-${i}`);
        }

        const rows = [headers.join(',')];

        for (const review of allReviews) {
            const row = [
                escapeCSV(review.page),
                escapeCSV(review.review_index),
                escapeCSV(review.nama),
                escapeCSV(review.tanggal),
                escapeCSV(review.tipe_traveler),
                escapeCSV(review.rating),
                escapeCSV(review.teks_ulasan),
                escapeCSV(review.sumber),
            ];

            for (let i = 0; i < CONFIG.MAX_PHOTOS_PER_REVIEW; i++) {
                row.push(escapeCSV(review.foto_urls[i] || ''));
            }

            rows.push(row.join(','));
        }

        return rows.join('\n');
    }

    function downloadCSV(csvContent) {
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        const now = new Date();
        const timestamp = now.toISOString().replace(/[:.]/g, '-').substring(0, 19);
        const hotelName = document.title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);

        link.href = url;
        link.download = `tiket_reviews_${hotelName}_${timestamp}.csv`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    // ====== MAIN ======

    log('========================================');
    log('Tiket.com Hotel Review Scraper');
    log('========================================');

    activeLabeledScope = getActiveLabeledScope();
    if (activeLabeledScope) {
        log(`Scope dataset labelling: ${activeLabeledScope.hotelName}`);
        log(`Cutoff tanggal terbaru: ${activeLabeledScope.maxDateText}`);
        log(`Target jumlah review: ${activeLabeledScope.targetCount}`);
        log('Review lebih baru dari cutoff akan dilewati agar tidak bercampur data baru.');
        log('');
    }

    const totalPages = getLastPageNumber();
    const maxPages = Math.min(CONFIG.MAX_PAGES, totalPages);
    log(`Total halaman: ${totalPages} | Akan scrape: ${maxPages} halaman`);
    log('');

    let totalScraped = 0;

    for (let page = 1; page <= maxPages; page++) {
        log(`--- Halaman ${currentPage} / ${totalPages} ---`);

        const count = await scrapePage();
        totalScraped += count;

        log(`Halaman ${currentPage} selesai: ${count} review`);

        if (reachedTargetReviewCount()) {
            log('Jumlah review sudah sama dengan dataset labelling. Scraping dihentikan.');
            break;
        }

        if (page < maxPages) {
            log(`Navigasi ke halaman berikutnya...`);
            const success = await goToNextPage();
            if (!success) {
                log('Tidak ada halaman berikutnya. Scraping selesai.');
                break;
            }
            await sleep(1000);
        }
    }

    // Generate and download CSV
    log('');
    log('========================================');
    log('SELESAI!');
    log(`Total review: ${allReviews.length}`);
    log(`Total halaman: ${currentPage}`);
    const totalPhotos = allReviews.reduce((sum, r) => sum + r.foto_urls.length, 0);
    const reviewsWithPhotos = allReviews.filter(r => r.foto_urls.length > 0).length;
    log(`Total foto: ${totalPhotos}`);
    log(`Review dengan foto: ${reviewsWithPhotos}`);
    log('========================================');
    log('');

    if (allReviews.length > 0) {
        const csv = generateCSV();
        downloadCSV(csv);
        log('CSV berhasil didownload!');
    } else {
        warn('Tidak ada review yang berhasil di-scrape.');
    }

    // Return data for console access
    window.__tiketReviews = allReviews;
    log('Data juga tersedia di: window.__tiketReviews');

})();
