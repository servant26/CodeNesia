    // Update tanggal live
    function updateCurrentDate() {
      const now = new Date();
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      const formattedDate = now.toLocaleDateString('id-ID', options);
      currentDateElement.textContent = formattedDate;
    }

    // Theme Management
    function initTheme() {
      const savedTheme = localStorage.getItem('theme') || 'light';
      setTheme(savedTheme);
    }

    function setTheme(theme) {
      htmlElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
      
      if (theme === 'dark') {
        themeIcon.className = 'bi bi-moon';
      } else {
        themeIcon.className = 'bi bi-sun';
      }
    }

    function toggleTheme() {
      const currentTheme = htmlElement.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      setTheme(newTheme);
    }

    // Modal Functions
    function openModal(moduleNumber) {
      currentModule = moduleNumber;
      currentSlide = 0;
      slides = moduleContent[moduleNumber].slides;
      totalSlides = slides.length;
      
      // Update modal title
      modalModuleTitle.textContent = `Module ${moduleNumber}: ${moduleContent[moduleNumber].title}`;
      
      // Render slides
      renderSlides();
      
      // Show modal
      courseModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeModalFunc() {
      courseModal.classList.remove('active');
      document.body.style.overflow = 'auto';
    }

    function renderSlides() {
      modalBody.innerHTML = '';
      
      slides.forEach((slide, index) => {
        const slideElement = document.createElement('div');
        slideElement.className = `slide ${index === currentSlide ? 'active' : ''}`;
        slideElement.id = `slide-${index}`;
        
        let slideHTML = `<h2 class="slide-title">${slide.title}</h2>`;
        
        if (slide.video) {
          slideHTML += `
            <div class="video-container">
              <iframe src="${slide.video}" title="${slide.title}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </div>
          `;
        }
        
        slideHTML += `<div class="slide-content">${slide.content}</div>`;
        slideElement.innerHTML = slideHTML;
        
        modalBody.appendChild(slideElement);
      });
      
      updateSlides();
    }

    function updateSlides() {
      // Hide all slides
      document.querySelectorAll('.slide').forEach(slide => {
        slide.classList.remove('active');
      });
      
      // Show current slide
      document.getElementById(`slide-${currentSlide}`).classList.add('active');
      
      // Update slide indicator
      currentSlideEl.textContent = currentSlide + 1;
      totalSlidesEl.textContent = totalSlides;
      
      // Update button states
      prevBtn.disabled = currentSlide === 0;
      nextBtn.textContent = currentSlide === totalSlides - 1 ? 'Finish' : 'Next';
    }

    function nextSlide() {
      if (currentSlide < totalSlides - 1) {
        currentSlide++;
        updateSlides();
      } else {
        closeModalFunc();
      }
    }

    function prevSlide() {
      if (currentSlide > 0) {
        currentSlide--;
        updateSlides();
      }
    }

    // Utility
    const MOBILE_BREAK = 960;
    function isMobileLayout(){ return window.innerWidth <= MOBILE_BREAK; }

    // Ensure desktop view forces sidebar visible
    function ensureSidebarStateOnResize(){
      if(!isMobileLayout()){
        sidebar.style.display = '';
        // Hide mobile navbar on desktop
        if (mobileNavbar) {
          mobileNavbar.style.display = 'none';
        }
      } else {
        sidebar.style.display = 'none';
        // Show mobile navbar on mobile
        createMobileNavbar();
      }
    }

    // Highlight active nav link (click + scroll)
    function setActiveLinkByHash(hash){
      navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === hash));
      updateMobileNavbarActive(hash);
    }

    // On nav link click
    navLinks.forEach(a => {
      a.addEventListener('click', (ev) => {
        // Perbaikan: Scroll ke bagian yang dituju dengan offset yang tepat
        const targetId = a.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          // Hitung offset berdasarkan apakah di mobile atau desktop
          const offset = isMobileLayout() ? 120 : 80;
          const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
        
        setActiveLinkByHash(a.getAttribute('href'));
      });
    });

    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);

    // Keep sidebar state correct on resize (debounced)
    let resizeTO;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTO);
      resizeTO = setTimeout(() => {
        ensureSidebarStateOnResize();
      }, 120);
    });

    // ========== MOBILE NAVBAR FUNCTIONS ==========
    
    // Create mobile navbar from sidebar content
    function createMobileNavbar() {
      if (!isMobileLayout()) return;
      
      // Cek apakah navbar mobile sudah ada
      if (mobileNavbar.children.length > 0) {
        mobileNavbar.style.display = 'flex';
        return;
      }
      
      // Clone navigation dari sidebar
      const sideNav = document.querySelector('#mainNav').cloneNode(true);
      sideNav.classList.add('side-nav');
      
      // Hapus class active dari semua link
      sideNav.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        
        // Perbaikan: Tambahkan event listener yang sama untuk mobile navbar
        link.addEventListener('click', function(e) {
          const targetId = this.getAttribute('href').substring(1);
          const targetElement = document.getElementById(targetId);
          
          if (targetElement) {
            // Hitung offset untuk mobile
            const offset = 120;
            const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;
            
            window.scrollTo({
              top: targetPosition,
              behavior: 'smooth'
            });
          }
          
          setActiveLinkByHash(this.getAttribute('href'));
        });
      });
      
      // Buat scroll indicator
      const scrollIndicator = document.createElement('div');
      scrollIndicator.className = 'scroll-indicator';
      scrollIndicator.innerHTML = '<i class="bi bi-chevron-left"></i>';
      
      // Tambahkan ke mobile navbar
      mobileNavbar.innerHTML = '';
      mobileNavbar.appendChild(sideNav);
      mobileNavbar.appendChild(scrollIndicator);
      mobileNavbar.style.display = 'flex';
      
      // Handle scroll indicator visibility
      const navContainer = mobileNavbar.querySelector('.side-nav');
      function updateScrollIndicator() {
        const isScrollable = navContainer.scrollWidth > navContainer.clientWidth;
        const isAtEnd = navContainer.scrollLeft + navContainer.clientWidth >= navContainer.scrollWidth - 10;
        
        if (isScrollable && !isAtEnd) {
          scrollIndicator.classList.add('visible');
        } else {
          scrollIndicator.classList.remove('visible');
        }
      }
      
      navContainer.addEventListener('scroll', updateScrollIndicator);
      window.addEventListener('resize', updateScrollIndicator);
      updateScrollIndicator();
    }
    
    // Update active state di navbar mobile
    function updateMobileNavbarActive(hash) {
      if (!mobileNavbar) return;
      
      const mobileNavLinks = mobileNavbar.querySelectorAll('.nav-link');
      mobileNavLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === hash));
    }
    
    // Handle scroll behavior untuk mobile navbar
    let lastScrollTop = 0;
    function handleMobileNavbarScroll() {
      if (!isMobileLayout() || !mobileNavbar) return;
      
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      if (scrollTop > lastScrollTop && scrollTop > 100) {
        // Scroll down - hide navbar
        mobileNavbar.style.transform = 'translateY(-100%)';
      } else {
        // Scroll up - show navbar
        mobileNavbar.style.transform = 'translateY(0)';
      }
      
      lastScrollTop = scrollTop;
    }
    
    // Add scroll event listener untuk navbar mobile
    window.addEventListener('scroll', throttle(handleMobileNavbarScroll, 100));

    // initial state
    updateCurrentDate();
    ensureSidebarStateOnResize();
    initTheme();

    // Scroll spy-ish: update active menu by viewport section
    const sections = Array.from(document.querySelectorAll('section[id]'));
    function onScrollSpy(){
      const fromTop = window.scrollY + 120;
      let current = '#top';
      for(const s of sections){
        if(s.offsetTop <= fromTop) current = '#' + s.id;
      }
      setActiveLinkByHash(current);
    }
    document.addEventListener('scroll', throttle(onScrollSpy, 150));
    onScrollSpy();

    // debounce helper
    function throttle(fn, wait){
      let t = null;
      return function(...args){
        if(t) return;
        t = setTimeout(() => { 
          fn.apply(this,args); 
          clearTimeout(t); 
          t = null; 
        }, wait);
      };
    }

    // Module click event
    moduleItems.forEach(item => {
      item.addEventListener('click', function() {
        const moduleNumber = this.getAttribute('data-module');
        
        // Set active module
        moduleItems.forEach(m => m.classList.remove('active'));
        this.classList.add('active');
        
        // Open modal
        openModal(moduleNumber);
      });
    });

    // Modal events
    closeModal.addEventListener('click', closeModalFunc);
    prevBtn.addEventListener('click', prevSlide);
    nextBtn.addEventListener('click', nextSlide);

    // Close modal when clicking outside content
    courseModal.addEventListener('click', function(e) {
      if (e.target === courseModal) {
        closeModalFunc();
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
      if (courseModal.classList.contains('active')) {
        if (e.key === 'Escape') {
          closeModalFunc();
        } else if (e.key === 'ArrowLeft') {
          prevSlide();
        } else if (e.key === 'ArrowRight') {
          nextSlide();
        }
      }
    });