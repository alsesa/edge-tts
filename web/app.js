// Configuration
const API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:8000/api'
    : '/api';

// Sample sentences for different languages
const SAMPLE_SENTENCES = {
    'ar': ['مرحبا، كيف حالك اليوم؟', 'الطقس جميل اليوم.', 'أتمنى لك يوما سعيدا.'],
    'bg': ['Здравейте, как сте днес?', 'Времето е хубаво днес.', 'Желая ви приятен ден.'],
    'ca': ['Hola, com estàs avui?', 'El temps és agradable avui.', 'Que tinguis un bon dia.'],
    'cs': ['Ahoj, jak se máš dnes?', 'Počasí je dnes pěkné.', 'Přeji ti hezký den.'],
    'da': ['Hej, hvordan har du det i dag?', 'Vejret er dejligt i dag.', 'Hav en god dag.'],
    'de': ['Hallo, wie geht es dir heute?', 'Das Wetter ist heute schön.', 'Ich wünsche dir einen schönen Tag.'],
    'el': ['Γεια σου, πώς είσαι σήμερα;', 'Ο καιρός είναι ωραίος σήμερα.', 'Σου εύχομαι μια όμορφη μέρα.'],
    'en': ['Hello, how are you today?', 'The weather is nice today.', 'Have a wonderful day!'],
    'es': ['Hola, ¿cómo estás hoy?', 'El clima está agradable hoy.', '¡Que tengas un buen día!'],
    'fi': ['Hei, mitä kuuluu tänään?', 'Sää on kaunis tänään.', 'Mukavaa päivää!'],
    'fr': ['Bonjour, comment allez-vous aujourd\'hui?', 'Le temps est agréable aujourd\'hui.', 'Passez une bonne journée!'],
    'hi': ['नमस्ते, आज आप कैसे हैं?', 'आज मौसम अच्छा है।', 'आपका दिन शुभ हो।'],
    'hr': ['Bok, kako si danas?', 'Vrijeme je lijepo danas.', 'Želim ti lijep dan.'],
    'hu': ['Szia, hogy vagy ma?', 'Az idő szép ma.', 'Szép napot kívánok!'],
    'id': ['Halo, apa kabar hari ini?', 'Cuacanya bagus hari ini.', 'Semoga harimu menyenangkan!'],
    'it': ['Ciao, come stai oggi?', 'Il tempo è bello oggi.', 'Ti auguro una buona giornata!'],
    'ja': ['こんにちは、今日はお元気ですか？', '今日は天気がいいですね。', '良い一日をお過ごしください。'],
    'ko': ['안녕하세요, 오늘은 어떠세요?', '오늘 날씨가 좋네요.', '좋은 하루 보내세요!'],
    'nl': ['Hallo, hoe gaat het vandaag?', 'Het weer is mooi vandaag.', 'Fijne dag gewenst!'],
    'no': ['Hei, hvordan har du det i dag?', 'Været er fint i dag.', 'Ha en fin dag!'],
    'pl': ['Cześć, jak się masz dzisiaj?', 'Pogoda jest ładna dzisiaj.', 'Miłego dnia!'],
    'pt': ['Olá, como você está hoje?', 'O tempo está agradável hoje.', 'Tenha um ótimo dia!'],
    'ro': ['Bună, ce mai faci astăzi?', 'Vremea este frumoasă astăzi.', 'O zi bună!'],
    'ru': ['Привет, как дела сегодня?', 'Погода сегодня хорошая.', 'Хорошего дня!'],
    'sk': ['Ahoj, ako sa máš dnes?', 'Počasie je dnes pekné.', 'Prajem ti pekný deň.'],
    'sv': ['Hej, hur mår du idag?', 'Vädret är fint idag.', 'Ha en trevlig dag!'],
    'th': ['สวัสดี วันนี้เป็นอย่างไรบ้าง?', 'อากาศดีวันนี้.', 'ขอให้มีความสุขตลอดวัน!'],
    'tr': ['Merhaba, bugün nasılsın?', 'Hava bugün güzel.', 'İyi günler dilerim!'],
    'uk': ['Привіт, як справи сьогодні?', 'Погода сьогодні гарна.', 'Гарного дня!'],
    'vi': ['Xin chào, hôm nay bạn thế nào?', 'Thời tiết hôm nay đẹp.', 'Chúc bạn một ngày tốt lành!'],
    'zh': ['你好，今天过得怎么样？', '今天天气真好。', '祝你有美好的一天！'],
    // Cantonese (yue-CN)
    'yue': ['你好，今日點呀？', '今日天氣好好。', '祝你有美好嘅一天！'],
    // Wu Chinese (wuu-CN) - uses Simplified Chinese
    'wuu': ['侬好，今朝好伐？', '今朝天气老好额。', '祝侬开心！'],
};

