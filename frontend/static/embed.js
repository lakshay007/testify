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
                height: '200px',
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
            iframe.src = `http://localhost:5173/embed/${spaceName}?${queryParams}`;
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
        }
    };

    window.TestifyWidget = TestifyWidget;
})();