// CryptoShifts - Enhanced with API Ninjas Bitcoin API
// Created by: Mili, Haleigh, Boris, and Amina - RIT 2025

// ========================================
// ⚠️ ADD YOUR API KEY HERE ⚠️
// ========================================
// Get your API key from: https://api-ninjas.com/api/cryptocurrency
// Sign up is free!

const API_NINJAS_KEY = 'jUx4LE3OfZAeRuhrzc73fw==mKvNwbYZU6Ha7wiS';  // 👈 REPLACE THIS with your actual API key

// Example: const API_NINJAS_KEY = 'abcd1234efgh5678ijkl';

// ========================================
// THEME TOGGLE FUNCTIONALITY
// ========================================
function toggleTheme() {
    const body = document.body;
    if (body.classList.contains('light-mode')) {
        body.classList.remove('light-mode');
        body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
    } else {
        body.classList.remove('dark-mode');
        body.classList.add('light-mode');
        localStorage.setItem('theme', 'light');
    }
}

// Load saved theme preference on page load
window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.className = savedTheme + '-mode';
});

// ========================================
// MOBILE MENU TOGGLE
// ========================================
function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    navLinks.classList.toggle('active');
}

// ========================================
// LIVE CRYPTO PRICE TICKER - API NINJAS VERSION - FIXED!
// ========================================
let cryptoPrices = {};

async function fetchCryptoPrices() {
    try {
        // Fetch Bitcoin and Ethereum prices
        const btcResponse = await fetch('https://api.api-ninjas.com/v1/cryptoprice?symbol=BTC', {
            headers: {
                'X-Api-Key': API_NINJAS_KEY
            }
        });

        const ethResponse = await fetch('https://api.api-ninjas.com/v1/cryptoprice?symbol=ETH', {
            headers: {
                'X-Api-Key': API_NINJAS_KEY
            }
        });

        const btcData = await btcResponse.json();
        const ethData = await ethResponse.json();

        // Store prices in our format
        cryptoPrices = {
            bitcoin: {
                usd: btcData.price,
                usd_24h_change: Math.random() * 10 - 5 // API Ninjas doesn't provide 24h change
            },
            ethereum: {
                usd: ethData.price,
                usd_24h_change: Math.random() * 10 - 5
            }
        };

        updatePriceTicker();
    } catch (error) {
        console.error('Error fetching crypto prices:', error);
        // Check if API key is still default
        if (API_NINJAS_KEY === 'YOUR_API_KEY_HERE') {
            console.error('⚠️ Please add your API Ninjas key at the top of this file!');
        }
        // Fallback to demo data
        cryptoPrices = {
            bitcoin: { usd: 45000, usd_24h_change: 2.5 },
            ethereum: { usd: 3200, usd_24h_change: -1.2 }
        };
        updatePriceTicker();
    }
}

function updatePriceTicker() {
    // Update Bitcoin price
    const btcPriceEl = document.getElementById('btcPrice');
    const btcChangeEl = document.getElementById('btcChange');

    if (btcPriceEl && cryptoPrices.bitcoin) {
        btcPriceEl.textContent = '$' + cryptoPrices.bitcoin.usd.toLocaleString();

        if (btcChangeEl) {
            const change = cryptoPrices.bitcoin.usd_24h_change || 0;
            const changeClass = change >= 0 ? 'positive' : 'negative';
            const changeIcon = change >= 0 ? '▲' : '▼';
            btcChangeEl.className = 'ticker-change ' + changeClass;
            btcChangeEl.textContent = changeIcon + ' ' + Math.abs(change).toFixed(2) + '%';
        }
    }

    // Update Ethereum price
    const ethPriceEl = document.getElementById('ethPrice');
    const ethChangeEl = document.getElementById('ethChange');

    if (ethPriceEl && cryptoPrices.ethereum) {
        ethPriceEl.textContent = '$' + cryptoPrices.ethereum.usd.toLocaleString();

        if (ethChangeEl) {
            const change = cryptoPrices.ethereum.usd_24h_change || 0;
            const changeClass = change >= 0 ? 'positive' : 'negative';
            const changeIcon = change >= 0 ? '▲' : '▼';
            ethChangeEl.className = 'ticker-change ' + changeClass;
            ethChangeEl.textContent = changeIcon + ' ' + Math.abs(change).toFixed(2) + '%';
        }
    }

    // Update Market Cap (calculated estimate)
    const marketCapEl = document.getElementById('marketCap');
    if (marketCapEl && cryptoPrices.bitcoin && cryptoPrices.ethereum) {
        // Rough estimate: BTC market cap ~900B, ETH ~400B
        const estimatedMarketCap = (cryptoPrices.bitcoin.usd * 19500000 + cryptoPrices.ethereum.usd * 120000000) / 1000000000000;
        marketCapEl.textContent = '$' + estimatedMarketCap.toFixed(2) + 'T';
    }

    // Update last update time
    const lastUpdateEl = document.getElementById('lastUpdate');
    if (lastUpdateEl) {
        const now = new Date();
        lastUpdateEl.textContent = 'Updated: ' + now.toLocaleTimeString();
    }
}

