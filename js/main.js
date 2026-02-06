 // ==================== Configuration ====================
        const API = {
            LATEST: 'https://phim.nguonc.com/api/films/phim-moi-cap-nhat',
            CATEGORY: 'https://phim.nguonc.com/api/films/danh-sach/',
            DETAIL: 'https://phim.nguonc.com/api/film/',
            SEARCH: 'https://phim.nguonc.com/api/films/search?keyword=',
            GENRE: 'https://phim.nguonc.com/api/films/the-loai/',
            COUNTRY: 'https://phim.nguonc.com/api/films/quoc-gia/',
            YEAR: 'https://phim.nguonc.com/api/films/nam-phat-hanh/'
        };
   
        // ==================== State Management ====================
        const state = {
            currentPage: 1,
            currentTab: 'home',
            currentSlug: '',
            isLoading: false,
            hasMore: true,
            cache: new Map(),
            searchTimeout: null,
            isSearchMode: false,
            currentSearchQuery: '',
            filterType: null, // 'genre', 'country', 'year', or null
            filterSlug: '',
            genreFilter: '',
            countryFilter: '',
            yearFilter: '',
            sort: '',
            currentMovieSlug: '',
            currentEpisode: 0,
            favorites: JSON.parse(localStorage.getItem('favorites') || '[]'),
            history: JSON.parse(localStorage.getItem('history') || '[]'),
            continueWatching: JSON.parse(localStorage.getItem('continueWatching') || '[]'),
            ratings: JSON.parse(localStorage.getItem('ratings') || '{}'),
            comments: JSON.parse(localStorage.getItem('comments') || '{}')
        };
   
        // ==================== Utility Functions ====================
        const debounce = (func, wait) => {
            let timeout;
            return (...args) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => func(...args), wait);
            };
        };
   
        const fetchWithCache = async (url) => {
            // Don't cache paginated requests to ensure fresh data
            if (url.includes('?page=') && url.includes('page=') && !url.includes('page=1')) {
                console.log('⚡ Fetching fresh data (no cache):', url);
                const response = await fetch(url);
                if (!response.ok) throw new Error('Network error');
                return await response.json();
            }
       
            if (state.cache.has(url)) {
                console.log('📦 Using cached data:', url);
                return state.cache.get(url);
            }
       
            console.log('🌐 Fetching new data:', url);
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network error');
       
            const data = await response.json();
            state.cache.set(url, data);
       
            // Limit cache size
            if (state.cache.size > 50) {
                const firstKey = state.cache.keys().next().value;
                state.cache.delete(firstKey);
            }
       
            return data;
        };
   
        // ==================== Intersection Observer ====================
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        imageObserver.unobserve(img);
                    }
                }
            });
        }, {
            rootMargin: '100px',
            threshold: 0.01
        });
   
        // ==================== Hero Slider ====================
        let heroInterval;
        let currentSlide = 0;
   
        const heroData = [
            {
                slug: 'thay-giao-dia-nguc-nube',
                title: 'Thầy Giáo Địa Ngục Nube',
                desc: 'Một số hiện tượng không thể giải thích được đã gây khó chịu cho thị trấn Domori. Để bảo vệ trẻ em của thị trấn, một giáo viên homeroom mới được biết đến với tên là Nube.',
                image: 'https://phim.nguonc.com/public/images/Post/1/jigoku-sensei-nube-2025.jpg'
            },
            {
                slug: 'trung-quoc-ky-dam-phan-2',
                title: 'Trung Quốc Kỳ Đàm (Phần 2)',
                desc: 'Tuyển tập phim hoạt hình ngắn gồm 9 phim ngắn với phong cách đa dạng, mang đến những câu chuyện kỳ bí đầy hấp dẫn.',
                image: 'https://phim.nguonc.com/public/images/Post/1/trung-quoc-ky-dam-phan-2.jpg'
            },
            {
                slug: 'thu-hut-manh-liet',
                title: 'Thu Hút Mãnh Liệt',
                desc: 'Năm năm trước, Ngô Nùng Vũ theo anh trai đến hiện trường một vụ án mạng. Một câu chuyện ly kỳ đầy căng thẳng.',
                image: 'https://phim.nguonc.com/public/images/Post/8/thu-hut-manh-liet.jpg'
            }
        ];
   
        function initHero() {
            const slider = document.getElementById('heroSlider');
            const indicators = document.getElementById('heroIndicators');
       
            heroData.forEach((item, index) => {
                // Create slide
                const slide = document.createElement('div');
                slide.className = `hero-slide ${index === 0 ? 'active' : ''}`;
                slide.innerHTML = `<img src="${item.image}" alt="${item.title}" loading="${index === 0 ? 'eager' : 'lazy'}">`;
                slider.appendChild(slide);
           
                // Create indicator
                const indicator = document.createElement('div');
                indicator.className = `indicator ${index === 0 ? 'active' : ''}`;
                indicator.onclick = () => goToSlide(index);
                indicators.appendChild(indicator);
            });
       
            updateHeroContent();
            startHeroAutoplay();
        }
   
        function updateHeroContent() {
            const current = heroData[currentSlide];
            document.getElementById('heroTitle').textContent = current.title;
            document.getElementById('heroDesc').textContent = current.desc;
            document.getElementById('heroPlayBtn').onclick = () => openPlayer(current.slug);
        }
   
        function goToSlide(index) {
            currentSlide = index;
       
            const slides = document.querySelectorAll('.hero-slide');
            const indicators = document.querySelectorAll('.indicator');
       
            slides.forEach((slide, i) => {
                slide.classList.toggle('active', i === index);
            });
       
            indicators.forEach((ind, i) => {
                ind.classList.toggle('active', i === index);
            });
       
            updateHeroContent();
            resetHeroAutoplay();
        }
   
        function nextSlide() {
            goToSlide((currentSlide + 1) % heroData.length);
        }
   
        function startHeroAutoplay() {
            heroInterval = setInterval(nextSlide, 8000);
        }
   
        function resetHeroAutoplay() {
            clearInterval(heroInterval);
            startHeroAutoplay();
        }
   
        // ==================== Movies Loading ====================
        async function loadMovies(append = false) {
            if (state.isLoading || (!state.hasMore && append)) return;
       
            state.isLoading = true;
            const grid = document.getElementById('moviesGrid');
            const loadMoreBtn = document.getElementById('loadMoreBtnContainer');
       
            if (!append) {
                grid.innerHTML = createSkeletons(12);
                state.currentPage = 1;
                state.hasMore = true;
                loadMoreBtn.style.display = 'none';
            } else {
                document.getElementById('loadMore').style.display = 'block';
            }
          
            try {
                let url;
              
                // Determine which API to call based on current state
                if (state.isSearchMode && state.currentSearchQuery) {
                    url = `${API.SEARCH}${encodeURIComponent(state.currentSearchQuery)}&page=${state.currentPage}`;
                } else if (state.filterType === 'genre') {
                    url = `${API.GENRE}${state.filterSlug}?page=${state.currentPage}`;
                } else if (state.filterType === 'country') {
                    url = `${API.COUNTRY}${state.filterSlug}?page=${state.currentPage}`;
                } else if (state.filterType === 'year') {
                    url = `${API.YEAR}${state.filterSlug}?page=${state.currentPage}`;
                } else if (state.currentTab === 'home') {
                    url = `${API.LATEST}?page=${state.currentPage}`;
                } else {
                    url = `${API.CATEGORY}${state.currentSlug}?page=${state.currentPage}`;
                }
                // Add sort if applicable (assume API supports ?sort=newest or views)
                if (state.sort) {
                    url += `&sort=${state.sort}`;
                }
              
                const data = await fetchWithCache(url);
              
                console.log('API Response:', {
                    url,
                    page: state.currentPage,
                    itemsCount: data.items?.length,
                    hasMoreData: data.pagination || data.paginate || data.params
                });
              
                if (!append) grid.innerHTML = '';
              
                if (data.items && data.items.length > 0) {
                    renderMovies(data.items);
                  
                    // Get pagination info (handle both 'pagination' and 'paginate')
                    const pagination = data.pagination || data.paginate || (data.params ? data.params.pagination || data.params.paginate : null);
                  
                    let totalPages, currentPg;
                    if (pagination) {
                        totalPages = pagination.total_page || pagination.totalPages;
                        currentPg = pagination.current_page || pagination.currentPage || state.currentPage;
                    }
                  
                    if (totalPages) {
                        state.hasMore = currentPg < totalPages;
                        console.log('Pagination:', { currentPg, totalPages, hasMore: state.hasMore });
                    } else {
                        // Fallback: assume more if we got full page of items (API returns 10 per page)
                        state.hasMore = data.items.length >= 10;
                        console.log('No pagination info, using item count:', data.items.length);
                    }
                  
                    // Show load more button if there are more items
                    if (state.hasMore) {
                        loadMoreBtn.style.display = 'block';
                    } else {
                        loadMoreBtn.style.display = 'none';
                    }
                  
                    console.log('State after load:', {
                        currentPage: state.currentPage,
                        hasMore: state.hasMore,
                        isLoading: state.isLoading
                    });
                } else {
                    state.hasMore = false;
                    loadMoreBtn.style.display = 'none';
                    if (!append) {
                        grid.innerHTML = `
                            <div style="grid-column: 1/-1; text-align: center; padding: 4rem 0; color: var(--gray);">
                                <i class="fas fa-film" style="font-size: 4rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                                <p style="font-size: 1.2rem;">Không tìm thấy phim</p>
                            </div>
                        `;
                    }
                }
            } catch (error) {
                console.error('Load error:', error);
                loadMoreBtn.style.display = 'none';
                if (!append) {
                    grid.innerHTML = `
                        <div style="grid-column: 1/-1; text-align: center; padding: 4rem 0; color: var(--gray);">
                            <i class="fas fa-exclamation-circle" style="font-size: 4rem; margin-bottom: 1rem; color: #ff6b6b;"></i>
                            <p style="font-size: 1.2rem;">Lỗi tải phim. Vui lòng thử lại.</p>
                        </div>
                    `;
                }
            } finally {
                state.isLoading = false;
                document.getElementById('loadMore').style.display = 'none';
            }
        }
      
        // Load More Button Handler
        function loadMoreMovies() {
            if (state.hasMore && !state.isLoading) {
                state.currentPage++;
                loadMovies(true);
            }
        }
      
        function createSkeletons(count) {
            return Array(count).fill('<div class="skeleton"></div>').join('');
        }
      
        function renderMovies(movies) {
            const grid = document.getElementById('moviesGrid');
          
            movies.forEach(movie => {
                const card = document.createElement('div');
                card.className = 'movie-card';
                card.onclick = () => openPlayer(movie.slug);
                card.dataset.slug = movie.slug;
              
                const isFavorited = state.favorites.includes(movie.slug);
                card.innerHTML = `
                    <i class="fas fa-heart favorite-btn ${isFavorited ? 'favorited' : ''}" onclick="toggleFavorite('${movie.slug}', event)"></i>
                    <img
                        data-src="${movie.thumb_url}"
                        alt="${movie.name}"
                        class="movie-poster"
                        loading="lazy"
                        onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%42450%22%3E%3Crect fill=%22%231a1a1a%22 width=%22300%22 height=%42450%22/%3E%3Ctext fill=%22%23666%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22%3ENo Image%3C/text%3E%3C/svg%3E'"
                    >
                    <div class="movie-quality">${movie.language || 'HD'}</div>
                    <div class="movie-info">
                        <h3 class="movie-title">${movie.name}</h3>
                        <div class="movie-meta">
                            <span><i class="fas fa-calendar"></i> ${movie.year || '2024'}</span>
                            <span><i class="fas fa-tag"></i> ${movie.category?.['1']?.list?.[0]?.name || 'Phim'}</span>
                        </div>
                    </div>
                    <div class="play-overlay">
                        <div class="play-btn">
                            <i class="fas fa-play"></i>
                        </div>
                    </div>
                `;
              
                grid.appendChild(card);
              
                const img = card.querySelector('img');
                imageObserver.observe(img);
            });
        }
      
        // ==================== Player Functions ====================
        async function openPlayer(slug) {
            const modal = document.getElementById('playerModal');
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
          
            const playerMain = document.getElementById('playerMain');
            playerMain.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--gray);">
                    <i class="fas fa-spinner fa-spin" style="font-size: 3rem;"></i>
                </div>
            `;
          
            state.currentMovieSlug = slug;
            addToHistory(slug);
          
            try {
                const data = await fetchWithCache(`${API.DETAIL}${slug}`);
                const movie = data.movie;
              
                document.getElementById('playerTitle').textContent = movie.name;
              
                const descEl = document.getElementById('playerDesc');
                descEl.innerHTML = movie.description || 'Không có mô tả';
              
                const expandBtn = document.getElementById('expandDesc');
                if (descEl.scrollHeight > descEl.clientHeight + 20) {
                    expandBtn.style.display = 'block';
                } else {
                    expandBtn.style.display = 'none';
                }
              
                const episodesGrid = document.getElementById('episodesGrid');
                episodesGrid.innerHTML = '';
              
                let episodes = [];
                if (movie.episodes && movie.episodes.length > 0) {
                    movie.episodes.forEach(server => {
                        if (server.items && Array.isArray(server.items)) {
                            episodes.push(...server.items);
                        }
                    });
                }
              
                if (episodes.length === 0) {
                    episodesGrid.innerHTML = `
                        <p style="grid-column: 1/-1; text-align: center; color: var(--gray); padding: 2rem;">
                            Chưa có tập phim
                        </p>
                    `;
                    return;
                }
              
                const isSingleEpisode = episodes.length === 1;
              
                episodes.forEach((ep, index) => {
                    const btn = document.createElement('button');
                    btn.className = 'episode-btn';
                    btn.textContent = isSingleEpisode ? 'Full' : `Tập ${index + 1}`;
                    btn.onclick = () => {
                        document.querySelectorAll('.episode-btn').forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                        playerMain.innerHTML = `<iframe src="${ep.embed}" allowfullscreen allow="autoplay; fullscreen"></iframe>`;
                        state.currentEpisode = index;
                        if (!isSingleEpisode) {
                            monitorVideoEnd();
                        }
                    };
                    episodesGrid.appendChild(btn);
                });
              
                episodesGrid.firstChild?.click();
              
                // Load rating
                loadRating(slug);
                // Load comments
                loadComments(slug);
              
            } catch (error) {
                console.error('Player error:', error);
                playerMain.innerHTML = `
                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--gray);">
                        <i class="fas fa-exclamation-circle" style="font-size: 3rem; margin-bottom: 1rem; color: #ff6b6b;"></i>
                        <p>Lỗi tải phim</p>
                    </div>
                `;
            }
        }
      
        function closePlayer() {
            document.getElementById('playerModal').classList.remove('active');
            document.getElementById('playerMain').innerHTML = '';
            document.body.style.overflow = '';
            saveContinueWatching(state.currentMovieSlug, state.currentEpisode);
        }
      
        function toggleDesc() {
            const desc = document.getElementById('playerDesc');
            const btn = document.getElementById('expandDesc');
            desc.classList.toggle('expanded');
            btn.textContent = desc.classList.contains('expanded') ? 'Thu gọn' : 'Xem thêm';
        }
      
        function monitorVideoEnd() {
            const iframe = document.querySelector('#playerMain iframe');
            if (iframe) {
                // Assume we can postMessage to iframe if same domain, but since external, this may not work. Alternative: user manual switch
                // For now, assume manual
            }
        }
      
        function nextEpisode() {
            const buttons = document.querySelectorAll('.episode-btn');
            if (state.currentEpisode < buttons.length - 1) {
                buttons[state.currentEpisode + 1].click();
            }
        }
      
        // ==================== Tab Switching ====================
        function switchTab(tab, event) {
            event?.preventDefault();
          
            state.currentTab = tab;
            state.currentPage = 1;
            state.hasMore = true;
            state.isSearchMode = false;
            state.currentSearchQuery = '';
            state.filterType = null;
            state.filterSlug = '';
            if (tab === 'phim-phu-tho') {
                const key = prompt('Nhập list key có sẵn để truy cập Phim Phú Thọ:');
                const validKeys = ['18'];
                if (!validKeys.includes(key)) {
                    alert('Key không đúng! Không thể truy cập.');
                    switchTab('home');
                    return;
                }
                state.filterSlug = key; // Use the key as filter slug
                if (['2025', '2024', '2023', '2022', '2021', '2020'].includes(key)) {
                    state.filterType = 'year';
                } else if (['han-quoc', 'trung-quoc', 'nhat-ban', 'au-my', 'thai-lan', 'viet-nam'].includes(key)) {
                    state.filterType = 'country';
                } else {
                    state.filterType = 'genre';
                }
            }
          
            // Clear search input
            document.getElementById('searchInput').value = '';
            document.getElementById('searchClear').classList.remove('visible');
          
            // Close all dropdowns
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                menu.classList.remove('active');
            });
          
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });
          
            event?.target.closest('.nav-link')?.classList.add('active');
          
            const titles = {
                'home': 'Phim Mới Cập Nhật',
                'phim-bo': 'Phim Bộ',
                'phim-le': 'Phim Lẻ',
                'phim-dang-chieu': 'Phim Đang Chiếu',
                'phim-phu-tho': 'Phim Phú Thọ'
            };
          
            document.getElementById('sectionTitle').textContent = titles[tab] || titles.home;
          
            if (tab === 'home') {
                state.currentSlug = '';
            } else {
                state.currentSlug = tab;
            }
          
            loadMovies(false);
          
            // Close mobile menu
            document.getElementById('navMenu').classList.remove('mobile-active');
        }
      
        // ==================== Filter Functions ====================
        function toggleDropdown(menuId, event) {
            event?.preventDefault();
          
            const menu = document.getElementById(menuId);
            const allMenus = document.querySelectorAll('.dropdown-menu');
          
            // Close all other menus
            allMenus.forEach(m => {
                if (m.id !== menuId) m.classList.remove('active');
            });
          
            // Toggle current menu
            menu.classList.toggle('active');
        }
      
        function filterByGenre(slug, name, event) {
            event?.preventDefault();
          
            state.filterType = 'genre';
            state.filterSlug = slug;
            state.currentPage = 1;
            state.hasMore = true;
            state.isSearchMode = false;
            state.currentTab = 'filter';
          
            // Update UI
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });
            document.getElementById('sectionTitle').textContent = `Thể Loại: ${name}`;
          
            // Close dropdown
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                menu.classList.remove('active');
            });
          
            loadMovies(false);
        }
      
        function filterByCountry(slug, name, event) {
            event?.preventDefault();
          
            state.filterType = 'country';
            state.filterSlug = slug;
            state.currentPage = 1;
            state.hasMore = true;
            state.isSearchMode = false;
            state.currentTab = 'filter';
          
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });
            document.getElementById('sectionTitle').textContent = `Quốc Gia: ${name}`;
          
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                menu.classList.remove('active');
            });
          
            loadMovies(false);
        }
      
        function filterByYear(slug, name, event) {
            event?.preventDefault();
          
            state.filterType = 'year';
            state.filterSlug = slug;
            state.currentPage = 1;
            state.hasMore = true;
            state.isSearchMode = false;
            state.currentTab = 'filter';
          
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });
            document.getElementById('sectionTitle').textContent = `Năm: ${name}`;
          
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                menu.classList.remove('active');
            });
          
            loadMovies(false);
        }
      
        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-menu')) {
                document.querySelectorAll('.dropdown-menu').forEach(menu => {
                    menu.classList.remove('active');
                });
            }
        });
      
        // ==================== Search Handling ====================
        const handleSearch = debounce(async (query) => {
            const searchClear = document.getElementById('searchClear');
          
            if (!query.trim()) {
                searchClear.classList.remove('visible');
                state.isSearchMode = false;
                state.currentSearchQuery = '';
                switchTab('home');
                return;
            }
          
            searchClear.classList.add('visible');
          
            // Enable search mode
            state.isSearchMode = true;
            state.currentSearchQuery = query;
            state.currentPage = 1;
            state.hasMore = true; // Enable pagination for search
          
            const grid = document.getElementById('moviesGrid');
            grid.innerHTML = createSkeletons(8);
            document.getElementById('sectionTitle').textContent = `Kết quả: "${query}"`;
          
            // Deactivate all nav tabs
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });
          
            loadMovies(false);
          
            // Show suggestions
            showSuggestions(query);
        }, 600);
      
        async function showSuggestions(query) {
            const suggestions = document.getElementById('suggestions');
            suggestions.innerHTML = '';
            if (query.length < 3) {
                suggestions.style.display = 'none';
                return;
            }
          
            try {
                const data = await fetchWithCache(`${API.SEARCH}${encodeURIComponent(query)}&page=1`);
                if (data.items && data.items.length > 0) {
                    data.items.slice(0, 5).forEach(item => {
                        const div = document.createElement('div');
                        div.className = 'suggestion-item';
                        div.textContent = item.name;
                        div.onclick = () => {
                            document.getElementById('searchInput').value = item.name;
                            handleSearch(item.name);
                            suggestions.style.display = 'none';
                        };
                        suggestions.appendChild(div);
                    });
                    suggestions.style.display = 'block';
                } else {
                    suggestions.style.display = 'none';
                }
            } catch (error) {
                suggestions.style.display = 'none';
            }
        }
      
        function clearSearch() {
            document.getElementById('searchInput').value = '';
            document.getElementById('searchClear').classList.remove('visible');
            state.isSearchMode = false;
            state.currentSearchQuery = '';
            switchTab('home');
        }
      
        function applyFilters() {
            state.genreFilter = document.getElementById('genreFilter').value;
            state.countryFilter = document.getElementById('countryFilter').value;
            state.yearFilter = document.getElementById('yearFilter').value;
            state.sort = document.getElementById('sortFilter').value;
            loadMovies();
        }
      
        // ==================== AI Assistant ====================
        function toggleAI() {
            document.getElementById('aiChat').classList.toggle('active');
        }
      
        function sendAIMessage() {
            const input = document.getElementById('aiInput');
            const messages = document.getElementById('aiMessages');
            const text = input.value.trim();
          
            if (!text) return;
          
            const userMsg = document.createElement('div');
            userMsg.className = 'ai-message user';
            userMsg.textContent = text;
            messages.appendChild(userMsg);
          
            input.value = '';
          
            setTimeout(() => {
                const botMsg = document.createElement('div');
                botMsg.className = 'ai-message bot';
              
                const responses = [
                    'Tôi gợi ý bạn xem "Thu Hút Mãnh Liệt" - một bộ phim hành động gay cấn với cốt truyện hấp dẫn!',
                    'Dựa trên sở thích của bạn, "Trung Quốc Kỳ Đàm" sẽ là lựa chọn tuyệt vời!',
                    'Phim "Thầy Giáo Địa Ngục Nube" đang rất hot. Bạn nên thử xem!',
                    'Bạn có thể tìm nhiều phim hay trong mục Phim Bộ và Phim Lẻ của chúng tôi!',
                    'Hãy dùng thanh tìm kiếm để khám phá hàng ngàn bộ phim chất lượng cao!'
                ];
              
                botMsg.textContent = responses[Math.floor(Math.random() * responses.length)];
                messages.appendChild(botMsg);
                messages.scrollTop = messages.scrollHeight;
            }, 500);
          
            messages.scrollTop = messages.scrollHeight;
        }
      
        // ==================== Mobile Menu ====================
        function toggleMobileMenu() {
            document.getElementById('navMenu').classList.toggle('mobile-active');
        }
      
        // ==================== Scroll Handling - FIXED ====================
        let lastScroll = 0;
        let scrollTimeout;
   
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
       
            scrollTimeout = setTimeout(() => {
                const navbar = document.getElementById('navbar');
                const currentScroll = window.pageYOffset;
           
                // Navbar hide/show
                if (currentScroll > 100) {
                    navbar.classList.add('scrolled');
                    if (currentScroll > lastScroll && currentScroll > 300) {
                        navbar.classList.add('hidden');
                    } else {
                        navbar.classList.remove('hidden');
                    }
                } else {
                    navbar.classList.remove('scrolled', 'hidden');
                }
           
                lastScroll = currentScroll;
           
                // Infinite scroll
                const scrollBottom = window.innerHeight + window.scrollY;
                const pageHeight = document.body.offsetHeight;
                const distanceFromBottom = pageHeight - scrollBottom;
           
                if (distanceFromBottom < 800) {
                    if (state.hasMore && !state.isLoading) {
                        console.log('🔄 Auto-loading more movies...', {
                            distanceFromBottom,
                            currentPage: state.currentPage,
                            hasMore: state.hasMore,
                            isLoading: state.isLoading
                        });
                        state.currentPage++;
                        loadMovies(true);
                    } else {
                        console.log('⏸️ Not loading:', {
                            hasMore: state.hasMore,
                            isLoading: state.isLoading,
                            isSearchMode: state.isSearchMode
                        });
                    }
                }
            }, 100);
        }, { passive: true });
   
        // ==================== Keyboard Shortcuts ====================
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closePlayer();
                const aiChat = document.getElementById('aiChat');
                if (aiChat.classList.contains('active')) {
                    toggleAI();
                }
            }
       
            if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
                e.preventDefault();
                document.getElementById('searchInput').focus();
            }
        });
   
        // ==================== Initialize ====================
        document.addEventListener('DOMContentLoaded', () => {
            initHero();
            loadMovies();
       
            // Search input
            const searchInput = document.getElementById('searchInput');
            searchInput.addEventListener('input', (e) => {
                handleSearch(e.target.value);
            });
       
            // Prevent zoom on mobile double tap
            let lastTouchEnd = 0;
            document.addEventListener('touchend', (e) => {
                const now = Date.now();
                if (now - lastTouchEnd <= 300) {
                    e.preventDefault();
                }
                lastTouchEnd = now;
            }, false);
          
            // User tabs
            document.querySelectorAll('.user-tab').forEach(tab => {
                tab.addEventListener('click', () => {
                    document.querySelectorAll('.user-tab').forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    document.querySelectorAll('.user-content').forEach(c => c.classList.remove('active'));
                    document.getElementById(tab.dataset.userTab + 'Content').classList.add('active');
                    loadUserContent(tab.dataset.userTab);
                });
            });
            loadUserContent('favorites');
          
            // Mode toggle
            if (localStorage.getItem('mode') === 'light') {
                document.body.classList.add('light-mode');
            }
        });
      
        function toggleFavorite(slug, event) {
            event.stopPropagation();
            const index = state.favorites.indexOf(slug);
            if (index > -1) {
                state.favorites.splice(index, 1);
            } else {
                state.favorites.push(slug);
            }
            localStorage.setItem('favorites', JSON.stringify(state.favorites));
            event.target.classList.toggle('favorited');
        }
      
        function addToHistory(slug) {
            if (!state.history.includes(slug)) {
                state.history.push(slug);
                localStorage.setItem('history', JSON.stringify(state.history));
            }
        }
      
        function saveContinueWatching(slug, episode) {
            state.continueWatching = state.continueWatching.filter(item => item.slug !== slug);
            state.continueWatching.push({slug, episode});
            localStorage.setItem('continueWatching', JSON.stringify(state.continueWatching));
        }
      
        function loadUserContent(type) {
            const content = document.getElementById(type + 'Content');
            content.innerHTML = '';
            let items = state[type === 'continue' ? 'continueWatching' : type];
            items.forEach(item => {
                const div = document.createElement('div');
                div.textContent = type === 'continue' ? item.slug + ' - Tập ' + (item.episode + 1) : item;
                div.onclick = () => openPlayer(type === 'continue' ? item.slug : item);
                content.appendChild(div);
            });
        }
      
        function loadRating(slug) {
            const stars = document.querySelectorAll('#ratingStars .star');
            const rating = state.ratings[slug] || 0;
            stars.forEach((star, index) => {
                star.classList.toggle('filled', index < rating);
                star.onclick = () => setRating(slug, index + 1);
            });
        }
      
        function setRating(slug, value) {
            state.ratings[slug] = value;
            localStorage.setItem('ratings', JSON.stringify(state.ratings));
            loadRating(slug);
        }
      
        function addComment() {
            const input = document.getElementById('commentInput');
            const text = input.value.trim();
            if (text) {
                if (!state.comments[state.currentMovieSlug]) {
                    state.comments[state.currentMovieSlug] = [];
                }
                state.comments[state.currentMovieSlug].push(text);
                localStorage.setItem('comments', JSON.stringify(state.comments));
                input.value = '';
                loadComments(state.currentMovieSlug);
            }
        }
      
        function loadComments(slug) {
            const list = document.getElementById('commentsList');
            list.innerHTML = '';
            const comments = state.comments[slug] || [];
            comments.forEach(comment => {
                const div = document.createElement('div');
                div.className = 'comment';
                div.textContent = comment;
                list.appendChild(div);
            });
        }
      
        // ==================== Performance Monitoring ====================
        if ('performance' in window) {
            window.addEventListener('load', () => {
                const perfData = performance.getEntriesByType('navigation')[0];
                console.log('⚡ Page Load:', Math.round(perfData.loadEventEnd - perfData.fetchStart), 'ms');
            });
        }
   
        // ==================== Service Worker (Optional) ====================
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                // Uncomment to enable offline support
                // navigator.serviceWorker.register('/sw.js');
            });
        }
