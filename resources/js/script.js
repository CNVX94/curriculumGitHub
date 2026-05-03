// Array of certificate images in the certificados folder | Array con las imágenes de los certificados en la carpeta certificados
const certificateImages = [
    './resources/files/certificados/UC-GitHub.jpg',
    './resources/files/certificados/UCScrum.jpg',
    // Add more certificate images here
    // './resources/files/certificados/certificate2.jpg',
    // './resources/files/certificados/certificate3.jpg',
];

// Theme Toggle Functionality | Funcionalidad de cambio de tema
(function() {
    const htmlElement = document.documentElement;
    
    // Check for saved theme preference or default to light | Verificar la preferencia de tema guardada o usar el tema claro por defecto
    const savedTheme = localStorage.getItem('theme') || 'light';
    htmlElement.setAttribute('data-theme', savedTheme);
    
    // Update icon when DOM is ready | Actualizar el ícono cuando el DOM esté listo
    document.addEventListener('DOMContentLoaded', function() {
        const themeToggle = document.getElementById('themeToggle');
        const themeIcon = document.getElementById('themeIcon');
        
        // Set initial icon based on saved theme | Establecer el ícono inicial según el tema guardado
        updateIcon(savedTheme);
        
        // Toggle theme on button click | Cambiar el tema al hacer clic en el botón
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

// Wait for DOM to be fully loaded | Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
  const carouselItems = document.querySelector('.carousel-inner');

  // Check if carousel exists | Verificar si el carrusel existe
  if (!carouselItems) {
    console.error('Carousel container not found');
    return;
  }

  certificateImages.forEach((image, index) => {
    const item = document.createElement('div');
    item.classList.add('carousel-item');
    
    // Set first item as active | Establecer el primer elemento como activo
    if (index === 0) {
      item.classList.add('active');
    }

    // Create an img element for image display | Crear un elemento img para mostrar la imagen
    const img = document.createElement('img');
    img.src = image;
    img.classList.add('d-block', 'w-100');
    img.alt = `Certificado ${index + 1}`;
    img.style.maxHeight = '400px';
    img.style.objectFit = 'contain';

    // Add the image to the carousel item |    Agregar la imagen al elemento del carrusel
    item.appendChild(img);

    // Append the carousel item to the carousel container | Agregar el elemento del carrusel al contenedor del carrusel
    carouselItems.appendChild(item);
  });

  // Initialize Bootstrap carousel | Inicializar el carrusel de Bootstrap
  const carouselElement = document.getElementById('carouselExample');
  if (carouselElement && typeof bootstrap !== 'undefined') {
    new bootstrap.Carousel(carouselElement);
  }
});