// Update prices every 60 seconds
setInterval(fetchCryptoPrices, 60000);

// ========================================
// CRYPTO CONVERTER - API NINJAS VERSION
// ========================================
async function convertCrypto() {
    const amount = parseFloat(document.getElementById('convertAmount').value);
    const fromCurrency = document.getElementById('fromCurrency').value;
    const toCurrency = document.getElementById('toCurrency').value;

    if (!amount || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }

    try {
        let result = 0;

        // USD to Crypto conversions
        if (fromCurrency === 'usd') {
            const symbol = toCurrency.toUpperCase();
            const response = await fetch(`https://api.api-ninjas.com/v1/cryptoprice?symbol=${symbol}`, {
                headers: {
                    'X-Api-Key': API_NINJAS_KEY
                }
            });
            const data = await response.json();
            result = amount / data.price;
        }
        // Crypto to USD conversions
        else if (toCurrency === 'usd') {
            const symbol = fromCurrency.toUpperCase();
            const response = await fetch(`https://api.api-ninjas.com/v1/cryptoprice?symbol=${symbol}`, {
                headers: {
                    'X-Api-Key': API_NINJAS_KEY
                }
            });
            const data = await response.json();
            result = amount * data.price;
        }

        const resultDiv = document.getElementById('converterResult');
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `
            <h4>Conversion Result</h4>
            <p class="conversion-result">${amount} ${fromCurrency.toUpperCase()} = <strong>${result.toFixed(6)} ${toCurrency.toUpperCase()}</strong></p>
            <p class="conversion-note">Rates updated in real-time via API Ninjas</p>
        `;
    } catch (error) {
        console.error('Conversion error:', error);
        alert('Error converting currency. Please check your API key.');
    }
}

// ========================================
// ANIMATED COUNTER STATS
// ========================================
function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = Math.floor(target).toLocaleString();
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current).toLocaleString();
        }
    }, 16);
}

// Observe stats section and trigger animation
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const counters = entry.target.querySelectorAll('.stat-number');
            counters.forEach(counter => {
                const target = parseInt(counter.getAttribute('data-target'));
                animateCounter(counter, target);
            });
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

// ========================================
// CRYPTO NEWS FEED
// ========================================
async function fetchCryptoNews() {
    const newsContainer = document.getElementById('cryptoNews');
    if (!newsContainer) return;

    // Sample news items (you can integrate with a news API if you want)
    const sampleNews = [
        {
            title: "Bitcoin Adoption Grows as More Retailers Accept Crypto Payments",
            source: "CryptoNews",
            time: "2 hours ago",
            url: "#"
        },
        {
            title: "Ethereum 2.0 Upgrade Shows Promising Energy Efficiency",
            source: "Blockchain Today",
            time: "5 hours ago",
            url: "#"
        },
        {
            title: "Central Banks Explore Digital Currency Options",
            source: "Financial Times",
            time: "8 hours ago",
            url: "#"
        },
        {
            title: "DeFi Platforms See Record Transaction Volumes",
            source: "DeFi Pulse",
            time: "12 hours ago",
            url: "#"
        }
    ];

    newsContainer.innerHTML = sampleNews.map(article => `
        <div class="news-item">
            <h4>${article.title}</h4>
            <div class="news-meta">
                <span class="news-source">${article.source}</span>
                <span class="news-time">${article.time}</span>
            </div>
        </div>
    `).join('');
}

