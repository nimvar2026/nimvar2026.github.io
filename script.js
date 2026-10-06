document.addEventListener("DOMContentLoaded", function () {
    const SHOW_SPEAKER_NAMES_IN_SCHEDULE = true;
    if (!SHOW_SPEAKER_NAMES_IN_SCHEDULE) {
        const interactiveInstructions = document.getElementById("interactive-instructions");
        if (interactiveInstructions) {
            interactiveInstructions.style.display = "none";
        }
    }

    const hamburger = document.getElementById("hamburger-menu");
    const navLinks = document.getElementById("nav-links");

    if (hamburger && navLinks) {
        hamburger.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            navLinks.classList.toggle("active");
            hamburger.classList.toggle("active");
        });

        document.addEventListener("click", function (event) {
            const isClickInside = navLinks.contains(event.target) || hamburger.contains(event.target);
            if (!isClickInside && navLinks.classList.contains("active")) {
                navLinks.classList.remove("active");
                hamburger.classList.remove("active");
            }
        });
    }

    const scrollIndicator = document.querySelector(".scroll-indicator");
    if (scrollIndicator) {
        let isVisible = false;
        let maxScroll = 0;

        setTimeout(function () {
            if (window.scrollY === 0 && scrollIndicator.style.display !== "none") {
                isVisible = true;
                scrollIndicator.style.transition = "opacity 1.5s ease";
                scrollIndicator.style.opacity = "0.85";
            }
        }, 2000);

        window.addEventListener("scroll", function () {
            if (!isVisible) {
                scrollIndicator.style.display = "none";
                return;
            }
            scrollIndicator.style.transition = "none";
            let currentScroll = window.scrollY;
            if (currentScroll > maxScroll) {
                maxScroll = currentScroll;
            }
            let newOpacity = 0.85 - maxScroll / 300;
            scrollIndicator.style.opacity = Math.max(0, newOpacity);
            if (newOpacity <= 0) {
                scrollIndicator.style.display = "none";
            }
        });
    }

    const modal = document.getElementById("image-modal");
    const modalImg = document.getElementById("modal-img");
    const images = document.querySelectorAll(".dept-photo, .step-photo");

    if (modal && modalImg && images.length > 0) {
        images.forEach((img) => {
            img.addEventListener("click", function () {
                modalImg.src = "";           
                modalImg.src = this.src;      
                modal.style.display = "flex";  
            });
        });

        
        const closeModal = () => {
            modal.style.display = "none";
            modalImg.src = "";                 
        };

        modal.addEventListener("click", closeModal);

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape" || event.key === "Esc") {
                closeModal();
            }
        });
    }

    const invitedContainer = document.getElementById("invited-talks-list");
    const contributedContainer = document.getElementById("contributed-talks-list");

    if (invitedContainer || contributedContainer) {
        fetch("talks.json")
            .then(response => {
                if (!response.ok) throw new Error("Error loading the JSON file");
                return response.json();
            })
            .then(talksData => {
                initScheduleAndAbstracts(talksData);
            })
            .catch(error => console.error("Fetch Error:", error));
    }

    function initScheduleAndAbstracts(talksData) {
        const invitedContainer = document.getElementById("invited-talks-list");
        const contributedContainer = document.getElementById("contributed-talks-list");

        if (invitedContainer && contributedContainer) {
            const talksMap = new Map();

            talksData.forEach((talk) => {
                talksMap.set(talk.id, talk);

                const card = document.createElement("article");
                card.className = "talk-card";
                card.id = talk.id;

                const isInteractive = SHOW_SPEAKER_NAMES_IN_SCHEDULE;

                const titleHTML = isInteractive 
                    ? `<a href="#" class="schedule-return-link" data-talk-id="${talk.id}">${talk.title}</a>` 
                    : talk.title;

                const speakerHTML = isInteractive 
                    ? `<a href="#" class="schedule-return-link" data-talk-id="${talk.id}"><strong>${talk.speaker}</strong></a>` 
                    : `<strong>${talk.speaker}</strong>`;

                let referencesHTML = '';
                if (talk.bib_file) {
                    referencesHTML = `
                        <div class="talk-references" id="refs-${talk.id}">
                            <h4>References</h4>
                            <div class="refs-content">Loading references...</div>
                        </div>
                    `;
                }

                card.innerHTML = `
                    <div class="talk-header">
                        <h3 class="talk-title">
                            ${titleHTML}
                        </h3>
                        <div class="talk-speaker">
                            ${speakerHTML} <em>(${talk.affiliation})</em>
                        </div>
                    </div>
                    <div class="talk-abstract">
                        <p>${talk.abstract.replace(/\n/g, '<br>')}</p>
                    </div>
                    ${referencesHTML} 
                    <div class="talk-footer">
                        <a href="#schedule-overview" class="btn-back-schedule">↑ Back to Schedule</a>
                    </div>
                `;

                if (talk.type === "invited") {
                    invitedContainer.appendChild(card);
                } else {
                    contributedContainer.appendChild(card);
                }

                if (talk.bib_file) {
                    fetch(talk.bib_file)
                        .then(response => {
                            if (!response.ok) throw new Error("Bib file non trovato");
                            return response.text();
                        })
                        .then(async bibText => { 
                            const Cite = window.Cite || window.require('citation-js');
                            
                            let config = Cite.plugins.config.get('@csl');
                            if (!config.templates.has('ieee')) {
                                const cslResponse = await fetch('https://raw.githubusercontent.com/citation-style-language/styles/master/ieee.csl');
                                const cslText = await cslResponse.text();
                                config.templates.add('ieee', cslText);
                            }

                            const cite = new Cite(bibText);
                            
                            let htmlRefs = cite.format('bibliography', {
                                format: 'html',
                                template: 'ieee',
                                lang: 'en-US'
                            });
                            
                            const tempDiv = document.createElement('div');
                            tempDiv.innerHTML = htmlRefs;
                            
                            tempDiv.querySelectorAll('a').forEach(a => {
                                a.setAttribute('target', '_blank');
                            });
                            
                            tempDiv.querySelectorAll('.csl-right-inline, .csl-entry').forEach(el => {
                                if (!el.innerHTML.includes('<a href="https://doi.org')) {
                                    el.innerHTML = el.innerHTML.replace(
                                        /doi:\s*(10\.\d{4,9}\/[^\s<]+)/g, 
                                        function(match, rawDoi) {
                                            const cleanDoi = rawDoi.replace(/[\.,]+$/, '');
                                            return `doi: <a href="https://doi.org/${cleanDoi}" target="_blank">${cleanDoi}</a>.`;
                                        }
                                    );
                                }
                                
                                el.innerHTML = el.innerHTML.replace(
                                    /\[Online\]\.\s*Available:\s*/g, 
                                    'Preprint available at: '
                                );
                            });
                            
                            const entries = tempDiv.querySelectorAll('.csl-entry');
                            entries.forEach(entry => {
                                const textContent = entry.textContent;
                                
                                const item = cite.data.find(d => {
                                    if (!d.title) return false;
                                    const cleanTitle = d.title.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                                    const cleanText = textContent.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                                    return cleanText.includes(cleanTitle);
                                });
                                
                                if (item && item.URL && !textContent.includes(item.URL)) {
                                    const cleanUrl = item.URL.trim();
                                    const preprintSpan = document.createElement('span');
                                    preprintSpan.innerHTML = ` Preprint available at: <a href="${cleanUrl}" target="_blank">${cleanUrl}</a>.`;
                                    
                                    const rightInline = entry.querySelector('.csl-right-inline');
                                    if (rightInline) {
                                        rightInline.appendChild(preprintSpan);
                                    } else {
                                        entry.appendChild(preprintSpan);
                                    }
                                }
                            });
                            
                            document.querySelector(`#refs-${talk.id} .refs-content`).innerHTML = tempDiv.innerHTML;
                        })
                        .catch(err => {
                            console.error(`Errore nel caricamento referenze per ${talk.id}:`, err);
                            document.querySelector(`#refs-${talk.id} .refs-content`).innerHTML = "<p><em>References non disponibili.</em></p>";
                        });
                }
            });

            if (window.MathJax && window.MathJax.typesetPromise) {
                window.MathJax.typesetPromise();
            }

            const talkCells = document.querySelectorAll("td[data-talk-id]");

            talkCells.forEach((cell) => {
                const talkId = cell.getAttribute("data-talk-id");
                const talk = talksMap.get(talkId);

                if (talk) {
                    let showName = false;
                    
                    if (talk.type === "contributed") {
                        showName = true;
                    } else {
                        showName = SHOW_SPEAKER_NAMES_IN_SCHEDULE;
                    }

                    if (showName) {
                        cell.innerHTML = `<a href="#${talk.id}" class="schedule-talk-link">${talk.speaker}</a>`;
                    } else {
                        const targetSection = talk.type === "invited" ? "#invited-talks-section" : "#contributed-talks-section";
                        const labelText = talk.type === "invited" ? "Talk" : "Contributed Talk";
                        cell.innerHTML = `<a href="${targetSection}" class="schedule-talk-link">${labelText}</a>`;
                    }
                }
            });

            const toggleLeft = document.getElementById('view-toggle-left');
            const toggleRight = document.getElementById('view-toggle-right');
            const toggleText = document.getElementById('view-toggle-text');
            const desktopSchedule = document.querySelector('.desktop-schedule');
            const mobileSchedule = document.querySelector('.mobile-schedule');
            const dayContainers = document.querySelectorAll('.mobile-schedule .schedule-container');

            const states = [
                { id: 'summary', label: 'Sept 14 - 17, 2026' },
                { id: 'monday', label: 'Monday, September 14' },
                { id: 'tuesday', label: 'Tuesday, September 15' },
                { id: 'wednesday', label: 'Wednesday, September 16' },
                { id: 'thursday', label: 'Thursday, September 17' }
            ];

            let currentIndex = 0;

            const updateScheduleView = () => {
                if (!toggleText || !desktopSchedule || !mobileSchedule) return;
                const currentState = states[currentIndex];
                toggleText.textContent = currentState.label;

                if (currentState.id === 'summary') {
                    desktopSchedule.style.display = 'block';
                    mobileSchedule.classList.remove('mobile-schedule-single-day');
                    mobileSchedule.style.display = '';
                    dayContainers.forEach(container => container.style.display = '');
                } else {
                    desktopSchedule.style.display = 'none';
                    mobileSchedule.classList.add('mobile-schedule-single-day');
                    mobileSchedule.style.display = 'block';

                    dayContainers.forEach(container => {
                        if (container.getAttribute('data-day') === currentState.id) {
                            container.style.display = 'block';
                        } else {
                            container.style.display = 'none';
                        }
                    });
                }
            };

            if (toggleLeft && toggleRight) {
                toggleLeft.addEventListener('click', () => {
                    currentIndex = (currentIndex - 1 + states.length) % states.length;
                    updateScheduleView();
                });

                toggleRight.addEventListener('click', () => {
                    currentIndex = (currentIndex + 1) % states.length;
                    updateScheduleView();
                });
            }

            let lastSchedulePosition = null;

            document.body.addEventListener("click", function (e) {
                const returnLink = e.target.closest('.schedule-return-link');
                if (returnLink) {
                    e.preventDefault();
                    const talkId = returnLink.getAttribute('data-talk-id');
                    let targetCell = null;

                    if (currentIndex === 0) {
                        const desktopCell = desktopSchedule ? desktopSchedule.querySelector(`td[data-talk-id="${talkId}"]`) : null;
                        const mobileCell = mobileSchedule ? mobileSchedule.querySelector(`td[data-talk-id="${talkId}"]`) : null;
                        
                        if (desktopSchedule && window.getComputedStyle(desktopSchedule).display !== 'none' && desktopCell) {
                            const parentSessionCell = desktopCell.closest('.has-details');
                            if (parentSessionCell) {
                                targetCell = parentSessionCell; 
                            } else {
                                targetCell = desktopCell; 
                            }
                        } else if (mobileCell) {
                            targetCell = mobileCell;
                        }
                    } else {
                        const mobileCell = mobileSchedule ? mobileSchedule.querySelector(`td[data-talk-id="${talkId}"]`) : null;
                        if (mobileCell) {
                            const dayContainer = mobileCell.closest('.schedule-container');
                            const dayId = dayContainer.getAttribute('data-day');
                            
                            const newIndex = states.findIndex(s => s.id === dayId);
                            if (newIndex !== -1 && newIndex !== currentIndex) {
                                currentIndex = newIndex;
                                updateScheduleView();
                            }
                            targetCell = mobileCell;
                        }
                    }

                    if (targetCell) {
                        targetCell.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center'
                        });

                        document.querySelectorAll('.highlight-card').forEach(el => el.classList.remove('highlight-card'));
                        
                        void targetCell.offsetWidth;
                        
                        targetCell.classList.add("highlight-card");
                        
                        history.pushState(null, null, window.location.pathname + window.location.search);
                    }
                    return; 
                }

        
                const link = e.target.closest('a[href^="#"]');
                if (link) {
                    const href = link.getAttribute("href");
                    if (href === "#") return;

                    if (link.classList.contains("schedule-talk-link")) {
                        lastSchedulePosition = window.pageYOffset;
                    }

                    if (link.classList.contains("btn-back-schedule")) {
                        e.preventDefault();
                        
                        if (lastSchedulePosition !== null) {
                            window.scrollTo({
                                top: lastSchedulePosition,
                                behavior: "smooth"
                            });
                        } else {
                            
                            const navHeight = document.querySelector("nav") ? document.querySelector("nav").offsetHeight : 80;
                            const desktopSchedule = document.querySelector('.desktop-schedule');
                            const mobileSchedule = document.querySelector('.mobile-schedule');
                            
                            let targetTable = desktopSchedule;
                            if (window.getComputedStyle(desktopSchedule).display === 'none') {
                                targetTable = mobileSchedule;
                            }

                            if (targetTable) {
                                const elementPosition = targetTable.getBoundingClientRect().top + window.pageYOffset;
                                const offsetPosition = elementPosition - navHeight - 20;
                                window.scrollTo({ top: offsetPosition, behavior: "smooth" });
                            }
                        }
                        
                        history.pushState(null, null, window.location.pathname + window.location.search);
                        return;
                    }

                    const targetElement = document.querySelector(href);

                    if (targetElement) {
                        e.preventDefault();
                        
                        const navHeight = document.querySelector("nav") ? document.querySelector("nav").offsetHeight : 80;
                        const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                        const offsetPosition = elementPosition - navHeight - 20;

                        window.scrollTo({
                            top: offsetPosition,
                            behavior: "smooth"
                        });

                        if (href.startsWith("#talk-") || href.startsWith("#contrib-")) {
                            targetElement.classList.remove("highlight-card");
                            void targetElement.offsetWidth;
                            targetElement.classList.add("highlight-card");
                        }

                        history.pushState(null, null, href);
                    }
                }
            });
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
   const grid = document.querySelector('.mosaic-grid');
    if (!grid) return;

    const spacer = grid.querySelector('.mosaic-spacer');
    if (!spacer) return;

    let COLS, ROWS;
    let board = [];
    let hRow = 0, hCol = 0;
    let spacerInfoTimeout = null; 
    let singleColTimeout = null;  

    function updateDimensions() {
        const w = window.innerWidth;
        if (w >= 1200) { 
            COLS = 5; ROWS = 4; 
        } else if (w >= 768) { 
            COLS = 4; ROWS = 5; 
        } else { 
            COLS = 1; ROWS = 20; 
        }
    }

    function initBoard() {
        updateDimensions();
        const elements = Array.from(grid.querySelectorAll('.mosaic-item'));
        board = [];
        for (let r = 0; r < ROWS; r++) {
            board[r] = [];
            for (let c = 0; c < COLS; c++) {
                const el = elements[r * COLS + c];
                if (el) {
                    board[r][c] = el;
                    if (el === spacer) {
                        hRow = r; hCol = c;
                    }
                }
            }
        }

        if (COLS > 1) {
            updateSpacerRecursion();
        }
    }


    initBoard();


    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            initBoard();
        }, 250);
    });

    function showLargeOverlay(targetLargeItem) {
        document.querySelectorAll('.show-large-overlay').forEach(el => {
            el.classList.remove('show-large-overlay');
        });
        if (targetLargeItem) {
            targetLargeItem.classList.add('show-large-overlay');
        }
    }

    let miniHighlightTimeout = null;

    function updateSpacerRecursion() {

        if (spacerInfoTimeout) {
            clearTimeout(spacerInfoTimeout);
            spacerInfoTimeout = null;
        }

        let miniGridHTML = '<div class="mini-mosaic">';
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (board[r][c] === spacer) {
                    miniGridHTML += `
                        <div class="mini-item mini-logo" data-r="${r}" data-c="${c}">
                            <img src="images/NimVar_Logo.png" alt="NimVar Logo">
                        </div>`;
                } else {
                    const img = board[r][c] ? board[r][c].querySelector('img:not(.spacer-placeholder-img)') : null;
                    const src = img ? img.getAttribute('src') : '';
                    miniGridHTML += `
                        <div class="mini-item" data-r="${r}" data-c="${c}">
                            <img src="${src}" alt="">
                        </div>`;
                }
            }
        }
        miniGridHTML += '</div>';

        spacer.innerHTML = `
            <img src="images/empty.webp" alt="" class="spacer-placeholder-img">
            <div class="spacer-content" style="padding: 0;">
                ${miniGridHTML}
            </div>
        `;

        const miniItems = spacer.querySelectorAll('.mini-item');

        miniItems.forEach(mini => {
            if (mini.classList.contains('mini-logo')) return;
            const r = parseInt(mini.dataset.r, 10);
            const c = parseInt(mini.dataset.c, 10);
            const targetLargeItem = board[r][c];

            mini.addEventListener('click', (e) => {
                e.stopPropagation();
                if (targetLargeItem) {
                    showLargeOverlay(targetLargeItem);

                    const navHeight = document.querySelector("nav") ? document.querySelector("nav").offsetHeight : 70;
                    const rect = targetLargeItem.getBoundingClientRect();
                    
                    if (rect.top < navHeight + 20 || rect.bottom > window.innerHeight - 20) {
                        const targetY = rect.top + window.pageYOffset - navHeight - 30;
                        window.scrollTo({
                            top: targetY,
                            behavior: 'smooth'
                        });
                    }

                    if (miniHighlightTimeout) clearTimeout(miniHighlightTimeout);
                    miniHighlightTimeout = setTimeout(() => {
                        targetLargeItem.classList.remove('show-large-overlay');
                    }, 2500);
                }
            });
        });
    }

    function findPosition(element) {
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (board[r][c] === element) return { r, c };
            }
        }
        return null;
    }

    function slideHoleTo(targetR, targetC) {
        if (hRow === targetR && hCol === targetC) return;

        if (hRow !== targetR) {
            if (targetC > hCol) {
                for (let c = hCol; c < targetC; c++) board[hRow][c] = board[hRow][c + 1];
            } else if (targetC < hCol) {
                for (let c = hCol; c > targetC; c--) board[hRow][c] = board[hRow][c - 1];
            }
            board[hRow][targetC] = spacer;
            hCol = targetC;

            if (targetR > hRow) {
                for (let r = hRow; r < targetR; r++) board[r][targetC] = board[r + 1][targetC];
            } else if (targetR < hRow) {
                for (let r = hRow; r > targetR; r--) board[r][targetC] = board[r - 1][targetC];
            }
            board[targetR][targetC] = spacer;
            hRow = targetR;
        } else {
            if (targetC > hCol) {
                for (let c = hCol; c < targetC; c++) board[hRow][c] = board[hRow][c + 1];
            } else if (targetC < hCol) {
                for (let c = hCol; c > targetC; c--) board[hRow][c] = board[hRow][c - 1];
            }
            board[hRow][targetC] = spacer;
            hCol = targetC;
        }
    }

    function updateGrid() {
        const flatElements = board.flat();
        const firstRects = new Map();
        
        flatElements.forEach(el => { if (el) firstRects.set(el, el.getBoundingClientRect()); });
        flatElements.forEach(el => { if (el) grid.appendChild(el); });

        flatElements.forEach(el => {
            if (el) {
                el.style.transition = 'none';
                el.style.transform = '';
            }
        });

        const lastRects = new Map();
        flatElements.forEach(el => { if (el) lastRects.set(el, el.getBoundingClientRect()); });

        flatElements.forEach(el => {
            if (!el) return;
            const first = firstRects.get(el);
            const last = lastRects.get(el);
            if (!first || !last) return;

            const dx = first.left - last.left;
            const dy = first.top - last.top;

            if (dx !== 0 || dy !== 0) {
                el.style.transform = `translate(${dx}px, ${dy}px)`;
                el.getBoundingClientRect(); 

                requestAnimationFrame(() => {
                    el.style.transition = 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)';
                    el.style.transform = '';
                });
            }
        });
    }


    const speakerItems = Array.from(grid.querySelectorAll('.mosaic-item:not(.mosaic-spacer)'));

    speakerItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();


            document.querySelectorAll('.show-large-overlay').forEach(el => {
                el.classList.remove('show-large-overlay');
            });

            if (COLS === 1) {
                if (singleColTimeout) clearTimeout(singleColTimeout);


                showLargeOverlay(item);


                singleColTimeout = setTimeout(() => {
                    item.classList.remove('show-large-overlay');
                    if (document.activeElement) {
                        document.activeElement.blur();
                    }
                }, 2500);
                return;
            }

            const pos = findPosition(item);
            if (!pos) return;

            let targetR = pos.r;
            let targetC;

            if (hRow === pos.r) {
                targetC = (hCol < pos.c) ? pos.c - 1 : pos.c + 1;
            } else {
                targetC = (pos.c < COLS - 1) ? pos.c + 1 : pos.c - 1;
            }

            const name = item.querySelector('.speaker-name')?.textContent || '';
            const type = item.querySelector('.talk-type')?.textContent || '';

            spacer.innerHTML = `
                <img src="images/empty.webp" alt="" class="spacer-placeholder-img">
                <div class="spacer-content">
                    <div class="spacer-name">${name}</div>
                    <div class="spacer-type">${type}</div>
                </div>
            `;

            slideHoleTo(targetR, targetC);
            updateGrid();

          
            if (spacerInfoTimeout) clearTimeout(spacerInfoTimeout);
            spacerInfoTimeout = setTimeout(() => {
                updateSpacerRecursion();
            }, 2500); 
        });
    });

    document.addEventListener('click', (e) => {
        if (!grid.contains(e.target)) {
            document.querySelectorAll('.show-large-overlay').forEach(el => {
                el.classList.remove('show-large-overlay');
            });
            if (singleColTimeout) clearTimeout(singleColTimeout);
            if (spacerInfoTimeout) clearTimeout(spacerInfoTimeout);
            if (COLS > 1 && !spacer.querySelector('.mini-mosaic')) {
                updateSpacerRecursion();
            }
        }
    });

    spacer.addEventListener('click', (e) => {
        if (!spacer.querySelector('.mini-mosaic') && COLS > 1) {
            e.stopPropagation();
            if (spacerInfoTimeout) clearTimeout(spacerInfoTimeout);
            updateSpacerRecursion();
        }
    });


    document.addEventListener('click', (e) => {
        if (!grid.contains(e.target) && !spacer.querySelector('.mini-mosaic') && COLS > 1) {
            if (spacerInfoTimeout) clearTimeout(spacerInfoTimeout);
            updateSpacerRecursion();
        }
    });
});