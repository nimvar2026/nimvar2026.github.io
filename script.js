document.addEventListener("DOMContentLoaded", function () {
    const SHOW_SPEAKER_NAMES_IN_SCHEDULE = false;
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
                modal.style.display = "flex";
                modalImg.src = this.src;
            });
        });

        modal.addEventListener("click", function () {
            modal.style.display = "none";
        });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape" || event.key === "Esc") {
                modal.style.display = "none";
            }
        });
    }

    fetch("talks.json")
        .then(response => {
            if (!response.ok) {
                throw new Error("Errore nel caricamento del file JSON");
            }
            return response.json();
        })
        .then(talksData => {
            initScheduleAndAbstracts(talksData);
        })
        .catch(error => {
            console.error("Errore Fetch:", error);
        });

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
                        <p>${talk.abstract}</p>
                    </div>
                    <div class="talk-footer">
                        <a href="#schedule-overview" class="btn-back-schedule">↑ Back to Schedule</a>
                    </div>
                `;

                if (talk.type === "invited") {
                    invitedContainer.appendChild(card);
                } else {
                    contributedContainer.appendChild(card);
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