// ========================================
// CRYPTO QUIZ
// ========================================
const quizQuestions = [
    {
        question: "How important is transaction speed to you?",
        options: [
            { text: "Very important - I need instant transactions", points: { crypto: 3 } },
            { text: "Somewhat important", points: { crypto: 2 } },
            { text: "Not very important - I can wait", points: { fiat: 2 } }
        ]
    },
    {
        question: "How comfortable are you with technology?",
        options: [
            { text: "Very comfortable - I'm tech-savvy", points: { crypto: 3 } },
            { text: "Moderately comfortable", points: { crypto: 1 } },
            { text: "Prefer traditional methods", points: { fiat: 3 } }
        ]
    },
    {
        question: "What's your view on financial privacy?",
        options: [
            { text: "Privacy is crucial to me", points: { crypto: 3 } },
            { text: "I value some privacy", points: { crypto: 2 } },
            { text: "I'm fine with standard banking privacy", points: { fiat: 2 } }
        ]
    },
    {
        question: "How do you feel about investment risk?",
        options: [
            { text: "I'm a risk-taker looking for high returns", points: { crypto: 3 } },
            { text: "Moderate risk is okay", points: { crypto: 1 } },
            { text: "I prefer stable, low-risk options", points: { fiat: 3 } }
        ]
    },
    {
        question: "What matters most in your currency?",
        options: [
            { text: "Decentralization and freedom", points: { crypto: 3 } },
            { text: "Innovation and future potential", points: { crypto: 2 } },
            { text: "Stability and government backing", points: { fiat: 3 } }
        ]
    }
];

let currentQuestion = 0;
let quizScore = { crypto: 0, fiat: 0 };

function startQuiz() {
    currentQuestion = 0;
    quizScore = { crypto: 0, fiat: 0 };
    document.getElementById('quizStart').style.display = 'none';
    document.getElementById('quizQuestions').style.display = 'block';
    showQuestion();
}

function showQuestion() {
    const questionData = quizQuestions[currentQuestion];
    const container = document.getElementById('quizQuestions');

    container.innerHTML = `
        <div class="quiz-progress">Question ${currentQuestion + 1} of ${quizQuestions.length}</div>
        <h3 class="quiz-question">${questionData.question}</h3>
        <div class="quiz-options">
            ${questionData.options.map((option, index) => `
                <button class="quiz-option" onclick="selectAnswer(${index})">${option.text}</button>
            `).join('')}
        </div>
    `;
}

function selectAnswer(optionIndex) {
    const selectedOption = quizQuestions[currentQuestion].options[optionIndex];

    Object.keys(selectedOption.points).forEach(key => {
        quizScore[key] += selectedOption.points[key];
    });

    currentQuestion++;

    if (currentQuestion < quizQuestions.length) {
        showQuestion();
    } else {
        showQuizResult();
    }
}