// State
let voices = [];
let filteredVoices = [];
let currentAudioUrl = null;
let currentTestAudioUrl = null;
let history = [];
let deferredPrompt = null;

// DOM Elements
const textInput = document.getElementById('textInput');
const charCount = document.getElementById('charCount');
const voiceSelect = document.getElementById('voiceSelect');
const languageSelect = document.getElementById('languageSelect');
const genderFilter = document.getElementById('genderFilter');
const rateSlider = document.getElementById('rateSlider');
const rateValue = document.getElementById('rateValue');
const volumeSlider = document.getElementById('volumeSlider');
const volumeValue = document.getElementById('volumeValue');
const pitchSlider = document.getElementById('pitchSlider');
const pitchValue = document.getElementById('pitchValue');
const generateBtn = document.getElementById('generateBtn');
const clearBtn = document.getElementById('clearBtn');
const testVoiceBtn = document.getElementById('testVoiceBtn');
const progressBar = document.getElementById('progressBar');
const statusMessage = document.getElementById('statusMessage');
const audioSection = document.getElementById('audioSection');
const audioPlayer = document.getElementById('audioPlayer');
const downloadBtn = document.getElementById('downloadBtn');
const historyList = document.getElementById('historyList');
const onlineStatus = document.getElementById('onlineStatus');
const installPrompt = document.getElementById('installPrompt');
const installBtn = document.getElementById('installBtn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadVoices();
    loadHistory();
    setupEventListeners();
    setupPWA();
    updateOnlineStatus();
});

// Event Listeners
function setupEventListeners() {
    textInput.addEventListener('input', updateCharCount);

    languageSelect.addEventListener('change', () => {
        filterVoices();
        updateTestVoiceButton();
    });
    genderFilter.addEventListener('change', filterVoices);
    voiceSelect.addEventListener('change', updateTestVoiceButton);

    rateSlider.addEventListener('input', (e) => {
        const value = e.target.value;
        rateValue.textContent = `${value >= 0 ? '+' : ''}${value}%`;
    });

    volumeSlider.addEventListener('input', (e) => {
        const value = e.target.value;
        volumeValue.textContent = `${value >= 0 ? '+' : ''}${value}%`;
    });

    pitchSlider.addEventListener('input', (e) => {
        const value = e.target.value;
        pitchValue.textContent = `${value >= 0 ? '+' : ''}${value}Hz`;
    });

    generateBtn.addEventListener('click', generateSpeech);
    clearBtn.addEventListener('click', clearForm);
    testVoiceBtn.addEventListener('click', testVoice);
    downloadBtn.addEventListener('click', downloadAudio);

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
}

// Character count
function updateCharCount() {
    const count = textInput.value.length;
    charCount.textContent = count;

    if (count > 4500) {
        charCount.style.color = 'var(--error-color)';
    } else if (count > 4000) {
        charCount.style.color = 'var(--primary-color)';
    } else {
        charCount.style.color = '';
    }
}

