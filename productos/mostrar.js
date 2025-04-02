// Función para cargar los productos
async function cargarProductos() {
    try {
        const response = await fetch('http://localhost:3000/productos');
        if (!response.ok) {
            throw new Error('Error al obtener los productos');
        }
        const productos = await response.json(); // Convertimos la respuesta a JSON

        // Contenedores de productos por sección
        const productosPerros = document.getElementById('perros');
        const productosGatos = document.getElementById('gatos');
        const productosOfertas = document.getElementById('ofertas');
        const productosOtros = document.getElementById('otros');

        // Limpiar contenido previo en cada contenedor
        productosPerros.innerHTML = '';
        productosGatos.innerHTML = '';
        productosOfertas.innerHTML = '';
        productosOtros.innerHTML = '';

        if (productos.length === 0) {
            productosPerros.innerHTML = '<p>No se encontraron productos.</p>';
            productosGatos.innerHTML = '<p>No se encontraron productos.</p>';
            productosOfertas.innerHTML = '<p>No se encontraron productos.</p>';
            productosOtros.innerHTML = '<p>No se encontraron productos.</p>';
            return;
        }

        // Recorremos todos los productos y los mostramos en su sección correspondiente
        productos.forEach(producto => {
            const productoDiv = document.createElement('div');
            productoDiv.classList.add('producto'); // Agregamos clase al div del producto

            // Calculamos el descuento
            const precioOriginal = parseFloat(producto.precio);
            const precioDescuento = parseFloat(producto.precio_descuento);
            const descuento = precioOriginal - precioDescuento;
            const porcentajeDescuento = (descuento / precioOriginal) * 100;

            // Rellenamos el contenido con la información de cada producto
            productoDiv.innerHTML = `

            <div class="producto-contenedor">
                 <a class="dos" href="${producto.id}.html">
                <div>
                    <div class="oferta">${precioDescuento ? `<span class="descuento">${Math.round(porcentajeDescuento)}% OFF</span>` : ''}</div>
                    <img src="/uploads/${producto.imagen}" alt="${producto.nombre}">
                    <h3>${producto.nombre}</h3>
                    <div class="precios">
                        <p class="precio-original">${precioDescuento ? `$ ${producto.precio}` : ''}</p>
                        <p class="precio-descuento">$ ${producto.precio_descuento || producto.precio}</p>
                    </div>
                    <p>${producto.descripcion}</p>
                </div>
            </a>

            <!-- Botón para agregar al carrito con atributos data-* -->
            <div>
                <button class="botoncarrito"
                    data-id="${producto.id}"
                    data-nombre="${producto.nombre}"
                    data-precio="${producto.precio}"
                    data-precio_descuento="${producto.precio_descuento || 'null'}"
                    data-imagen="${producto.imagen}"
                    onclick="agregarAlCarrito(event)">
                    <img class="shop" src="/img/shopping_cart_24dp_E8EAED_FILL0_wght400_GRAD0_opsz24.png" alt="">
                </button>
            </div>
            </div>
            
            `;

            // Determinar el contenedor adecuado según la sección
            switch (producto.seccion) {
                case 'perros':
                    productosPerros.appendChild(productoDiv);
                    break;
                case 'gatos':
                    productosGatos.appendChild(productoDiv);
                    break;
                case 'ofertas':
                    productosOfertas.appendChild(productoDiv);
                    break;
                case 'otros':
                    productosOtros.appendChild(productoDiv);
                    break;
                default:
                    console.log('Sección no encontrada:', producto.seccion);
            }
        });
    } catch (error) {
        console.error('Error al cargar los productos:', error);
        const productosContainer = document.getElementById('productos');
        productosContainer.innerHTML = '<p>Hubo un error al cargar los productos.</p>';
    }
}

// Función para agregar al carrito (previamente definida)
function agregarAlCarrito(event) {
    event.stopPropagation(); // Evita que se ejecute el enlace <a>
    const button = event.target.closest('button'); // Encuentra el botón
    const producto = {
        id: button.getAttribute('data-id'),
        nombre: button.getAttribute('data-nombre'),
        precio: button.getAttribute('data-precio'),
        precio_descuento: button.getAttribute('data-precio_descuento'),
        imagen: button.getAttribute('data-imagen')
    };
    // Lógica para agregar el producto al carrito (puedes modificar según tu implementación)
    console.log('Producto agregado al carrito:', producto);
}

// Cargar los productos cuando la página se haya cargado
window.onload = cargarProductos;
