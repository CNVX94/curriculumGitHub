// Array of certificate images in the certificados folder
const certificateImages = [
    './resources/files/certificados/UC-GitHub.jpg',
    './resources/files/certificados/UCScrum.jpg',
    // Add more certificate images here
    // './resources/files/certificados/certificate2.jpg',
    // './resources/files/certificados/certificate3.jpg',
];

// Theme Toggle Functionality
(function() {
    const htmlElement = document.documentElement;
    
    // Check for saved theme preference or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    htmlElement.setAttribute('data-theme', savedTheme);
    
    // Update icon when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        const themeToggle = document.getElementById('themeToggle');
        const themeIcon = document.getElementById('themeIcon');
        
        // Set initial icon
        updateIcon(savedTheme);
        
        // Toggle theme on button click
        if (themeToggle) {
            themeToggle.addEventListener('click', function() {
                const currentTheme = htmlElement.getAttribute('data-theme');
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                
                htmlElement.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);
                updateIcon(newTheme);
            });
        }
        
        function updateIcon(theme) {
            if (themeIcon) {
                if (theme === 'dark') {
                    themeIcon.classList.remove('bi-moon-fill');
                    themeIcon.classList.add('bi-sun-fill');
                } else {
                    themeIcon.classList.remove('bi-sun-fill');
                    themeIcon.classList.add('bi-moon-fill');
                }
            }
        }
    });
})();

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  const carouselItems = document.querySelector('.carousel-inner');

  // Check if carousel exists
  if (!carouselItems) {
    console.error('Carousel container not found');
    return;
  }

  certificateImages.forEach((image, index) => {
    const item = document.createElement('div');
    item.classList.add('carousel-item');
    
    // Set first item as active
    if (index === 0) {
      item.classList.add('active');
    }

    // Create an img element for image display
    const img = document.createElement('img');
    img.src = image;
    img.classList.add('d-block', 'w-100');
    img.alt = `Certificado ${index + 1}`;
    img.style.maxHeight = '400px';
    img.style.objectFit = 'contain';

    // Add the image to the carousel item
    item.appendChild(img);

    // Append the carousel item to the carousel container
    carouselItems.appendChild(item);
  });

  // Initialize Bootstrap carousel
  const carouselElement = document.getElementById('carouselExample');
  if (carouselElement && typeof bootstrap !== 'undefined') {
    new bootstrap.Carousel(carouselElement);
  }
});