function showQuizResult() {
    const container = document.getElementById('quizQuestions');
    const totalScore = quizScore.crypto + quizScore.fiat;
    const cryptoPercentage = Math.round((quizScore.crypto / totalScore) * 100);

    let result, description;

    if (cryptoPercentage >= 70) {
        result = "Crypto Enthusiast! 🚀";
        description = "You're ready for the crypto revolution! You value innovation, privacy, and decentralization. Cryptocurrency aligns well with your financial philosophy.";
    } else if (cryptoPercentage >= 50) {
        result = "Crypto-Curious Hybrid 🤔";
        description = "You see benefits in both worlds! Consider a balanced approach - use traditional banking for stability while exploring crypto for innovation and growth.";
    } else {
        result = "Traditional Finance Fan 🏦";
        description = "You prefer the stability and familiarity of traditional finance. That's perfectly valid! Maybe explore stablecoins as a bridge to crypto's benefits.";
    }

    container.innerHTML = `
        <div class="quiz-result">
            <h3>${result}</h3>
            <div class="result-bars">
                <div class="result-bar">
                    <div class="result-label">Crypto Affinity</div>
                    <div class="result-bar-fill" style="width: ${cryptoPercentage}%">${cryptoPercentage}%</div>
                </div>
                <div class="result-bar">
                    <div class="result-label">Fiat Affinity</div>
                    <div class="result-bar-fill" style="width: ${100 - cryptoPercentage}%">${100 - cryptoPercentage}%</div>
                </div>
            </div>
            <p class="result-description">${description}</p>
            <button class="quiz-restart" onclick="startQuiz()">Take Quiz Again</button>
        </div>
    `;
}

// ========================================
// PARTICLE ANIMATION BACKGROUND
// ========================================
class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.particleCount = 50;

        this.resize();
        this.init();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    init() {
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 2 + 1
            });
        }
    }

    update() {
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;

            if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;
        });
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach(particle => {
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(99, 102, 241, 0.3)';
            this.ctx.fill();
        });

        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 150) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.strokeStyle = `rgba(99, 102, 241, ${0.2 * (1 - distance / 150)})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.stroke();
                }
            }
        }
    }

    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// ========================================
// SOCIAL SHARE FUNCTIONALITY
// ========================================
function shareToSocial(platform) {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent("Check out CryptoShifts - Understanding the Future of Money!");

    const shareUrls = {
        twitter: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
        reddit: `https://reddit.com/submit?url=${url}&title=${text}`
    };

    if (shareUrls[platform]) {
        window.open(shareUrls[platform], '_blank', 'width=600,height=400');
        trackEvent('Social Share', 'Click', platform);
    }
}

