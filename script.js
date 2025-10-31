       // App State Management
        const AppState = {
            searchTerm: '',
            visibleCards: new Set(),
            scrollPosition: 0,
            isSearching: false
        };

        // Utility Functions
        const debounce = (func, wait) => {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        };

        const animateElement = (element, animation, duration = 600) => {
            return new Promise((resolve) => {
                element.style.animation = `${animation} ${duration}ms ease`;
                setTimeout(() => {
                    element.style.animation = '';
                    resolve();
                }, duration);
            });
        };

        // Enhanced Search Functionality
        class SearchManager {
            constructor(inputId, cardSelector) {
                this.input = document.getElementById(inputId);
                this.cards = document.querySelectorAll(cardSelector);
                this.noResultsMessage = this.createNoResultsMessage();
                this.init();
            }

            createNoResultsMessage() {
                const msg = document.createElement('div');
                msg.className = 'no-results';
                msg.style.cssText = `
                    text-align: center;
                    padding: 60px 20px;
                    color: #546e7a;
                    font-size: 1.2em;
                    display: none;
                    animation: fadeInUp 0.6s ease;
                `;
                msg.innerHTML = `
                    <i class="fas fa-search" style="font-size: 3em; margin-bottom: 20px; opacity: 0.3;"></i>
                    <p>Aucun membre trouvé</p>
                    <p style="font-size: 0.9em; margin-top: 10px;">Essayez un autre terme de recherche</p>
                `;
                document.getElementById('membersContainer').appendChild(msg);
                return msg;
            }

            init() {
                this.input.addEventListener('input', debounce((e) => {
                    this.performSearch(e.target.value);
                }, 300));

                // Clear search on ESC key
                this.input.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape') {
                        this.clearSearch();
                    }
                });

                // Add clear button
                this.addClearButton();
            }

            addClearButton() {
                const clearBtn = document.createElement('button');
                clearBtn.innerHTML = '<i class="fas fa-times"></i>';
                clearBtn.style.cssText = `
                    position: absolute;
                    right: 50px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    color: #999;
                    cursor: pointer;
                    display: none;
                    padding: 5px;
                    width: auto;
                    height: auto;
                    font-size: 1.2em;
                    transition: color 0.3s ease;
                `;
                clearBtn.addEventListener('click', () => this.clearSearch());
                clearBtn.addEventListener('mouseenter', () => clearBtn.style.color = '#333');
                clearBtn.addEventListener('mouseleave', () => clearBtn.style.color = '#999');
                
                const searchBox = document.querySelector('.search-box');
                searchBox.appendChild(clearBtn);
                this.clearBtn = clearBtn;
            }

            performSearch(term) {
                AppState.searchTerm = term.toLowerCase().trim();
                AppState.isSearching = AppState.searchTerm.length > 0;
                
                this.clearBtn.style.display = AppState.isSearching ? 'block' : 'none';

                let visibleCount = 0;
                
                this.cards.forEach((card, index) => {
                    const text = card.textContent.toLowerCase();
                    const isVisible = text.includes(AppState.searchTerm);
                    
                    if (isVisible) {
                        visibleCount++;
                        this.showCard(card, index);
                    } else {
                        this.hideCard(card);
                    }
                });

                // Show/hide no results message
                this.noResultsMessage.style.display = 
                    (AppState.isSearching && visibleCount === 0) ? 'block' : 'none';

                // Highlight search term
                if (AppState.isSearching && visibleCount > 0) {
                    this.highlightSearchTerm();
                }
            }

            showCard(card, index) {
                card.style.display = 'grid';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, index * 50);
            }

            hideCard(card) {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }

            highlightSearchTerm() {
                // Remove existing highlights
                document.querySelectorAll('.highlight').forEach(el => {
                    el.outerHTML = el.textContent;
                });

                if (!AppState.searchTerm) return;

                this.cards.forEach(card => {
                    if (card.style.display !== 'none') {
                        const walker = document.createTreeWalker(
                            card,
                            NodeFilter.SHOW_TEXT,
                            null,
                            false
                        );

                        const nodesToHighlight = [];
                        let node;
                        while (node = walker.nextNode()) {
                            if (node.textContent.toLowerCase().includes(AppState.searchTerm)) {
                                nodesToHighlight.push(node);
                            }
                        }

                        nodesToHighlight.forEach(textNode => {
                            const span = document.createElement('span');
                            span.innerHTML = textNode.textContent.replace(
                                new RegExp(`(${AppState.searchTerm})`, 'gi'),
                                '<span class="highlight" style="background: #ffeb3b; padding: 2px 4px; border-radius: 3px; font-weight: 600;">$1</span>'
                            );
                            textNode.replaceWith(span);
                        });
                    }
                });
            }

            clearSearch() {
                this.input.value = '';
                this.performSearch('');
                this.input.focus();
            }
        }

        // Enhanced Scroll Manager
        class ScrollManager {
            constructor() {
                this.scrollTopBtn = document.getElementById('scrollTop');
                this.searchContainer = document.querySelector('.search-container');
                this.lastScrollPosition = 0;
                this.ticking = false;
                this.init();
            }

            init() {
                window.addEventListener('scroll', () => {
                    this.lastScrollPosition = window.scrollY;
                    if (!this.ticking) {
                        window.requestAnimationFrame(() => {
                            this.handleScroll(this.lastScrollPosition);
                            this.ticking = false;
                        });
                        this.ticking = true;
                    }
                });

                this.scrollTopBtn.addEventListener('click', () => this.scrollToTop());
                
                // Add keyboard shortcut (Ctrl/Cmd + Up Arrow)
                document.addEventListener('keydown', (e) => {
                    if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowUp') {
                        e.preventDefault();
                        this.scrollToTop();
                    }
                });
            }

            handleScroll(scrollPos) {
                // Show/hide scroll to top button
                if (scrollPos > 300) {
                    this.scrollTopBtn.classList.add('visible');
                } else {
                    this.scrollTopBtn.classList.remove('visible');
                }

                // Add shadow to search bar when scrolled
                if (scrollPos > 100) {
                    this.searchContainer.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
                } else {
                    this.searchContainer.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
                }

                AppState.scrollPosition = scrollPos;
            }

            scrollToTop() {
                const start = window.scrollY;
                const duration = 800;
                const startTime = performance.now();

                const easeInOutCubic = (t) => {
                    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
                };

                const animateScroll = (currentTime) => {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const easing = easeInOutCubic(progress);
                    
                    window.scrollTo(0, start * (1 - easing));

                    if (progress < 1) {
                        requestAnimationFrame(animateScroll);
                    }
                };

                requestAnimationFrame(animateScroll);
            }
        }

        // Card Interaction Manager
        class CardManager {
            constructor(cardSelector) {
                this.cards = document.querySelectorAll(cardSelector);
                this.init();
            }

            init() {
                this.cards.forEach((card, index) => {
                    // Enhanced hover effects
                    card.addEventListener('mouseenter', () => this.onCardHover(card));
                    card.addEventListener('mouseleave', () => this.onCardLeave(card));
                    
                    // Click to expand/collapse
                    card.addEventListener('click', (e) => {
                        if (!e.target.closest('a')) {
                            this.toggleCardExpansion(card);
                        }
                    });

                    // Lazy load animation
                    this.observeCard(card, index);
                });
            }

            onCardHover(card) {
                const badge = card.querySelector('.badge');
                if (badge) {
                    badge.style.transform = 'scale(1.1) rotate(5deg)';
                }
            }

            onCardLeave(card) {
                const badge = card.querySelector('.badge');
                if (badge) {
                    badge.style.transform = 'scale(1) rotate(0deg)';
                }
            }

            toggleCardExpansion(card) {
                const isExpanded = card.classList.contains('expanded');
                
                // Remove expanded class from all cards
                this.cards.forEach(c => c.classList.remove('expanded'));
                
                if (!isExpanded) {
                    card.classList.add('expanded');
                    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }

            observeCard(card, index) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            setTimeout(() => {
                                entry.target.style.opacity = '1';
                                entry.target.style.transform = 'translateY(0)';
                            }, index * 100);
                            observer.unobserve(entry.target);
                        }
                    });
                }, { threshold: 0.1 });

                observer.observe(card);
            }
        }

        // Email Copy Functionality
        class EmailManager {
            constructor() {
                this.init();
            }

            init() {
                document.querySelectorAll('.contact').forEach(link => {
                    link.addEventListener('contextmenu', (e) => {
                        e.preventDefault();
                        this.copyEmail(link.textContent.trim());
                    });

                    // Add copy button
                    const copyBtn = document.createElement('i');
                    copyBtn.className = 'fas fa-copy';
                    copyBtn.style.cssText = 'margin-left: 8px; cursor: pointer; font-size: 0.9em; opacity: 0.6;';
                    copyBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        this.copyEmail(link.textContent.trim());
                    });
                    link.appendChild(copyBtn);
                });
            }

            copyEmail(email) {
                const cleanEmail = email.replace(/[^\w@.]/g, '');
                navigator.clipboard.writeText(cleanEmail).then(() => {
                    this.showToast('Email copié!');
                });
            }

            showToast(message) {
                const toast = document.createElement('div');
                toast.textContent = message;
                toast.style.cssText = `
                    position: fixed;
                    bottom: 80px;
                    right: 30px;
                    background: #323232;
                    color: white;
                    padding: 12px 24px;
                    border-radius: 25px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                    z-index: 10000;
                    animation: slideInUp 0.3s ease;
                `;
                document.body.appendChild(toast);
                setTimeout(() => {
                    toast.style.animation = 'slideOutDown 0.3s ease';
                    setTimeout(() => toast.remove(), 300);
                }, 2000);
            }
        }

        // Statistics Counter
        class StatsManager {
            constructor() {
                this.addStatsToHeader();
            }

            addStatsToHeader() {
                const stats = document.createElement('div');
                stats.style.cssText = `
                    display: flex;
                    justify-content: center;
                    gap: 40px;
                    margin-top: 30px;
                    flex-wrap: wrap;
                `;
                
                const memberCount = document.querySelectorAll('.member-card').length;
                
                stats.innerHTML = `
                    <div style="text-align: center;">
                        <div style="font-size: 2.5em; font-weight: bold; color: white;">${memberCount}</div>
                        <div style="color: rgba(255,255,255,0.9); font-size: 0.9em;">Membres</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 2.5em; font-weight: bold; color: white;">1</div>
                        <div style="color: rgba(255,255,255,0.9); font-size: 0.9em;">Groupe</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 2.5em; font-weight: bold; color: white;">∞</div>
                        <div style="color: rgba(255,255,255,0.9); font-size: 0.9em;">Possibilités</div>
                    </div>
                `;
                
                document.querySelector('.header').appendChild(stats);
            }
        }

        // Smooth Anchor Scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Add animation keyframes
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInUp {
                from { transform: translateY(100px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            @keyframes slideOutDown {
                from { transform: translateY(0); opacity: 1; }
                to { transform: translateY(100px); opacity: 0; }
            }
            .badge {
                transition: transform 0.3s ease !important;
            }
        `;
        document.head.appendChild(style);

        // Initialize all managers when DOM is ready
        document.addEventListener('DOMContentLoaded', () => {
            new SearchManager('searchInput', '.member-card');
            new ScrollManager();
            new CardManager('.member-card');
            new EmailManager();
            new StatsManager();

            // Add loading complete state
            setTimeout(() => {
                document.body.classList.add('loaded');
            }, 100);
        });

        // Performance monitoring
        window.addEventListener('load', () => {
            const loadTime = performance.now();
            console.log(`%c✨ Groupe NOVA loaded in ${loadTime.toFixed(2)}ms`, 
                'color: #667eea; font-size: 14px; font-weight: bold;');
        });
    