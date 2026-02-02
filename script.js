document.addEventListener('DOMContentLoaded', () => {
    
    /* --- LÓGICA DE FUNDO --- */
    const defaultBackground = 'img2.jpg';
    if (!localStorage.getItem('ldx_custom_bg') || localStorage.getItem('ldx_custom_bg') === '') {
        localStorage.setItem('ldx_custom_bg', defaultBackground);
        localStorage.setItem('ldx_bg_type', 'image');
    }
    const savedBg = localStorage.getItem('ldx_custom_bg');
    const savedType = localStorage.getItem('ldx_bg_type');
    const customBgLayer = document.getElementById('custom-bg-layer');

    if (savedBg) {
        if(savedType === 'image') {
            customBgLayer.style.backgroundImage = `url('${savedBg}')`;
        } else {
            document.body.style.backgroundImage = savedBg;
        }
        document.body.classList.add('has-custom-bg');
    }

    /* --- LÓGICA SAFE MODE (+18) --- */
    const safeModeBtn = document.getElementById('safeModeBtn');
    const body = document.body;
    
    // Inicializa: verifica se tem salvo, senão assume true (bloqueado)
    const savedSafeMode = localStorage.getItem('ldx_safe_mode');
    let isSafeMode = (savedSafeMode === 'true' || savedSafeMode === null);

    function updateSafeModeUI() {
        if (isSafeMode) {
            // Bloqueado: Adiciona classe ao body e coloca cadeado fechado
            body.classList.add('safe-mode-active');
            safeModeBtn.innerHTML = '<i class="fa-solid fa-lock"></i>';
            safeModeBtn.title = "Modo Seguro Ativo (Bloqueado)";
        } else {
            // Desbloqueado: Remove classe do body e coloca cadeado aberto
            body.classList.remove('safe-mode-active');
            safeModeBtn.innerHTML = '<i class="fa-solid fa-lock-open"></i>';
            safeModeBtn.title = "Modo Seguro Inativo (Liberado)";
        }
        
        // Re-executa o filtro para garantir que os elementos apareçam/desapareçam corretamente
        filterCards();
    }

    if (safeModeBtn) {
        safeModeBtn.addEventListener('click', () => {
            // Inverte o estado
            isSafeMode = !isSafeMode;
            // Salva
            localStorage.setItem('ldx_safe_mode', isSafeMode);
            
            // Se estiver bloqueando e a categoria BL estiver ativa, reseta para "Todos"
            if (isSafeMode) {
                const activeCat = document.querySelector('#catDropdown .dropdown-option.selected')?.dataset.catFilter;
                if (activeCat === 'bl') {
                    document.querySelector('[data-cat-filter="all"]').click();
                }
            }
            
            // Atualiza UI
            updateSafeModeUI();
        });
    }

    /* --- SISTEMA DE PESQUISA --- */
    const engines = {
        google: { name: 'Google', url: 'https://www.google.com/search?q=', icon: 'fa-brands fa-google icon-google' },
        bing: { name: 'Bing', url: 'https://www.bing.com/search?q=', icon: 'fa-brands fa-microsoft icon-bing' },
        duckduckgo: { name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=', icon: 'fa-solid fa-shield-cat icon-ddg' },
        youtube: { name: 'YouTube', url: 'https://www.youtube.com/results?search_query=', icon: 'fa-brands fa-youtube icon-youtube' },
        spotify: { name: 'Spotify', url: 'https://open.spotify.com/search/', icon: 'fa-brands fa-spotify icon-spotify' },
        reddit: { name: 'Reddit', url: 'https://www.reddit.com/search/?q=', icon: 'fa-brands fa-reddit icon-reddit' },
        amazon: { name: 'Amazon', url: 'https://www.amazon.com/s?k=', icon: 'fa-brands fa-amazon icon-amazon' },
        wikipedia: { name: 'Wikipedia', url: 'https://pt.wikipedia.org/wiki/Special:Search?search=', icon: 'fa-brands fa-wikipedia-w icon-wiki' }
    };

    let currentEngine = 'google';
    const engineBtn = document.getElementById('engineBtn');
    const engineDropdown = document.getElementById('engineDropdown');
    const engineIcon = document.getElementById('currentEngineIcon');
    const engineName = document.getElementById('currentEngineName');
    const searchInput = document.getElementById('searchInput');
    const searchForm = document.getElementById('searchForm');
    const searchHistory = document.getElementById('searchHistory');
    const historyList = document.getElementById('historyList');
    const cards = document.querySelectorAll('.card');
    const headers = document.querySelectorAll('.section-header');

    function filterCards() {
        if(!cards.length) return;
        
        const searchTerm = searchInput.value.toLowerCase();
        const activeCategory = document.querySelector('#catDropdown .dropdown-option.selected')?.dataset.catFilter || 'all';

        // Primeiro esconde tudo
        cards.forEach(card => card.style.display = 'none');
        headers.forEach(header => header.style.display = 'none');

        const visibleCategories = new Set();

        cards.forEach(card => {
            const title = card.querySelector('h3').innerText.toLowerCase();
            const category = card.dataset.cat;

            // Se o Safe Mode está ativo e o card é BL, ignora
            if (isSafeMode && category === 'bl') return;

            const matchesCategory = activeCategory === 'all' || category === activeCategory;
            const matchesSearch = title.includes(searchTerm);

            if (matchesCategory && matchesSearch) {
                card.style.display = 'flex';
                visibleCategories.add(category);
            }
        });

        // Mostra os cabeçalhos apenas se houver cards visíveis
        if (visibleCategories.size > 0) {
            headers.forEach(header => {
                if (header.classList.contains('header-streaming') && visibleCategories.has('streaming')) header.style.display = 'flex';
                if (header.classList.contains('header-anime') && visibleCategories.has('anime')) header.style.display = 'flex';
                if (header.classList.contains('header-manga') && visibleCategories.has('manga')) header.style.display = 'flex';
                if (header.classList.contains('header-manhwa') && visibleCategories.has('manhwa')) header.style.display = 'flex';
                if (header.classList.contains('header-game') && visibleCategories.has('games')) header.style.display = 'flex';
                if (header.classList.contains('header-design') && visibleCategories.has('design')) header.style.display = 'flex';
                if (header.classList.contains('header-wallpaper') && visibleCategories.has('wallpaper')) header.style.display = 'flex';
                if (header.classList.contains('header-host') && visibleCategories.has('hosting')) header.style.display = 'flex';
                if (header.classList.contains('header-utils') && visibleCategories.has('studies')) header.style.display = 'flex';
                
                // BL Header: Só mostra se NÃO estiver no safe mode
                if (!isSafeMode && header.classList.contains('header-bl') && visibleCategories.has('bl')) header.style.display = 'flex';
            });
        }
    }

    /* --- CONTROLE DE CATEGORIAS --- */
    const catBtn = document.getElementById('catBtn');
    const catDropdown = document.getElementById('catDropdown');
    const catOptions = document.querySelectorAll('#catDropdown .dropdown-option');

    if (catBtn) {
        catBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            catDropdown.classList.toggle('active');
        });
    }

    catOptions.forEach(opt => {
        opt.addEventListener('click', () => {
            // Não permite clicar em BL se estiver bloqueado
            if(opt.dataset.catFilter === 'bl' && isSafeMode) return;

            catOptions.forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
            filterCards();
            catDropdown.classList.remove('active');
        });
    });

    searchInput.addEventListener('input', filterCards);
    // Executa filtro inicial para carregar estado correto
    updateSafeModeUI(); 

    /* --- CONTROLE DE MOTOR DE BUSCA --- */
    if (engineBtn) {
        engineBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            engineDropdown.classList.toggle('active');
        });

        document.querySelectorAll('.engine-option').forEach(option => {
            option.addEventListener('click', () => {
                const engineKey = option.getAttribute('data-engine');
                const data = engines[engineKey];
                currentEngine = engineKey;
                engineIcon.className = data.icon;
                engineName.textContent = data.name;
                document.querySelectorAll('.engine-option').forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                engineDropdown.classList.remove('active');
                searchInput.focus();
            });
        });
    }

    /* --- HISTÓRICO DE PESQUISA --- */
    const storageKey = 'nexusHub_history_v2';
    let searches = JSON.parse(localStorage.getItem(storageKey)) || [];

    function renderHistory() {
        historyList.innerHTML = '';
        if (searches.length === 0) {
            searchHistory.style.display = 'none';
            return;
        }
        searches.slice(0,5).reverse().forEach(term => {
            const div = document.createElement('div');
            div.className = 'history-item';
            div.innerHTML = `<i class="fa-solid fa-clock-rotate-left"></i> ${term}`;
            div.addEventListener('click', () => {
                searchInput.value = term;
                filterCards();
                searchHistory.classList.remove('active');
            });
            historyList.appendChild(div);
        });
    }

    function saveToHistory(term) {
        if (!term || term.trim() === '') return;
        term = term.trim();
        searches = searches.filter(s => s.toLowerCase() !== term.toLowerCase());
        searches.push(term);
        if (searches.length > 10) searches.shift(); 
        localStorage.setItem(storageKey, JSON.stringify(searches));
        renderHistory();
    }

    searchInput.addEventListener('focus', () => {
        renderHistory();
        if (searches.length > 0) searchHistory.classList.add('active');
    });

    function performSearch(query) {
        if (query) {
            const url = engines[currentEngine].url + encodeURIComponent(query);
            saveToHistory(query);
            window.open(url, '_blank');
        }
    }

    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        performSearch(searchInput.value);
    });

    const voiceBtn = document.getElementById('voiceBtn');
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'pt-BR';
        recognition.continuous = false;
        recognition.interimResults = false;
        voiceBtn.addEventListener('click', () => {
            recognition.start();
            voiceBtn.classList.add('listening');
        });
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            searchInput.value = transcript;
            filterCards();
            voiceBtn.classList.remove('listening');
        };
        recognition.onerror = () => { voiceBtn.classList.remove('listening'); };
        recognition.onend = () => { voiceBtn.classList.remove('listening'); };
    } else {
        if(voiceBtn) voiceBtn.style.display = 'none'; 
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === '/' && document.activeElement !== searchInput) {
            e.preventDefault();
            searchInput.focus();
        }
    });

    /* --- CONTROLE DE GRID --- */
    const gridBtn = document.getElementById('gridBtn');
    const gridDropdown = document.getElementById('gridDropdown');
    const gridOptions = document.querySelectorAll('#gridDropdown .dropdown-option');
    const bentoGrid = document.getElementById('bentoGrid');

    if (gridBtn) {
        gridBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            gridDropdown.classList.toggle('active');
        });
    }

    gridOptions.forEach(option => {
        option.addEventListener('click', () => {
            const cols = option.getAttribute('data-cols');
            applyGrid(cols);
            gridOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            gridDropdown.classList.remove('active');
        });
    });

    function applyGrid(cols) {
        bentoGrid.classList.remove('cols-2', 'cols-3', 'cols-5');
        if (cols === 'auto') {
            bentoGrid.style.gridTemplateColumns = '';
            saveGridPreference('auto');
        } else {
            bentoGrid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
            if(cols != 'auto') bentoGrid.classList.add(`cols-${cols}`);
            saveGridPreference(cols);
        }
    }

    function saveGridPreference(value) {
        if (window.innerWidth <= 600) {
            localStorage.setItem('nexusHub_mobileCols', value);
        } else {
            localStorage.setItem('nexusHub_desktopCols', value);
        }
    }

    function loadSavedGrid() {
        let savedCols;
        let key;
        if (window.innerWidth <= 600) {
            key = 'nexusHub_mobileCols';
            savedCols = localStorage.getItem(key);
            if(!savedCols) savedCols = '2';
        } else {
            key = 'nexusHub_desktopCols';
            savedCols = localStorage.getItem(key);
            if(!savedCols) savedCols = 'auto';
        }
        const optToSelect = document.querySelector(`#gridDropdown .dropdown-option[data-cols="${savedCols}"]`);
        if(optToSelect) optToSelect.classList.add('selected');
        applyGrid(savedCols);
    }
    loadSavedGrid();

    let lastWidth = window.innerWidth;
    window.addEventListener('resize', () => {
        if (window.innerWidth !== lastWidth) {
            lastWidth = window.innerWidth;
            loadSavedGrid();
        }
    });

    document.addEventListener('click', (e) => {
        if (engineBtn && !engineBtn.contains(e.target)) engineDropdown.classList.remove('active');
        if (!searchInput.contains(e.target) && !searchHistory.contains(e.target)) searchHistory.classList.remove('active');
        if (catBtn && !catBtn.contains(e.target) && !catDropdown.contains(e.target)) catDropdown.classList.remove('active');
        if (gridBtn && !gridBtn.contains(e.target) && !gridDropdown.contains(e.target)) gridDropdown.classList.remove('active');
    });

    /* --- TILT 3D --- */
    const cardElements = document.querySelectorAll('.card');
    cardElements.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            if(window.innerWidth >768) {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -8;
                const rotateY = ((x - centerX) / centerX) * 8;
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
            }
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        });
    });

    /* --- EFEITO RIPPLE --- */
    cardElements.forEach(card => {
        card.addEventListener('click', function(e) {
            if(e.button === 0) {
                e.preventDefault(); 
                const ripple = document.createElement('span');
                ripple.classList.add('ripple');
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const size = Math.max(rect.width, rect.height);
                ripple.style.width = ripple.style.height = `${size}px`;
                ripple.style.left = `${x - size / 2}px`;
                ripple.style.top = `${y - size / 2}px`;
                card.appendChild(ripple);
                setTimeout(() => { ripple.remove(); }, 600);

                const href = this.getAttribute('href');
                const target = this.getAttribute('target');
                setTimeout(() => {
                    if (href) {
                        if (target === '_blank') {
                            window.open(href, '_blank');
                        } else {
                            window.location.href = href;
                        }
                    }
                }, 300);
            }
        });
    });
});
