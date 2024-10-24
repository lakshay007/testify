(function() {
    const TestifyWidget = {
        init: async function(spaceName, options = {}) {
            if (!spaceName) {
                console.error('Testify: Space name is required');
                return;
            }

            const container = document.getElementById('testify-testimonials');
            if (!container) {
                console.error('Testify: Container element #testify-testimonials not found');
                return;
            }

            // Set default options
            const defaultOptions = {
                theme: 'light',
                width: '100%',
                height: '500px',
                autoplay: true,
                delay: 5000,
                slidesPerView: 'auto'
            };
            const finalOptions = { ...defaultOptions, ...options };

            // Create and inject iframe
            const iframe = document.createElement('iframe');
            iframe.id = `testify-carousel-${spaceName}`;
            const queryParams = new URLSearchParams({
                theme: finalOptions.theme,
                autoplay: finalOptions.autoplay,
                delay: finalOptions.delay,
                slidesPerView: finalOptions.slidesPerView
            }).toString();
            iframe.src = `http://localhost:5173/carousel/${spaceName}?${queryParams}`;
            iframe.frameBorder = '0';
            iframe.scrolling = 'no';
            iframe.width = finalOptions.width;
            iframe.height = finalOptions.height;
            iframe.style.width = '1px';
            iframe.style.minWidth = '100%';
            iframe.style.border = 'none';
            
            container.innerHTML = ''; // Clear container
            container.appendChild(iframe);

            // Load iframeResizer
            this.loadIframeResizer(iframe.id);

            // Add event listener for theme changes
            window.addEventListener('message', (event) => {
                if (event.data.type === 'testify-theme-change') {
                    this.updateTheme(event.data.theme);
                }
            });
        },

        loadIframeResizer: function(iframeId) {
            if (!window.iFrameResize) {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/iframe-resizer/4.3.6/iframeResizer.min.js';
                script.onload = () => {
                    this.initIframeResizer(iframeId);
                };
                document.head.appendChild(script);
            } else {
                this.initIframeResizer(iframeId);
            }
        },

        initIframeResizer: function(iframeId) {
            window.iFrameResize({ 
                log: false, 
                checkOrigin: false,
                sizeHeight: true, // Enable height resizing
                onMessage: ({ message }) => {
                    if (message.type === 'testify-height-update') {
                        document.getElementById(iframeId).style.height = `${message.height}px`;
                    }
                }
            }, `#${iframeId}`);
        },

        updateTheme: function(theme) {
            const iframe = document.getElementById(`testify-carousel-${this.spaceName}`);
            if (iframe) {
                const url = new URL(iframe.src);
                url.searchParams.set('theme', theme);
                iframe.src = url.toString();
            }
        },

        initWall: async function(spaceName, options = {}) {
            if (!spaceName) {
                console.error('Testify: Space name is required');
                return;
            }

            const container = document.getElementById('testify-wall');
            if (!container) {
                console.error('Testify: Container element #testify-wall not found');
                return;
            }
            container.style.height = '100vh';
            container.style.overflow = 'visible';

            // Set default options
            const defaultOptions = {
                theme: 'light',
                width: '100%',
                height: '100%', // Set to 100vh to occupy full viewport height
                columns: 3 // Default number of columns
            };
            const finalOptions = { ...defaultOptions, ...options };

            // Create and inject iframe
            const iframe = document.createElement('iframe');
            iframe.id = `testify-wall-${spaceName}`;
            const queryParams = new URLSearchParams({
                theme: finalOptions.theme,
                columns: finalOptions.columns
            }).toString();
            iframe.src = `http://localhost:5173/wall/${spaceName}?${queryParams}`;
            iframe.frameBorder = '0';
            iframe.scrolling = 'yes'; // Allow scrolling within the iframe
            iframe.width = finalOptions.width;
            iframe.height = finalOptions.height; // Use the height from options
            iframe.style.width = '1px';
            iframe.style.minWidth = '100%';
            iframe.style.border = 'none';
            iframe.style.overflow = 'visible'; // Ensure overflow is handled

            container.innerHTML = ''; // Clear container
            container.appendChild(iframe);

            // Load iframeResizer
            this.loadIframeResizer(iframe.id);
        }
    };

    window.TestifyWidget = TestifyWidget;
})();