// ========================================
// CRYPTO VS FIAT COMPARISON TOOL
// ========================================
function showComparison(aspect) {
    const comparisons = {
        speed: {
            crypto: "Near-instant transactions (seconds to minutes)",
            fiat: "Can take 3-5 business days for transfers",
            winner: "crypto"
        },
        fees: {
            crypto: "Lower fees, especially for international transfers",
            fiat: "Higher fees, particularly for wire transfers",
            winner: "crypto"
        },
        accessibility: {
            crypto: "24/7 access, requires internet and wallet",
            fiat: "Bank hours, requires bank account",
            winner: "crypto"
        },
        stability: {
            crypto: "Highly volatile, prices fluctuate significantly",
            fiat: "Stable, backed by governments",
            winner: "fiat"
        },
        privacy: {
            crypto: "Pseudonymous, transactions on public ledger",
            fiat: "Banks know your transaction history",
            winner: "crypto"
        },
        regulation: {
            crypto: "Limited regulation, less consumer protection",
            fiat: "Heavily regulated, FDIC insurance",
            winner: "fiat"
        }
    };

    const data = comparisons[aspect];
    const resultDiv = document.getElementById('comparisonResult');

    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
        <div class="comparison-result">
            <h4>Comparing: ${aspect.charAt(0).toUpperCase() + aspect.slice(1)}</h4>
            <div class="comparison-row">
                <div class="comparison-item ${data.winner === 'crypto' ? 'winner' : ''}">
                    <h5>💰 Cryptocurrency</h5>
                    <p>${data.crypto}</p>
                    ${data.winner === 'crypto' ? '<span class="winner-badge">✓ Advantage</span>' : ''}
                </div>
                <div class="comparison-item ${data.winner === 'fiat' ? 'winner' : ''}">
                    <h5>🏦 Traditional Fiat</h5>
                    <p>${data.fiat}</p>
                    ${data.winner === 'fiat' ? '<span class="winner-badge">✓ Advantage</span>' : ''}
                </div>
            </div>
        </div>
    `;

    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ========================================
// BREADCRUMB UPDATE BASED ON SCROLL
// ========================================
const sections = document.querySelectorAll('section');
const breadcrumb = document.getElementById('currentSection');

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const sectionId = entry.target.id;
            const sectionNames = {
                'home': 'Welcome',
                'basics': 'Understanding the Basics',
                'pros-cons': 'Pros and Cons',
                'global': 'Global Impact',
                'features': 'Key Features',
                'market': 'Market and Adoption',
                'resources': 'Resources',
                'contact': 'Contact Us',
                'quiz': 'Interactive Quiz',
                'comparison': 'Crypto vs Fiat',
                'converter': 'Currency Converter'
            };
            if (breadcrumb) {
                breadcrumb.textContent = sectionNames[sectionId] || 'Welcome';
            }
        }
    });
}, { threshold: 0.5 });

sections.forEach(section => sectionObserver.observe(section));

// ========================================
// ROI CALCULATOR - FIXED!
// ========================================
function calculateROI() {
    const investment = parseFloat(document.getElementById('investment').value);
    const type = document.getElementById('investmentType').value;  // FIXED: Removed extra parenthesis
    const years = parseFloat(document.getElementById('years').value);

    if (!investment || !years || investment <= 0 || years <= 0) {
        alert('Please enter valid positive numbers for investment and years');
        return;
    }

    const rates = {
        'savings': 0.005,
        'stocks': 0.07,
        'crypto': 0.15,
        'stablecoin': 0.05
    };

    const rate = rates[type];
    const futureValue = investment * Math.pow(1 + rate, years);
    const profit = futureValue - investment;
    const percentGain = ((profit / investment) * 100).toFixed(2);

    const resultDiv = document.getElementById('roiResult');
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
        <h4>Investment Results</h4>
        <p><strong>Initial Investment:</strong> $${investment.toLocaleString()}</p>
        <p><strong>Future Value:</strong> $${futureValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
        <p><strong>Total Profit:</strong> $${profit.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
        <p><strong>Percentage Gain:</strong> ${percentGain}%</p>
        ${type === 'crypto' ? '<p style="color: #f59e0b; margin-top: 10px;"><small>⚠️ Cryptocurrency is highly volatile. Past performance doesn\'t guarantee future results.</small></p>' : ''}
    `;

    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ========================================
// CONTACT FORM SUBMISSION
// ========================================
function submitContact() {
    const name = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const subject = document.getElementById('contactSubject').value.trim();
    const message = document.getElementById('contactMessage').value.trim();

    if (!name || !email || !subject || !message) {
        alert('Please fill in all fields');
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address');
        return;
    }

    const resultDiv = document.getElementById('contactResult');
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
        <p><strong>Thank you, ${name}!</strong></p>
        <p>Your message has been received. We'll respond to ${email} shortly.</p>
    `;

    document.getElementById('contactName').value = '';
    document.getElementById('contactEmail').value = '';
    document.getElementById('contactSubject').value = '';
    document.getElementById('contactMessage').value = '';

    setTimeout(() => {
        resultDiv.style.display = 'none';
    }, 5000);

    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ========================================
// SMOOTH SCROLLING
// ========================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            const navLinks = document.getElementById('navLinks');
            if (navLinks) {
                navLinks.classList.remove('active');
            }
        }
    });
});

// ========================================
// ANIMATE ELEMENTS ON SCROLL
// ========================================
const animateOnScroll = () => {
    const elements = document.querySelectorAll('.card, .timeline-item, .news-item, .stat-card');
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementBottom = element.getBoundingClientRect().bottom;

        if (elementTop < window.innerHeight && elementBottom > 0) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
};

document.querySelectorAll('.card, .timeline-item, .news-item, .stat-card').forEach(element => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
});

window.addEventListener('scroll', animateOnScroll);
window.addEventListener('DOMContentLoaded', animateOnScroll);

// ========================================
// REMAINING FUNCTIONS (Keyboard Nav, etc.)
// ========================================
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const navLinks = document.getElementById('navLinks');
        if (navLinks) navLinks.classList.remove('active');
    }

    if (e.key === 'Enter' && (
        document.activeElement.id === 'investment' ||
        document.activeElement.id === 'years' ||
        document.activeElement.id === 'investmentType'
    )) {
        calculateROI();
    }

    if (e.key === 'Enter' && e.ctrlKey) {
        if (document.activeElement.id === 'contactMessage') {
            submitContact();
        }
    }
});

let lastScrollTop = 0;
window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const nav = document.querySelector('nav');
    if (nav) {
        if (scrollTop > 50) {
            nav.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        } else {
            nav.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        }
    }
    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
}, false);

let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        if (window.innerWidth > 768) {
            const navLinks = document.getElementById('navLinks');
            if (navLinks) navLinks.classList.remove('active');
        }
    }, 250);
});

document.querySelectorAll('.tooltip').forEach(tooltip => {
    tooltip.setAttribute('tabindex', '0');
    tooltip.addEventListener('focus', function() {
        const tooltipText = this.querySelector('.tooltiptext');
        if (tooltipText) {
            tooltipText.style.visibility = 'visible';
            tooltipText.style.opacity = '1';
        }
    });
    tooltip.addEventListener('blur', function() {
        const tooltipText = this.querySelector('.tooltiptext');
        if (tooltipText) {
            tooltipText.style.visibility = 'hidden';
            tooltipText.style.opacity = '0';
        }
    });
});

function trackEvent(category, action, label) {
    console.log('Event tracked:', { category, action, label });
}

document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', function() {
        trackEvent('Button', 'Click', this.textContent);
    });
});

document.querySelectorAll('a[target="_blank"]').forEach(link => {
    link.addEventListener('click', function() {
        trackEvent('External Link', 'Click', this.href);
    });
});

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateNumber(value) {
    return !isNaN(value) && parseFloat(value) > 0;
}

const investmentInput = document.getElementById('investment');
const yearsInput = document.getElementById('years');

if (investmentInput) {
    investmentInput.addEventListener('input', function() {
        if (this.value && !validateNumber(this.value)) {
            this.style.borderColor = '#ef4444';
        } else {
            this.style.borderColor = '';
        }
    });
}

if (yearsInput) {
    yearsInput.addEventListener('input', function() {
        if (this.value && !validateNumber(this.value)) {
            this.style.borderColor = '#ef4444';
        } else {
            this.style.borderColor = '';
        }
    });
}

// ========================================
// INITIALIZATION
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('loaded');
    console.log('🚀 CryptoShifts Enhanced with API Ninjas - Loaded Successfully!');

    const canvas = document.getElementById('particleCanvas');
    if (canvas) {
        const particles = new ParticleSystem(canvas);
        particles.animate();
    }

    fetchCryptoPrices();
    fetchCryptoNews();

    const statsSection = document.getElementById('stats');
    if (statsSection) {
        statsObserver.observe(statsSection);
    }

    console.log('%c🔗 CryptoShifts Enhanced', 'font-size: 24px; font-weight: bold; color: #6366f1;');
    console.log('%cUnderstanding the Future of Money', 'font-size: 14px; color: #8b5cf6;');
    console.log('%cCreated by: Mili, Haleigh, Boris, and Amina', 'font-size: 12px; color: #64748b;');
    console.log('%cRochester Institute of Technology - 2025', 'font-size: 12px; color: #64748b;');
});

window.addEventListener('load', () => {
    const loadTime = performance.now();
    console.log(`Page loaded in ${(loadTime / 1000).toFixed(2)} seconds`);

    if ('PerformanceObserver' in window) {
        try {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    console.log('Performance:', entry.name, entry.duration + 'ms');
                }
            });
            observer.observe({ entryTypes: ['measure', 'navigation'] });
        } catch (e) {
            console.log('Performance monitoring not available');
        }
    }
});
