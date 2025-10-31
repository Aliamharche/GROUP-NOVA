document.addEventListener('DOMContentLoaded', function() {
    // Initialize animations for team member cards
    initializeCardAnimations();
    // Add search functionality
    createSearchBar();
    // Add scroll to top button
    createScrollToTopButton();
});

function initializeCardAnimations() {
    const memberCards = document.querySelectorAll('body > div');
    
    memberCards.forEach(card => {
        // Add hover animations
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
            const image = this.querySelector('img');
            if (image) {
                image.style.transform = 'scale(1.05)';
            }
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            const image = this.querySelector('img');
            if (image) {
                image.style.transform = 'scale(1)';
            }
        });

        // Add click interaction
        card.addEventListener('click', function() {
            showMemberDetails(this);
        });
    });
}

function showMemberDetails(card) {
    const title = card.querySelector('h3').textContent;
    const name = card.querySelector('p:nth-child(2)').textContent;
    const role = card.querySelector('p:nth-child(3)').textContent;
    const contact = card.querySelector('p:nth-child(4)').textContent;

    // Create modal for member details
    const modal = document.createElement('div');
    modal.className = 'member-modal';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    const closeBtn = document.createElement('span');
    closeBtn.innerHTML = '&times;';
    closeBtn.className = 'close-button';
    
    modalContent.innerHTML = `
        <h2>${title}</h2>
        <div class="modal-info">
            <p class="modal-name">${name}</p>
            <p class="modal-role">${role}</p>
            <a href="mailto:${contact}"><p class="modal-contact">${contact}</p></a>
        </div>
    `;
    
    modalContent.prepend(closeBtn);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Add modal styles
    const modalStyles = `
        .member-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        .modal-content {
            background-color: white;
            padding: 30px;
            border-radius: 15px;
            position: relative;
            width: 80%;
            max-width: 500px;
            transform: translateY(-20px);
            transition: transform 0.3s ease;
        }
        .close-button {
            position: absolute;
            top: 10px;
            right: 15px;
            font-size: 24px;
            cursor: pointer;
            color: #666;
        }
        .modal-info {
            margin-top: 20px;
        }
        .modal-name {
            font-size: 1.2em;
            color: #1a237e;
            margin-bottom: 10px;
        }
        .modal-role {
            color: #1976d2;
            font-style: italic;
            margin-bottom: 10px;
        }
        .modal-contact {
            color: #546e7a;
        }
    `;

    if (!document.querySelector('#modalStyles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'modalStyles';
        styleSheet.textContent = modalStyles;
        document.head.appendChild(styleSheet);
    }

    // Animation timing
    requestAnimationFrame(() => {
        modal.style.opacity = '1';
        modalContent.style.transform = 'translateY(0)';
    });

    // Close modal functionality
    function closeModal() {
        modal.style.opacity = '0';
        modalContent.style.transform = 'translateY(-20px)';
        setTimeout(() => modal.remove(), 300);
    }

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
}

function createSearchBar() {
    const searchBox = document.createElement('input');
    searchBox.type = 'text';
    searchBox.placeholder = 'Rechercher un membre...';
    searchBox.className = 'search-box';
    document.body.appendChild(searchBox);

    let debounceTimeout;
    searchBox.addEventListener('input', function(e) {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            const searchTerm = e.target.value.toLowerCase();
            filterMembers(searchTerm);
        }, 300);
    });
}

function filterMembers(searchTerm) {
    const memberCards = document.querySelectorAll('body > div');
    
    memberCards.forEach(card => {
        if (card.textContent.toLowerCase().includes(searchTerm)) {
            card.style.display = 'flex';
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
        } else {
            card.style.opacity = '0';
            card.style.transform = 'scale(0.95)';
            setTimeout(() => {
                if (card.style.opacity === '0') {
                    card.style.display = 'none';
                }
            }, 300);
        }
    });
}

function createScrollToTopButton() {
    const scrollButton = document.createElement('button');
    scrollButton.innerHTML = '↑';
    scrollButton.className = 'scroll-top';
    scrollButton.title = 'Retour en haut';
    document.body.appendChild(scrollButton);

    // Show/hide button based on scroll position
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollButton.style.opacity = '1';
            scrollButton.style.transform = 'translateY(0)';
        } else {
            scrollButton.style.opacity = '0';
            scrollButton.style.transform = 'translateY(20px)';
        }
    });

    // Smooth scroll to top
    scrollButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}