// Load voices from API
async function loadVoices() {
    try {
        // Add cache busting to ensure fresh data
        const response = await fetch(`${API_BASE_URL}/voices?_=${Date.now()}`);
        if (!response.ok) throw new Error('Failed to load voices');

        voices = await response.json();
        populateLanguageSelect();

        showStatus('Voices loaded successfully', 'success');
        console.log(`Loaded ${voices.length} voices from API`);
    } catch (error) {
        console.error('Error loading voices:', error);
        showStatus('Failed to load voices. Please check the server connection.', 'error');
    }
}

// Populate language select
function populateLanguageSelect() {
    const languages = [...new Set(voices.map(v => v.Locale))].sort();

    languageSelect.innerHTML = '<option value="">Select a language</option>';
    languages.forEach(lang => {
        const option = document.createElement('option');
        option.value = lang;
        option.textContent = getLanguageName(lang);
        languageSelect.appendChild(option);
    });
}

// Get language name from locale
function getLanguageName(locale) {
    const names = voices.filter(v => v.Locale === locale);
    return names.length > 0 ? names[0].LocaleName : locale;
}

// Filter voices based on selected language and gender
function filterVoices() {
    const selectedLanguage = languageSelect.value;
    const selectedGender = genderFilter.value;

    // If no language is selected, clear voice dropdown
    if (!selectedLanguage) {
        voiceSelect.innerHTML = '<option value="">Select language first</option>';
        filteredVoices = [];
        return;
    }

    // Filter voices by language and gender
    filteredVoices = voices.filter(voice => {
        const languageMatch = voice.Locale === selectedLanguage;
        const genderMatch = !selectedGender || voice.Gender === selectedGender;
        return languageMatch && genderMatch;
    });

    populateVoiceSelect();
}

// Populate voice select
function populateVoiceSelect() {
    voiceSelect.innerHTML = '';

    if (filteredVoices.length === 0) {
        voiceSelect.innerHTML = '<option value="">No voices available for selected filters</option>';
        return;
    }

    // Sort voices alphabetically by LocalName
    const sortedVoices = [...filteredVoices].sort((a, b) => {
        return a.LocalName.localeCompare(b.LocalName);
    });

    sortedVoices.forEach(voice => {
        const option = document.createElement('option');
        option.value = voice.Name;
        option.textContent = `${voice.LocalName} (${voice.Gender})`;
        voiceSelect.appendChild(option);
    });
}

// Generate speech
async function generateSpeech() {
    const text = textInput.value.trim();

    if (!text) {
        showStatus('Please enter some text', 'error');
        return;
    }

    if (text.length > 5000) {
        showStatus('Text exceeds maximum length of 5000 characters', 'error');
        return;
    }

    const voice = voiceSelect.value;
    if (!voice) {
        showStatus('Please select a voice', 'error');
        return;
    }

    const params = {
        text: text,
        voice: voice,
        rate: `${rateSlider.value >= 0 ? '+' : ''}${rateSlider.value}%`,
        volume: `${volumeSlider.value >= 0 ? '+' : ''}${volumeSlider.value}%`,
        pitch: `${pitchSlider.value >= 0 ? '+' : ''}${pitchSlider.value}Hz`
    };

    try {
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<span class="loading"></span> Generating...';
        progressBar.style.display = 'block';
        hideStatus();

        const response = await fetch(`${API_BASE_URL}/synthesize`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(params)
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Failed to generate speech' }));
            const errorMsg = error.detail || 'Failed to generate speech';

            // Check if it's an invalid voice error
            if (errorMsg.includes('No audio') || errorMsg.includes('voice')) {
                throw new Error(`Voice error: ${errorMsg}. Try selecting a different voice or refresh the page.`);
            }
            throw new Error(errorMsg);
        }

        const blob = await response.blob();

        // Clean up previous audio URL
        if (currentAudioUrl) {
            URL.revokeObjectURL(currentAudioUrl);
        }

        currentAudioUrl = URL.createObjectURL(blob);
        audioPlayer.src = currentAudioUrl;
        audioSection.style.display = 'block';

        // Add to history
        const selectedVoice = voices.find(v => v.Name === voice);
        addToHistory({
            text: text,
            voice: voice,
            voiceName: voiceSelect.options[voiceSelect.selectedIndex].text,
            locale: selectedVoice ? selectedVoice.Locale : '',
            localeName: selectedVoice ? selectedVoice.LocaleName : '',
            params: params,
            timestamp: new Date().toISOString()
        });

        showStatus('Speech generated successfully!', 'success');

    } catch (error) {
        console.error('Error generating speech:', error);
        showStatus(error.message, 'error');
    } finally {
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<span class="btn-icon">🎵</span> Generate Speech';
        progressBar.style.display = 'none';
    }
}

