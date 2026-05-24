// Phonetics page: IPA chart with click-to-play audio.
//
// Audio files are cached locally under web/phonetics-audio/ (Ogg/Vorbis from
// Wikimedia Commons). A handful of English-cluster "phonemes" taught in
// Chinese curricula (tr, dr, ts, dz) don't have isolated phoneme recordings
// in IPA — for those we fall back to a short English example word.

const AUDIO_BASE = 'phonetics-audio/';

// Each item: { ipa: glyph, file: Wikimedia Commons filename for canonical audio }.
const PHONETICS = {
    vowels: {
        monophthongs: [
            {
                label: '前元音 Front',
                items: [
                    { ipa: 'iː', file: 'Close_front_unrounded_vowel.ogg' },
                    { ipa: 'ɪ',  file: 'Near-close_near-front_unrounded_vowel.ogg' },
                    { ipa: 'e',  file: 'Open-mid_front_unrounded_vowel.ogg' },
                    { ipa: 'æ',  file: 'Near-open_front_unrounded_vowel.ogg' },
                ],
            },
            {
                label: '中元音 Central',
                items: [
                    { ipa: 'ɜː', file: 'Open-mid_central_unrounded_vowel.ogg' },
                    { ipa: 'ə',  file: 'Mid-central_vowel.ogg' },
                    { ipa: 'ʌ',  file: 'Open-mid_back_unrounded_vowel.ogg' },
                ],
            },
            {
                label: '后元音 Back',
                items: [
                    { ipa: 'uː', file: 'Close_back_rounded_vowel.ogg' },
                    { ipa: 'ʊ',  file: 'Near-close_near-back_rounded_vowel.ogg' },
                    { ipa: 'ɔː', file: 'Open-mid_back_rounded_vowel.ogg' },
                    { ipa: 'ɒ',  file: 'Open_back_rounded_vowel.ogg' },
                    { ipa: 'ɑː', file: 'Open_back_unrounded_vowel.ogg' },
                ],
            },
        ],
        diphthongs: [
            {
                label: '开合双元音 Closing',
                items: [
                    { ipa: 'eɪ', file: 'En-us-day.ogg' },
                    { ipa: 'aɪ', file: 'En-us-eye.ogg' },
                    { ipa: 'ɔɪ', file: 'En-us-boy.ogg' },
                    { ipa: 'aʊ', file: 'En-uk-now.ogg' },
                    { ipa: 'əʊ', file: 'En-us-go.ogg' },
                ],
            },
            {
                label: '集中双元音 Centering',
                items: [
                    { ipa: 'ɪə', file: 'En-uk-ear.ogg' },
                    { ipa: 'eə', file: 'En-uk-air.ogg' },
                    { ipa: 'ʊə', file: 'En-uk-poor.ogg' },
                ],
            },
        ],
    },
    consonants: {
        voiceless: [
            {
                label: '爆破音 Plosives',
                items: [
                    { ipa: 'p', file: 'Voiceless_bilabial_plosive.ogg' },
                    { ipa: 't', file: 'Voiceless_alveolar_plosive.ogg' },
                    { ipa: 'k', file: 'Voiceless_velar_plosive.ogg' },
                ],
            },
            {
                label: '摩擦音 Fricatives',
                items: [
                    { ipa: 'f', file: 'Voiceless_labio-dental_fricative.ogg' },
                    { ipa: 's', file: 'Voiceless_alveolar_sibilant.ogg' },
                    { ipa: 'ʃ', file: 'Voiceless_palato-alveolar_sibilant.ogg' },
                    { ipa: 'θ', file: 'Voiceless_dental_fricative.ogg' },
                    { ipa: 'h', file: 'Voiceless_glottal_fricative.ogg' },
                ],
            },
            {
                label: '破擦音 Affricates',
                items: [
                    { ipa: 'tʃ', file: 'Voiceless_palato-alveolar_affricate.ogg' },
                    { ipa: 'tr', file: 'En-us-tree.ogg' },
                    { ipa: 'ts', file: 'En-us-its.ogg' },
                ],
            },
        ],
        voiced: [
            {
                label: '爆破音 Plosives',
                items: [
                    { ipa: 'b', file: 'Voiced_bilabial_plosive.ogg' },
                    { ipa: 'd', file: 'Voiced_alveolar_plosive.ogg' },
                    { ipa: 'g', file: 'Voiced_velar_plosive.ogg' },
                ],
            },
            {
                label: '摩擦音 Fricatives',
                items: [
                    { ipa: 'v', file: 'Voiced_labio-dental_fricative.ogg' },
                    { ipa: 'z', file: 'Voiced_alveolar_sibilant.ogg' },
                    { ipa: 'ʒ', file: 'Voiced_palato-alveolar_sibilant.ogg' },
                    { ipa: 'ð', file: 'Voiced_dental_fricative.ogg' },
                    { ipa: 'r', file: 'Alveolar_approximant.ogg' },
                ],
            },
            {
                label: '破擦音 Affricates',
                items: [
                    { ipa: 'dʒ', file: 'Voiced_palato-alveolar_affricate.ogg' },
                    { ipa: 'dr', file: 'En-us-dream.ogg' },
                    { ipa: 'dz', file: 'En-us-beds.ogg' },
                ],
            },
            {
                label: '鼻音 Nasals',
                items: [
                    { ipa: 'm', file: 'Bilabial_nasal.ogg' },
                    { ipa: 'n', file: 'Alveolar_nasal.ogg' },
                    { ipa: 'ŋ', file: 'Velar_nasal.ogg' },
                ],
            },
            {
                label: '舌侧音 Lateral',
                items: [
                    { ipa: 'l', file: 'Alveolar_lateral_approximant.ogg' },
                ],
            },
            {
                label: '半元音 Semivowels',
                items: [
                    { ipa: 'j', file: 'Palatal_approximant.ogg' },
                    { ipa: 'w', file: 'Voiced_labio-velar_approximant.ogg' },
                ],
            },
        ],
    },
};

