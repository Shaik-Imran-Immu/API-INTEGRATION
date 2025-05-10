// API Configuration
const API_KEY = "pub_8277344e9ae5752109514eaeb31accd8e5ea7";
const BASE_URL = "https://newsdata.io/api/1/news";

// DOM Elements
const newsContainer = document.getElementById("news-container");
const statusMessage = document.getElementById("status-message");
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const filterButtons = document.querySelectorAll(".filter-btn");
const themeSwitcher = document.getElementById("theme-switcher");

// State
let currentCategory = "india";
let currentQuery = "";

// Human-friendly messages
const messages = {
    loading: "Bringing you the latest updates from across India...",
    empty: "No stories found matching your criteria. Try a different search.",
    error: "We're having trouble loading news. Please try again later.",
    offline: "You appear to be offline. Connect to the internet to get latest news."
};

// Initialize
document.addEventListener("DOMContentLoaded", () => {
    // Load saved theme preference
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
    updateThemeIcon(savedTheme);
    
    // Fetch initial news
    fetchNews();
    
    // Set up event listeners
    setupEventListeners();
});

function setupEventListeners() {
    // Category filter buttons
    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            filterButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");
            currentCategory = button.dataset.category;
            currentQuery = "";
            searchInput.value = "";
            fetchNews();
        });
    });
    
    // Search functionality
    searchBtn.addEventListener("click", () => {
        currentQuery = searchInput.value.trim();
        if (currentQuery) {
            fetchNews();
        }
    });
    
    searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            currentQuery = searchInput.value.trim();
            if (currentQuery) {
                fetchNews();
            }
        }
    });
    
    // Theme switcher
    themeSwitcher.addEventListener("click", toggleTheme);
    
    // Offline detection
    window.addEventListener("offline", () => {
        showMessage(messages.offline, "error");
    });
}

// Fetch news from API
async function fetchNews() {
    try {
        showLoading(messages.loading);
        
        // Build API URL
        let url = `${BASE_URL}?apikey=${API_KEY}&country=in`;
        
        if (currentQuery) {
            url += `&q=${encodeURIComponent(currentQuery)}`;
        } else if (currentCategory !== "india") {
            url += `&category=${currentCategory}`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.results || data.results.length === 0) {
            showMessage(messages.empty, "info");
            return;
        }
        
        displayNews(data.results);
    } catch (error) {
        console.error("News fetch error:", error);
        showMessage(messages.error, "error");
    }
}

// Display news articles
function displayNews(articles) {
    newsContainer.innerHTML = articles
        .filter(article => article.title && !article.title.includes("[Removed]"))
        .map(article => `
            <article class="news-card">
                <img src="${article.image_url || 'placeholder-image.jpg'}" 
                     alt="${article.title}" 
                     class="news-image"
                     onerror="this.src='placeholder-image.jpg'">
                <div class="news-content">
                    <div class="news-source">
                        ${article.source_icon ? 
                            `<img src="${article.source_icon}" class="source-icon" alt="${article.source_id}">` : 
                            `<i class="fas fa-newspaper"></i>`}
                        ${article.source_id || "Unknown source"}
                    </div>
                    <h3 class="news-title">${article.title}</h3>
                    <p class="news-description">${article.description || "No description available."}</p>
                    <div class="news-footer">
                        <span>${new Date(article.pubDate).toLocaleDateString()}</span>
                        <a href="${article.link}" target="_blank" rel="noopener" class="read-more">
                            Read more <i class="fas fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
            </article>
        `)
        .join("");
}

// Theme management
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const icon = themeSwitcher.querySelector("i");
    icon.className = theme === "dark" ? "fas fa-sun" : "fas fa-moon";
}

// UI Helpers
function showLoading(message) {
    statusMessage.innerHTML = `
        <div class="loader"></div>
        <p>${message}</p>
    `;
    newsContainer.innerHTML = "";
}

function showMessage(message, type = "info") {
    statusMessage.innerHTML = `
        <p class="${type === 'error' ? 'error-message' : ''}">${message}</p>
    `;
    if (type !== "info") {
        newsContainer.innerHTML = "";
    }
}