// Download audio
function downloadAudio() {
    if (!currentAudioUrl) return;

    const text = textInput.value.substring(0, 30).replace(/[^a-z0-9]/gi, '_');
    const filename = `edge-tts-${text}-${Date.now()}.mp3`;

    const a = document.createElement('a');
    a.href = currentAudioUrl;
    a.download = filename;
    a.click();
}

// Update test voice button state
function updateTestVoiceButton() {
    const hasVoice = voiceSelect.value && voiceSelect.value !== '';
    testVoiceBtn.disabled = !hasVoice;
}

// Get sample sentence for language
function getSampleSentence(locale) {
    // Extract language code (e.g., 'en' from 'en-US')
    const langCode = locale.split('-')[0];

    // Check for exact locale match first (for special cases like yue-CN, wuu-CN)
    if (SAMPLE_SENTENCES[locale]) {
        const sentences = SAMPLE_SENTENCES[locale];
        return sentences[Math.floor(Math.random() * sentences.length)];
    }

    // Then check for language code match
    if (SAMPLE_SENTENCES[langCode]) {
        const sentences = SAMPLE_SENTENCES[langCode];
        return sentences[Math.floor(Math.random() * sentences.length)];
    }

    // Default to English
    const sentences = SAMPLE_SENTENCES['en'];
    return sentences[Math.floor(Math.random() * sentences.length)];
}

// Test voice with sample sentence
async function testVoice() {
    const voice = voiceSelect.value;
    const selectedLanguage = languageSelect.value;

    if (!voice || !selectedLanguage) {
        showStatus('Please select a voice first', 'error');
        return;
    }

    // Get sample sentence
    const sampleText = getSampleSentence(selectedLanguage);

    const params = {
        text: sampleText,
        voice: voice,
        rate: `${rateSlider.value >= 0 ? '+' : ''}${rateSlider.value}%`,
        volume: `${volumeSlider.value >= 0 ? '+' : ''}${volumeSlider.value}%`,
        pitch: `${pitchSlider.value >= 0 ? '+' : ''}${pitchSlider.value}Hz`
    };

    try {
        testVoiceBtn.disabled = true;
        testVoiceBtn.innerHTML = '<span class="loading"></span> Testing...';

        const response = await fetch(`${API_BASE_URL}/synthesize`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(params)
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Failed to generate test speech' }));
            const errorMsg = error.detail || 'Failed to generate test speech';

            // Check if it's an invalid voice error
            if (errorMsg.includes('No audio') || errorMsg.includes('voice')) {
                throw new Error(`Voice error: ${errorMsg}. This voice may not be available. Try refreshing the page.`);
            }
            throw new Error(errorMsg);
        }

        const blob = await response.blob();

        // Clean up previous test audio URL
        if (currentTestAudioUrl) {
            URL.revokeObjectURL(currentTestAudioUrl);
        }

        currentTestAudioUrl = URL.createObjectURL(blob);

        // Play audio automatically
        const testAudio = new Audio(currentTestAudioUrl);
        testAudio.play();

        showStatus(`Testing voice: "${sampleText}"`, 'info');

    } catch (error) {
        console.error('Error testing voice:', error);
        showStatus(error.message, 'error');
    } finally {
        testVoiceBtn.disabled = false;
        testVoiceBtn.innerHTML = '<span class="btn-icon">🎧</span> Test Voice';
    }
}