let currentAudio = null;

function fileUrl(filename) {
    return AUDIO_BASE + encodeURIComponent(filename);
}

function renderSubpanel(panelEl, groups) {
    panelEl.innerHTML = groups.map((group) => `
        <h3 class="phon-group-label">${group.label}</h3>
        <div class="phon-grid">
            ${group.items.map((item) => `
                <button class="phon-card" type="button"
                        data-file="${item.file}"
                        data-ipa="${item.ipa}"
                        aria-label="Play phoneme ${item.ipa}">
                    <span class="phon-glyph">[${item.ipa}]</span>
                    <span class="phon-speaker" aria-hidden="true">🔊</span>
                </button>
            `).join('')}
        </div>
    `).join('');
}

function renderAll() {
    renderSubpanel(
        document.querySelector('[data-subpanel="monophthongs"]'),
        PHONETICS.vowels.monophthongs,
    );
    renderSubpanel(
        document.querySelector('[data-subpanel="diphthongs"]'),
        PHONETICS.vowels.diphthongs,
    );
    renderSubpanel(
        document.querySelector('[data-subpanel="voiceless"]'),
        PHONETICS.consonants.voiceless,
    );
    renderSubpanel(
        document.querySelector('[data-subpanel="voiced"]'),
        PHONETICS.consonants.voiced,
    );
}

function setupTabs() {
    document.querySelectorAll('.tab').forEach((btn) => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.tab;
            document.querySelectorAll('.tab').forEach((b) => {
                const active = b.dataset.tab === target;
                b.classList.toggle('is-active', active);
                b.setAttribute('aria-selected', active ? 'true' : 'false');
            });
            document.querySelectorAll('.tab-panel').forEach((panel) => {
                panel.classList.toggle('is-hidden', panel.dataset.panel !== target);
            });
        });
    });

    document.querySelector('.tab[data-tab="vowels"]').classList.add('is-active');

    document.querySelectorAll('.subtab').forEach((btn) => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.subtab;
            const parent = btn.closest('.tab-panel');
            parent.querySelectorAll('.subtab').forEach((b) => {
                b.classList.toggle('is-active', b.dataset.subtab === target);
            });
            parent.querySelectorAll('.subtab-panel').forEach((panel) => {
                panel.classList.toggle('is-hidden', panel.dataset.subpanel !== target);
            });
        });
    });
}

function showStatus(text, kind) {
    const el = document.getElementById('phoneticsStatus');
    if (!text) {
        el.className = 'status-message';
        el.textContent = '';
        return;
    }
    el.className = `status-message ${kind || 'info'}`;
    el.textContent = text;
}

function playPhoneme(file, ipa, cardEl) {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }

    cardEl.classList.add('is-loading');
    const audio = new Audio(fileUrl(file));
    audio.preload = 'auto';
    currentAudio = audio;

    const cleanup = () => cardEl.classList.remove('is-loading');
    audio.addEventListener('playing', cleanup, { once: true });
    audio.addEventListener('ended', () => {
        if (currentAudio === audio) currentAudio = null;
    });
    audio.addEventListener('error', () => {
        cleanup();
        showStatus(`Failed to play [${ipa}] — audio file may be unsupported in this browser`, 'error');
    });

    audio.play()
        .then(() => showStatus(`▶ [${ipa}]`, 'info'))
        .catch((err) => {
            cleanup();
            console.error(err);
            showStatus(err.message || 'Playback failed', 'error');
        });
}

function setupCardClicks() {
    document.querySelector('main').addEventListener('click', (e) => {
        const card = e.target.closest('.phon-card');
        if (!card) return;
        playPhoneme(card.dataset.file, card.dataset.ipa, card);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    renderAll();
    setupTabs();
    setupCardClicks();

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(() => {});
    }
});
