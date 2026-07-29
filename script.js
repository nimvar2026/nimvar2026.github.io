document.addEventListener("DOMContentLoaded", function () {
    const SHOW_SPEAKER_NAMES_IN_SCHEDULE = false;

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
    }

    const talksData = [
        {
            id: "talk-tue-3",
            type: "invited",
            speaker: "Soeren Bartels",
            affiliation: "University of Freiburg",
            title: "TBA",
            abstract: "TBA"
        },
        {
            id: "talk-mon-2",
            type: "invited",
            speaker: "Giuseppe Cosma Brusca",
            affiliation: "SISSA, Trieste",
            title: "TBA",
            abstract: "TBA"
        },
        {
            id: "talk-mon-4",
            type: "invited",
            speaker: "Davide Carazzato",
            affiliation: "University of Vienna",
            title: "TBA",
            abstract: "TBA"
        },
        {
            id: "talk-tue-2",
            type: "invited",
            speaker: "Antonin Chambolle",
            affiliation: "CEREMADE Dauphine/PSL University",
            title: "TBA",
            abstract: "TBA"
        },
        {
            id: "talk-tue-1",
            type: "invited",
            speaker: "Lucia De Luca",
            affiliation: "CNR, Rome",
            title: "Periodic minimizers for nonlocal interaction energies",
            abstract: "We consider systems of particles on the real line interacting through negative Gagliardo seminorms. We prove that the 1-periodic configuration is the only minimizer of the energy and that the gradient flow converges exponentially fast to such a ground state. We consider also the case of Riesz type interactions. Joint works with M. Goldman, G. Pini, M. Ponsiglione, F. Santilli, E.N. Spadaro."
        },
        {
            id: "talk-mon-3",
            type: "invited",
            speaker: "Patrick Dondl",
            affiliation: "University of Freiburg",
            title: "TBA",
            abstract: "TBA"
        },
        {
            id: "talk-wed-1",
            type: "invited",
            speaker: "Serena Guarino Lo Bianco",
            affiliation: "University of Modena and Reggio Emilia",
            title: "TBA",
            abstract: "TBA"
        },
        {
            id: "talk-thu-3",
            type: "invited",
            speaker: "Dario Mazzoleni",
            affiliation: "University of Pavia",
            title: "TBA",
            abstract: "TBA"
        },
        {
            id: "talk-mon-1",
            type: "invited",
            speaker: "Maria Giovanna Mora",
            affiliation: "University of Pavia",
            title: "TBA",
            abstract: "TBA"
        },
        {
            id: "talk-tue-4",
            type: "invited",
            speaker: "Matteo Novaga",
            affiliation: "University of Pisa",
            title: "TBA",
            abstract: "TBA"
        },
        {
            id: "talk-wed-2",
            type: "invited",
            speaker: "Berardo Ruffini",
            affiliation: "University of Bologna",
            title: "TBA",
            abstract: "TBA"
        },
        {
            id: "talk-thu-1",
            type: "invited",
            speaker: "Giorgio Saracco",
            affiliation: "University of Ferrara",
            title: "TBA",
            abstract: "TBA"
        },
        {
            id: "talk-tue-5",
            type: "invited",
            speaker: "Roberta Schiattarella",
            affiliation: "University of Naples Federico II",
            title: "TBA",
            abstract: "TBA"
        },
        {
            id: "talk-thu-2",
            type: "invited",
            speaker: "Giorgio Stefani",
            affiliation: "University of Padua",
            title: "TBA",
            abstract: "TBA"
        },

        {
            id: "contrib-1",
            type: "contributed",
            speaker: "Francesc Alcover Borràs",
            affiliation: "Universitat de les Illes Balears",
            title: "A Nonlocal Total Variation prior for image processing: Variational and PDE perspectives",
            abstract: "In this talk, we present a weighted nonlocal total variation prior for image processing, extending the nonlocal total variation introduced by Kindermann et al. (2005). We first introduce the associated seminorm and the corresponding space of functions of nonlocal bounded variation from a functional-analytic prespective, establishing several structural results and properties relevant to optimization. We then study the prior within a nonlocal variant of the Chambolle–Lions model. Under suitable assumptions on the weight function and the fidelity operator, existence and uniqueness of minimizers are established. To compute solutions numerically, we develop primal–dual and TV-flow algorithms. Finally, we investigate the behavior of the proposed prior through a series of experiments. In particular, we analyze the asymptotic behavior of the nonlocal TV flow, characterize piecewise-affine functions as those which are least penalized by the prior, and compare its performance with other related image processing priors on representative image restoration tasks."
        },
        {
            id: "contrib-2",
            type: "contributed",
            speaker: "Enrico Micalizio",
            affiliation: "Politecnico di Torino",
            title: "Homogenization effects on non-local functionals",
            abstract: "Non-local functionals are a powerful tool to model long-range interactions. In this talk, we study the macroscopic behavior of a class of non-local functionals featuring a rapidly oscillating periodic weight. By means of homogenization and $\\Gamma$-convergence, we will reveal how the interplay between periodicity and non-locality forces the minimizing sequences to develop highly oscillating microstructures. As a natural consequence, we establish that the effective macroscopic functional fails to admit a standard double-integral representation."
        },
        {
            id: "contrib-3",
            type: "contributed",
            speaker: "Felix Seifert",
            affiliation: "KU Eichstätt-Ingolstadt",
            title: "A general compactness result for localization of nonlocal gradients",
            abstract: "Localization results provide a rigorous way to relate nonlocal models to their local counterparts. In the context of variational models, $\\Gamma$-convergence together with the necessary compactness results offers the natural framework for analyzing such limit processes. In this work, we discuss this approach for problems in which nonlocality arises through nonlocal gradients, as in models of nonlocal hyperelasticity. Whereas previous works often focused on kernels resulting from a specific construction, such as rescaling, or on special classes, like fractional kernels, we instead consider arbitrary sequences of radial kernels that satisfy suitable localization, monotonicity, and regularity conditions. This yields a more general approach that both encompasses various earlier results and extends them further, in particular by allowing for kernels with unbounded support and even non-integrable kernels. The main technical difficulty lies in the proof of compactness, which relies on establishing a nonlocal Poincaré inequality with uniform constants, as well as a uniform continuous embedding into a nonlocal Sobolev space given by a fractional reference kernel. To illustrate the scope of our results, we will show how different relevant examples fit into this setting. This is joint work with Carolin Kreisbeck (KU Eichstätt-Ingolstadt) and Carlos Mora-Corral (Universidad Auónoma de Madrid)."
        },
        {
            id: "contrib-4",
            type: "contributed",
            speaker: "Edoardo Voglino",
            affiliation: "SISSA",
            title: "Homogenization in one-dimensional higher-order non-local models of phase transitions",
            abstract: "We study the limit behavior of Cahn-Hilliard-type functionals in which the derivative is replaced by higher-order fractional derivatives and modulated by an oscillating factor. Depending on the ratio between the oscillation scale and the interface length, we identify three different regimes and prove $\\Gamma$-convergence in each regime to a suitable sharp-interface limit functional. In the extreme regimes, we prove a separation-of-scales effect that enables us to highlight the difference relative to the local models"
        }
    ];

    const invitedContainer = document.getElementById("invited-talks-list");
    const contributedContainer = document.getElementById("contributed-talks-list");

    if (invitedContainer && contributedContainer) {
        const talksMap = new Map();

        talksData.forEach((talk) => {
            talksMap.set(talk.id, talk);

            const card = document.createElement("article");
            card.className = "talk-card";
            card.id = talk.id;

            card.innerHTML = `
                <div class="talk-header">
                    <h3 class="talk-title">${talk.title}</h3>
                    <div class="talk-speaker">
                        <strong>${talk.speaker}</strong> <em>(${talk.affiliation})</em>
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

        const talkCells = document.querySelectorAll("[data-talk-id]");

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

        document.body.addEventListener("click", function (e) {
            const link = e.target.closest('a[href^="#"]');
            if (link) {
                const href = link.getAttribute("href");
                if (href === "#") return;

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
    const toggleLeft = document.getElementById('view-toggle-left');
    const toggleRight = document.getElementById('view-toggle-right');
    const toggleText = document.getElementById('view-toggle-text');
    const desktopSchedule = document.querySelector('.desktop-schedule');
    const mobileSchedule = document.querySelector('.mobile-schedule');
    const dayContainers = document.querySelectorAll('.mobile-schedule .schedule-container');

    if (toggleLeft && toggleRight && toggleText && desktopSchedule && mobileSchedule) {
        const states = [
            { id: 'summary', label: 'Schedule Summary (Sept 14 - 17, 2026)' },
            { id: 'monday', label: 'Monday, September 14' },
            { id: 'tuesday', label: 'Tuesday, September 15' },
            { id: 'wednesday', label: 'Wednesday, September 16' },
            { id: 'thursday', label: 'Thursday, September 17' }
        ];

        let currentIndex = 0;

        const updateScheduleView = () => {
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

        toggleLeft.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + states.length) % states.length;
            updateScheduleView();
        });

        toggleRight.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % states.length;
            updateScheduleView();
        });
    }
});