// Clear form
function clearForm() {
    textInput.value = '';
    updateCharCount();
    rateSlider.value = 0;
    volumeSlider.value = 0;
    pitchSlider.value = 0;
    rateValue.textContent = '+0%';
    volumeValue.textContent = '+0%';
    pitchValue.textContent = '+0Hz';
    hideStatus();
}

// History management
function loadHistory() {
    const saved = localStorage.getItem('tts_history');
    if (saved) {
        history = JSON.parse(saved);
        renderHistory();
    }
}

function saveHistory() {
    // Keep only last 10 items
    history = history.slice(0, 10);
    localStorage.setItem('tts_history', JSON.stringify(history));
}

function addToHistory(item) {
    history.unshift(item);
    saveHistory();
    renderHistory();
}

function renderHistory() {
    if (history.length === 0) {
        historyList.innerHTML = '<p class="empty-state">No recent generations yet</p>';
        return;
    }

    historyList.innerHTML = '';

    history.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'history-item';

        const date = new Date(item.timestamp);
        const timeAgo = getTimeAgo(date);

        const languageInfo = item.localeName ? ` - ${item.localeName}` : '';

        div.innerHTML = `
            <div class="history-item-header">
                <div class="history-item-text" title="${escapeHtml(item.text)}">
                    ${escapeHtml(item.text)}
                </div>
                <div class="history-item-time">${timeAgo}</div>
            </div>
            <div class="history-item-voice">${escapeHtml(item.voiceName)}${languageInfo}</div>
            <div class="history-item-actions">
                <button class="btn btn-primary" onclick="loadHistoryItem(${index})">
                    Load
                </button>
                <button class="btn btn-secondary" onclick="deleteHistoryItem(${index})">
                    Delete
                </button>
            </div>
        `;

        historyList.appendChild(div);
    });
}

function loadHistoryItem(index) {
    const item = history[index];

    textInput.value = item.text;
    updateCharCount();

    // Find the voice in the voices list to get its locale
    const voice = voices.find(v => v.Name === item.voice);
    if (voice) {
        // Set language first
        languageSelect.value = voice.Locale;
        // Trigger filter to populate voice dropdown
        filterVoices();
        // Then set the specific voice
        voiceSelect.value = item.voice;
    }

    // Set parameters
    if (item.params) {
        rateSlider.value = parseInt(item.params.rate);
        volumeSlider.value = parseInt(item.params.volume);
        pitchSlider.value = parseInt(item.params.pitch);
        rateValue.textContent = item.params.rate;
        volumeValue.textContent = item.params.volume;
        pitchValue.textContent = item.params.pitch;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    showStatus('History item loaded', 'info');
}

function deleteHistoryItem(index) {
    history.splice(index, 1);
    saveHistory();
    renderHistory();
}

// Utilities
function showStatus(message, type = 'info') {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;
}

function hideStatus() {
    statusMessage.className = 'status-message';
}

function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function updateOnlineStatus() {
    if (navigator.onLine) {
        onlineStatus.textContent = '● Online';
        onlineStatus.className = 'online';
    } else {
        onlineStatus.textContent = '● Offline';
        onlineStatus.className = 'offline';
    }
}

// PWA Setup
function setupPWA() {
    // Register service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('Service Worker registered:', registration);
            })
            .catch(error => {
                console.error('Service Worker registration failed:', error);
            });
    }

    // Install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        installPrompt.style.display = 'inline';
    });

    installBtn.addEventListener('click', async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        console.log(`User response to install prompt: ${outcome}`);
        deferredPrompt = null;
        installPrompt.style.display = 'none';
    });

    window.addEventListener('appinstalled', () => {
        console.log('PWA installed');
        installPrompt.style.display = 'none';
    });
}
